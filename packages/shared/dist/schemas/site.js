"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteMetricsSchema = exports.SiteResponseSchema = exports.ComplianceStatus = exports.CreateSiteSchema = void 0;
const zod_1 = require("zod");
// ── Request Schemas ─────────────────────────────────────────
exports.CreateSiteSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Site name is required').max(255),
    location: zod_1.z.string().max(500).optional(),
    emissionLimit: zod_1.z
        .number()
        .positive('Emission limit must be positive')
        .max(999_999_999_999, 'Emission limit is too large'),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
// ── Response Schemas ────────────────────────────────────────
exports.ComplianceStatus = zod_1.z.enum(['WITHIN_LIMIT', 'LIMIT_EXCEEDED']);
exports.SiteResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    location: zod_1.z.string().nullable(),
    emissionLimit: zod_1.z.number(),
    totalEmissionsToDate: zod_1.z.number(),
    metadata: zod_1.z.unknown().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.SiteMetricsSchema = zod_1.z.object({
    siteId: zod_1.z.string().uuid(),
    siteName: zod_1.z.string(),
    location: zod_1.z.string().nullable(),
    emissionLimit: zod_1.z.number(),
    totalEmissions: zod_1.z.number(),
    complianceStatus: exports.ComplianceStatus,
    utilizationPercentage: zod_1.z.number(),
    measurementCount: zod_1.z.number(),
    batchCount: zod_1.z.number(),
    lastIngestionAt: zod_1.z.string().datetime().nullable(),
});
//# sourceMappingURL=site.js.map