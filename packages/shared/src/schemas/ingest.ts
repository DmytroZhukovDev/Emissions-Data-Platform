import { z } from 'zod';

// ── Request Schemas ─────────────────────────────────────────

export const ReadingSchema = z.object({
  value: z.number().positive('Measurement value must be positive'),
  unit: z.string().default('kg'),
  recordedAt: z
    .string()
    .datetime({ message: 'recordedAt must be a valid ISO 8601 datetime' }),
});

export const CreateIngestSchema = z.object({
  siteId: z.string().uuid('siteId must be a valid UUID'),
  readings: z
    .array(ReadingSchema)
    .min(1, 'At least one reading is required')
    .max(100, 'Maximum 100 readings per batch'),
});

// ── Response Schemas ────────────────────────────────────────

export const IngestResponseSchema = z.object({
  batchId: z.string().uuid(),
  siteId: z.string().uuid(),
  recordCount: z.number().int(),
  totalValue: z.number(),
  newSiteTotal: z.number(),
  duplicate: z.boolean(),
});

// ── Inferred Types ──────────────────────────────────────────

export type Reading = z.infer<typeof ReadingSchema>;
export type CreateIngestDto = z.infer<typeof CreateIngestSchema>;
export type IngestResponse = z.infer<typeof IngestResponseSchema>;
