import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngestDto, IngestResponseDto } from './dto/ingest.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ingest(
    dto: CreateIngestDto,
    idempotencyKey: string,
  ): Promise<IngestResponseDto> {
    const existingBatch = await this.prisma.ingestBatch.findUnique({
      where: { idempotencyKey },
      include: { site: { select: { totalEmissionsToDate: true } } },
    });

    if (existingBatch) {
      this.logger.warn(
        `Duplicate ingest request rejected: idempotencyKey=${idempotencyKey}`,
      );
      return {
        batchId: existingBatch.id,
        siteId: existingBatch.siteId,
        recordCount: existingBatch.recordCount,
        totalValue: existingBatch.totalValue.toNumber(),
        newSiteTotal: existingBatch.site.totalEmissionsToDate.toNumber(),
        duplicate: true,
      };
    }

    const batchTotal = dto.readings.reduce((sum, r) => sum + r.value, 0);

    return this.prisma.$transaction(async (tx) => {
      const lockedSites = await tx.$queryRaw<
        Array<{
          id: string;
          name: string;
          emission_limit: Prisma.Decimal;
          total_emissions_to_date: Prisma.Decimal;
        }>
      >`SELECT id, name, emission_limit, total_emissions_to_date
        FROM sites
        WHERE id = ${dto.siteId}::uuid
        FOR UPDATE`;

      if (lockedSites.length === 0) {
        throw new NotFoundException(`Site with id "${dto.siteId}" not found`);
      }

      const site = lockedSites[0];

      const batch = await tx.ingestBatch.create({
        data: {
          siteId: dto.siteId,
          idempotencyKey,
          recordCount: dto.readings.length,
          totalValue: new Prisma.Decimal(batchTotal),
        },
      });

      await tx.measurement.createMany({
        data: dto.readings.map((r) => ({
          siteId: dto.siteId,
          batchId: batch.id,
          value: new Prisma.Decimal(r.value),
          unit: r.unit,
          recordedAt: new Date(r.recordedAt),
        })),
      });

      const previousTotal = site.total_emissions_to_date.toNumber();
      const newTotal = previousTotal + batchTotal;

      await tx.site.update({
        where: { id: dto.siteId },
        data: {
          totalEmissionsToDate: new Prisma.Decimal(newTotal),
        },
      });

      const emissionLimit = site.emission_limit.toNumber();
      if (
        previousTotal <= emissionLimit &&
        newTotal > emissionLimit
      ) {
        await tx.outboxEvent.create({
          data: {
            eventType: 'EMISSION_LIMIT_EXCEEDED',
            aggregateId: dto.siteId,
            payload: {
              siteId: dto.siteId,
              siteName: site.name,
              emissionLimit,
              previousTotal,
              newTotal,
              exceededBy: newTotal - emissionLimit,
              batchId: batch.id,
            },
          },
        });

        this.logger.warn(
          `Site "${site.name}" (${dto.siteId}) exceeded emission limit: ${newTotal}/${emissionLimit}`,
        );
      }

      await tx.outboxEvent.create({
        data: {
          eventType: 'BATCH_INGESTED',
          aggregateId: dto.siteId,
          payload: {
            siteId: dto.siteId,
            batchId: batch.id,
            recordCount: dto.readings.length,
            totalValue: batchTotal,
            newSiteTotal: newTotal,
          },
        },
      });

      return {
        batchId: batch.id,
        siteId: dto.siteId,
        recordCount: dto.readings.length,
        totalValue: batchTotal,
        newSiteTotal: newTotal,
        duplicate: false,
      };
    });
  }
}
