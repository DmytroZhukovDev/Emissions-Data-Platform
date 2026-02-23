import { z } from 'zod';

// ── Request Schemas ─────────────────────────────────────────

export const CreateSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(255),
  location: z.string().max(500).optional(),
  emissionLimit: z
    .number()
    .positive('Emission limit must be positive')
    .max(999_999_999_999, 'Emission limit is too large'),
  metadata: z.record(z.unknown()).optional(),
});

// ── Response Schemas ────────────────────────────────────────

export const ComplianceStatus = z.enum(['WITHIN_LIMIT', 'LIMIT_EXCEEDED']);

export const SiteResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  location: z.string().nullable(),
  emissionLimit: z.number(),
  totalEmissionsToDate: z.number(),
  metadata: z.unknown().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SiteMetricsSchema = z.object({
  siteId: z.string().uuid(),
  siteName: z.string(),
  location: z.string().nullable(),
  emissionLimit: z.number(),
  totalEmissions: z.number(),
  complianceStatus: ComplianceStatus,
  utilizationPercentage: z.number(),
  measurementCount: z.number(),
  batchCount: z.number(),
  lastIngestionAt: z.string().datetime().nullable(),
});

// ── Inferred Types ──────────────────────────────────────────

export type CreateSiteDto = z.infer<typeof CreateSiteSchema>;
export type SiteResponse = z.infer<typeof SiteResponseSchema>;
export type SiteMetrics = z.infer<typeof SiteMetricsSchema>;
export type ComplianceStatusType = z.infer<typeof ComplianceStatus>;
