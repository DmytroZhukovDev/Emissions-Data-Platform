import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSiteDto,
  SiteResponseDto,
  SiteMetricsDto,
} from './dto/sites.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSiteDto): Promise<SiteResponseDto> {
    const site = await this.prisma.site.create({
      data: {
        name: dto.name,
        location: dto.location,
        emissionLimit: new Prisma.Decimal(dto.emissionLimit),
        metadata: dto.metadata
          ? (dto.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });

    return this.toResponse(site);
  }

  async findAll(): Promise<SiteResponseDto[]> {
    const sites = await this.prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return sites.map((s) => this.toResponse(s));
  }

  async findOne(id: string): Promise<SiteResponseDto> {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) {
      throw new NotFoundException(`Site with id "${id}" not found`);
    }
    return this.toResponse(site);
  }

  async getMetrics(id: string): Promise<SiteMetricsDto> {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site) {
      throw new NotFoundException(`Site with id "${id}" not found`);
    }

    const [measurementCount, batchCount, lastBatch] = await Promise.all([
      this.prisma.measurement.count({ where: { siteId: id } }),
      this.prisma.ingestBatch.count({ where: { siteId: id } }),
      this.prisma.ingestBatch.findFirst({
        where: { siteId: id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const totalEmissions = site.totalEmissionsToDate.toNumber();
    const emissionLimit = site.emissionLimit.toNumber();
    const utilizationPercentage =
      emissionLimit > 0 ? (totalEmissions / emissionLimit) * 100 : 0;

    return {
      siteId: site.id,
      siteName: site.name,
      location: site.location,
      emissionLimit,
      totalEmissions,
      complianceStatus:
        totalEmissions > emissionLimit ? 'LIMIT_EXCEEDED' : 'WITHIN_LIMIT',
      utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
      measurementCount,
      batchCount,
      lastIngestionAt: lastBatch?.createdAt.toISOString() ?? null,
    };
  }

  private toResponse(site: {
    id: string;
    name: string;
    location: string | null;
    emissionLimit: Prisma.Decimal;
    totalEmissionsToDate: Prisma.Decimal;
    metadata: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  }): SiteResponseDto {
    return {
      id: site.id,
      name: site.name,
      location: site.location,
      emissionLimit: site.emissionLimit.toNumber(),
      totalEmissionsToDate: site.totalEmissionsToDate.toNumber(),
      metadata: site.metadata,
      createdAt: site.createdAt.toISOString(),
      updatedAt: site.updatedAt.toISOString(),
    };
  }
}
