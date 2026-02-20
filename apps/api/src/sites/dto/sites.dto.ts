import { z } from 'zod';

export const CreateSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(255),
  location: z.string().max(500).optional(),
  emissionLimit: z
    .number()
    .positive('Emission limit must be positive')
    .max(999_999_999_999, 'Emission limit is too large'),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateSiteDto = z.infer<typeof CreateSiteSchema>;

export interface SiteResponseDto {
  id: string;
  name: string;
  location: string | null;
  emissionLimit: number;
  totalEmissionsToDate: number;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface SiteMetricsDto {
  siteId: string;
  siteName: string;
  location: string | null;
  emissionLimit: number;
  totalEmissions: number;
  complianceStatus: 'WITHIN_LIMIT' | 'LIMIT_EXCEEDED';
  utilizationPercentage: number;
  measurementCount: number;
  batchCount: number;
  lastIngestionAt: string | null;
}
