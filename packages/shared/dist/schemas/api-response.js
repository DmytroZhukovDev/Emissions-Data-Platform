"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseSchema = exports.ApiErrorSchema = void 0;
const zod_1 = require("zod");
exports.ApiErrorSchema = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z
        .array(zod_1.z.object({ field: zod_1.z.string(), message: zod_1.z.string() }))
        .optional(),
});
const ApiResponseSchema = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    data: dataSchema.optional(),
    error: exports.ApiErrorSchema.optional(),
    meta: zod_1.z.object({
        timestamp: zod_1.z.string(),
        requestId: zod_1.z.string().optional(),
    }),
});
exports.ApiResponseSchema = ApiResponseSchema;
//# sourceMappingURL=api-response.js.map