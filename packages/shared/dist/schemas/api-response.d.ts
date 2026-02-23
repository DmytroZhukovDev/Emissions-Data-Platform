import { z } from 'zod';
export declare const ApiErrorSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        field: string;
    }, {
        message: string;
        field: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    message: string;
    details?: {
        message: string;
        field: string;
    }[] | undefined;
}, {
    code: string;
    message: string;
    details?: {
        message: string;
        field: string;
    }[] | undefined;
}>;
export declare const ApiResponseSchema: <T extends z.ZodType>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            field: string;
        }, {
            message: string;
            field: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: {
            message: string;
            field: string;
        }[] | undefined;
    }, {
        code: string;
        message: string;
        details?: {
            message: string;
            field: string;
        }[] | undefined;
    }>>;
    meta: z.ZodObject<{
        timestamp: z.ZodString;
        requestId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        requestId?: string | undefined;
    }, {
        timestamp: string;
        requestId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            field: string;
        }, {
            message: string;
            field: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: {
            message: string;
            field: string;
        }[] | undefined;
    }, {
        code: string;
        message: string;
        details?: {
            message: string;
            field: string;
        }[] | undefined;
    }>>;
    meta: z.ZodObject<{
        timestamp: z.ZodString;
        requestId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        requestId?: string | undefined;
    }, {
        timestamp: string;
        requestId?: string | undefined;
    }>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            message: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message: string;
            field: string;
        }, {
            message: string;
            field: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: {
            message: string;
            field: string;
        }[] | undefined;
    }, {
        code: string;
        message: string;
        details?: {
            message: string;
            field: string;
        }[] | undefined;
    }>>;
    meta: z.ZodObject<{
        timestamp: z.ZodString;
        requestId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        requestId?: string | undefined;
    }, {
        timestamp: string;
        requestId?: string | undefined;
    }>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta: {
        timestamp: string;
        requestId?: string;
    };
}
//# sourceMappingURL=api-response.d.ts.map