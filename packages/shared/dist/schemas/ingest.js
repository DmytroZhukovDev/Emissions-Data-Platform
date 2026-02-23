"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestResponseSchema = exports.CreateIngestSchema = exports.ReadingSchema = void 0;
const zod_1 = require("zod");
// ── Request Schemas ─────────────────────────────────────────
exports.ReadingSchema = zod_1.z.object({
    value: zod_1.z.number().positive('Measurement value must be positive'),
    unit: zod_1.z.string().default('kg'),
    recordedAt: zod_1.z
        .string()
        .datetime({ message: 'recordedAt must be a valid ISO 8601 datetime' }),
});
exports.CreateIngestSchema = zod_1.z.object({
    siteId: zod_1.z.string().uuid('siteId must be a valid UUID'),
    readings: zod_1.z
        .array(exports.ReadingSchema)
        .min(1, 'At least one reading is required')
        .max(100, 'Maximum 100 readings per batch'),
});
// ── Response Schemas ────────────────────────────────────────
exports.IngestResponseSchema = zod_1.z.object({
    batchId: zod_1.z.string().uuid(),
    siteId: zod_1.z.string().uuid(),
    recordCount: zod_1.z.number().int(),
    totalValue: zod_1.z.number(),
    newSiteTotal: zod_1.z.number(),
    duplicate: zod_1.z.boolean(),
});
//# sourceMappingURL=ingest.js.map