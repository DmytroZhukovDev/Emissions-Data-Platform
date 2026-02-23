import { z } from 'zod';
export declare const ReadingSchema: z.ZodObject<{
    value: z.ZodNumber;
    unit: z.ZodDefault<z.ZodString>;
    recordedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: number;
    unit: string;
    recordedAt: string;
}, {
    value: number;
    recordedAt: string;
    unit?: string | undefined;
}>;
export declare const CreateIngestSchema: z.ZodObject<{
    siteId: z.ZodString;
    readings: z.ZodArray<z.ZodObject<{
        value: z.ZodNumber;
        unit: z.ZodDefault<z.ZodString>;
        recordedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: number;
        unit: string;
        recordedAt: string;
    }, {
        value: number;
        recordedAt: string;
        unit?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    siteId: string;
    readings: {
        value: number;
        unit: string;
        recordedAt: string;
    }[];
}, {
    siteId: string;
    readings: {
        value: number;
        recordedAt: string;
        unit?: string | undefined;
    }[];
}>;
export declare const IngestResponseSchema: z.ZodObject<{
    batchId: z.ZodString;
    siteId: z.ZodString;
    recordCount: z.ZodNumber;
    totalValue: z.ZodNumber;
    newSiteTotal: z.ZodNumber;
    duplicate: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    siteId: string;
    batchId: string;
    recordCount: number;
    totalValue: number;
    newSiteTotal: number;
    duplicate: boolean;
}, {
    siteId: string;
    batchId: string;
    recordCount: number;
    totalValue: number;
    newSiteTotal: number;
    duplicate: boolean;
}>;
export type Reading = z.infer<typeof ReadingSchema>;
export type CreateIngestDto = z.infer<typeof CreateIngestSchema>;
export type IngestResponse = z.infer<typeof IngestResponseSchema>;
//# sourceMappingURL=ingest.d.ts.map