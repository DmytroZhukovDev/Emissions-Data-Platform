import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Sites (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.measurement.deleteMany();
    await prisma.ingestBatch.deleteMany();
    await prisma.outboxEvent.deleteMany();
    await prisma.site.deleteMany();
  });

  afterAll(async () => {
    await prisma.measurement.deleteMany();
    await prisma.ingestBatch.deleteMany();
    await prisma.outboxEvent.deleteMany();
    await prisma.site.deleteMany();
    await app.close();
  });

  describe('POST /sites', () => {
    it('should create a site with valid data', async () => {
      const res = await request(app.getHttpServer())
        .post('/sites')
        .send({
          name: 'Test Site',
          location: 'Calgary, AB',
          emissionLimit: 5000,
          metadata: { operator: 'TestCo' },
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        name: 'Test Site',
        location: 'Calgary, AB',
        emissionLimit: 5000,
        totalEmissionsToDate: 0,
        metadata: { operator: 'TestCo' },
      });
      expect(res.body.data.id).toBeDefined();
    });

    it('should create a site without optional fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/sites')
        .send({ name: 'Minimal Site', emissionLimit: 1000 })
        .expect(201);

      expect(res.body.data.location).toBeNull();
      expect(res.body.data.metadata).toBeNull();
    });

    it('should reject missing name', async () => {
      const res = await request(app.getHttpServer())
        .post('/sites')
        .send({ emissionLimit: 5000 })
        .expect(422);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
        ]),
      );
    });

    it('should reject negative emission limit', async () => {
      const res = await request(app.getHttpServer())
        .post('/sites')
        .send({ name: 'Bad Site', emissionLimit: -100 })
        .expect(422);

      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'emissionLimit' }),
        ]),
      );
    });
  });

  describe('GET /sites', () => {
    it('should return an empty list when no sites exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/sites')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return all sites ordered by createdAt desc', async () => {
      await request(app.getHttpServer())
        .post('/sites')
        .send({ name: 'Site A', emissionLimit: 1000 });
      await request(app.getHttpServer())
        .post('/sites')
        .send({ name: 'Site B', emissionLimit: 2000 });

      const res = await request(app.getHttpServer())
        .get('/sites')
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe('Site B');
      expect(res.body.data[1].name).toBe('Site A');
    });
  });

  describe('GET /sites/:id', () => {
    it('should return a site by id', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/sites')
        .send({ name: 'Find Me', emissionLimit: 3000 });

      const id = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/sites/${id}`)
        .expect(200);

      expect(res.body.data.name).toBe('Find Me');
    });

    it('should return 404 for non-existent site', async () => {
      const res = await request(app.getHttpServer())
        .get('/sites/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /sites/:id/metrics', () => {
    it('should return metrics for a site with no ingestions', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/sites')
        .send({ name: 'Fresh Site', emissionLimit: 10000 });

      const id = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/sites/${id}/metrics`)
        .expect(200);

      expect(res.body.data).toMatchObject({
        siteId: id,
        siteName: 'Fresh Site',
        emissionLimit: 10000,
        totalEmissions: 0,
        complianceStatus: 'WITHIN_LIMIT',
        utilizationPercentage: 0,
        measurementCount: 0,
        batchCount: 0,
        lastIngestionAt: null,
      });
    });

    it('should show LIMIT_EXCEEDED when over limit', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/sites')
        .send({ name: 'Over Limit', emissionLimit: 100 });

      const id = createRes.body.data.id;

      await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'metrics-test-batch')
        .send({
          siteId: id,
          readings: [
            { value: 60, recordedAt: '2026-01-01T00:00:00Z' },
            { value: 60, recordedAt: '2026-01-01T01:00:00Z' },
          ],
        });

      const res = await request(app.getHttpServer())
        .get(`/sites/${id}/metrics`)
        .expect(200);

      expect(res.body.data.totalEmissions).toBe(120);
      expect(res.body.data.complianceStatus).toBe('LIMIT_EXCEEDED');
      expect(res.body.data.utilizationPercentage).toBe(120);
      expect(res.body.data.measurementCount).toBe(2);
      expect(res.body.data.batchCount).toBe(1);
      expect(res.body.data.lastIngestionAt).toBeDefined();
    });

    it('should return 404 for non-existent site', async () => {
      await request(app.getHttpServer())
        .get('/sites/00000000-0000-0000-0000-000000000000/metrics')
        .expect(404);
    });
  });
});
