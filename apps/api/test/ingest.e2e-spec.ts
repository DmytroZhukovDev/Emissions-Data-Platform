import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Ingest (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testSiteId: string;

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

    const site = await prisma.site.create({
      data: {
        name: 'Test Site',
        emissionLimit: 1000,
      },
    });
    testSiteId = site.id;
  });

  afterAll(async () => {
    await prisma.measurement.deleteMany();
    await prisma.ingestBatch.deleteMany();
    await prisma.outboxEvent.deleteMany();
    await prisma.site.deleteMany();
    await app.close();
  });

  describe('POST /ingest', () => {
    it('should ingest a batch of readings successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'batch-001')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 10.5, recordedAt: '2026-01-15T08:00:00Z' },
            { value: 20.3, recordedAt: '2026-01-15T09:00:00Z' },
            { value: 5.2, recordedAt: '2026-01-15T10:00:00Z' },
          ],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        siteId: testSiteId,
        recordCount: 3,
        totalValue: 36,
        newSiteTotal: 36,
        duplicate: false,
      });
      expect(res.body.data.batchId).toBeDefined();

      const site = await prisma.site.findUnique({
        where: { id: testSiteId },
      });
      expect(site!.totalEmissionsToDate.toNumber()).toBe(36);

      const measurements = await prisma.measurement.findMany({
        where: { siteId: testSiteId },
      });
      expect(measurements).toHaveLength(3);
    });

    it('should return cached response for duplicate idempotency key', async () => {
      await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'dup-key-001')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 50, recordedAt: '2026-01-15T08:00:00Z' },
          ],
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'dup-key-001')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 50, recordedAt: '2026-01-15T08:00:00Z' },
          ],
        })
        .expect(201);

      expect(res.body.data.duplicate).toBe(true);
      expect(res.body.data.recordCount).toBe(1);
      expect(res.body.data.totalValue).toBe(50);

      const site = await prisma.site.findUnique({
        where: { id: testSiteId },
      });
      expect(site!.totalEmissionsToDate.toNumber()).toBe(50);

      const measurements = await prisma.measurement.count({
        where: { siteId: testSiteId },
      });
      expect(measurements).toBe(1);
    });

    it('should not double-count emissions on retry', async () => {
      const payload = {
        siteId: testSiteId,
        readings: [
          { value: 100, recordedAt: '2026-01-15T08:00:00Z' },
          { value: 200, recordedAt: '2026-01-15T09:00:00Z' },
        ],
      };

      await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'no-double-count')
        .send(payload)
        .expect(201);

      // Simulate 5 retries
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/ingest')
          .set('X-Idempotency-Key', 'no-double-count')
          .send(payload);
      }

      const site = await prisma.site.findUnique({
        where: { id: testSiteId },
      });
      expect(site!.totalEmissionsToDate.toNumber()).toBe(300);

      const count = await prisma.measurement.count({
        where: { siteId: testSiteId },
      });
      expect(count).toBe(2);
    });

    it('should accumulate emissions across multiple batches', async () => {
      await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'multi-batch-1')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 100, recordedAt: '2026-01-15T08:00:00Z' },
          ],
        });

      await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'multi-batch-2')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 250, recordedAt: '2026-01-15T09:00:00Z' },
          ],
        });

      const res = await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'multi-batch-3')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 150, recordedAt: '2026-01-15T10:00:00Z' },
          ],
        })
        .expect(201);

      expect(res.body.data.newSiteTotal).toBe(500);
    });

    it('should create EMISSION_LIMIT_EXCEEDED outbox event when crossing threshold', async () => {
      await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'limit-exceed-batch')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 600, recordedAt: '2026-01-15T08:00:00Z' },
            { value: 600, recordedAt: '2026-01-15T09:00:00Z' },
          ],
        })
        .expect(201);

      const events = await prisma.outboxEvent.findMany({
        where: {
          aggregateId: testSiteId,
          eventType: 'EMISSION_LIMIT_EXCEEDED',
        },
      });
      expect(events).toHaveLength(1);
      expect((events[0].payload as any).newTotal).toBe(1200);
      expect((events[0].payload as any).emissionLimit).toBe(1000);
    });

    it('should always create BATCH_INGESTED outbox event', async () => {
      await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'outbox-check')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 10, recordedAt: '2026-01-15T08:00:00Z' },
          ],
        })
        .expect(201);

      const events = await prisma.outboxEvent.findMany({
        where: {
          aggregateId: testSiteId,
          eventType: 'BATCH_INGESTED',
        },
      });
      expect(events).toHaveLength(1);
    });

    it('should reject request without idempotency key', async () => {
      const res = await request(app.getHttpServer())
        .post('/ingest')
        .send({
          siteId: testSiteId,
          readings: [
            { value: 10, recordedAt: '2026-01-15T08:00:00Z' },
          ],
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Idempotency-Key');
    });

    it('should reject invalid siteId', async () => {
      const res = await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'bad-site')
        .send({
          siteId: 'not-a-uuid',
          readings: [
            { value: 10, recordedAt: '2026-01-15T08:00:00Z' },
          ],
        })
        .expect(422);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject empty readings array', async () => {
      const res = await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'empty-readings')
        .send({ siteId: testSiteId, readings: [] })
        .expect(422);

      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'readings' }),
        ]),
      );
    });

    it('should reject negative measurement values', async () => {
      const res = await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'negative-val')
        .send({
          siteId: testSiteId,
          readings: [
            { value: -5, recordedAt: '2026-01-15T08:00:00Z' },
          ],
        })
        .expect(422);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent site', async () => {
      const res = await request(app.getHttpServer())
        .post('/ingest')
        .set('X-Idempotency-Key', 'no-such-site')
        .send({
          siteId: '00000000-0000-0000-0000-000000000000',
          readings: [
            { value: 10, recordedAt: '2026-01-15T08:00:00Z' },
          ],
        })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should handle concurrent ingestion without data corruption', async () => {
      const batches = Array.from({ length: 10 }, (_, i) => ({
        key: `concurrent-batch-${i}`,
        value: 50,
      }));

      const results = await Promise.all(
        batches.map((b) =>
          request(app.getHttpServer())
            .post('/ingest')
            .set('X-Idempotency-Key', b.key)
            .send({
              siteId: testSiteId,
              readings: [
                { value: b.value, recordedAt: '2026-01-15T08:00:00Z' },
              ],
            }),
        ),
      );

      const allSucceeded = results.every((r) => r.status === 201);
      expect(allSucceeded).toBe(true);

      const site = await prisma.site.findUnique({
        where: { id: testSiteId },
      });
      expect(site!.totalEmissionsToDate.toNumber()).toBe(500);

      const totalMeasurements = await prisma.measurement.count({
        where: { siteId: testSiteId },
      });
      expect(totalMeasurements).toBe(10);
    });
  });
});
