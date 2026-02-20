import { z } from 'zod';

const ReadingSchema = z.object({
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

export type CreateIngestDto = z.infer<typeof CreateIngestSchema>;

export interface IngestResponseDto {
  batchId: string;
  siteId: string;
  recordCount: number;
  totalValue: number;
  newSiteTotal: number;
  duplicate: boolean;
}
