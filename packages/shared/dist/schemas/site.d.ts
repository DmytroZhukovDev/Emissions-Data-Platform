import { z } from 'zod';
export declare const CreateSiteSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    emissionLimit: z.ZodNumber;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    emissionLimit: number;
    location?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    name: string;
    emissionLimit: number;
    location?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const ComplianceStatus: z.ZodEnum<["WITHIN_LIMIT", "LIMIT_EXCEEDED"]>;
export declare const SiteResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    location: z.ZodNullable<z.ZodString>;
    emissionLimit: z.ZodNumber;
    totalEmissionsToDate: z.ZodNumber;
    metadata: z.ZodNullable<z.ZodUnknown>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    location: string | null;
    emissionLimit: number;
    id: string;
    totalEmissionsToDate: number;
    createdAt: string;
    updatedAt: string;
    metadata?: unknown;
}, {
    name: string;
    location: string | null;
    emissionLimit: number;
    id: string;
    totalEmissionsToDate: number;
    createdAt: string;
    updatedAt: string;
    metadata?: unknown;
}>;
export declare const SiteMetricsSchema: z.ZodObject<{
    siteId: z.ZodString;
    siteName: z.ZodString;
    location: z.ZodNullable<z.ZodString>;
    emissionLimit: z.ZodNumber;
    totalEmissions: z.ZodNumber;
    complianceStatus: z.ZodEnum<["WITHIN_LIMIT", "LIMIT_EXCEEDED"]>;
    utilizationPercentage: z.ZodNumber;
    measurementCount: z.ZodNumber;
    batchCount: z.ZodNumber;
    lastIngestionAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    location: string | null;
    emissionLimit: number;
    siteId: string;
    siteName: string;
    totalEmissions: number;
    complianceStatus: "WITHIN_LIMIT" | "LIMIT_EXCEEDED";
    utilizationPercentage: number;
    measurementCount: number;
    batchCount: number;
    lastIngestionAt: string | null;
}, {
    location: string | null;
    emissionLimit: number;
    siteId: string;
    siteName: string;
    totalEmissions: number;
    complianceStatus: "WITHIN_LIMIT" | "LIMIT_EXCEEDED";
    utilizationPercentage: number;
    measurementCount: number;
    batchCount: number;
    lastIngestionAt: string | null;
}>;
export type CreateSiteDto = z.infer<typeof CreateSiteSchema>;
export type SiteResponse = z.infer<typeof SiteResponseSchema>;
export type SiteMetrics = z.infer<typeof SiteMetricsSchema>;
export type ComplianceStatusType = z.infer<typeof ComplianceStatus>;
//# sourceMappingURL=site.d.ts.map