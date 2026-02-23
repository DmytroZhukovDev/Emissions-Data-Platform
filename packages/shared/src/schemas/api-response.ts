import { z } from 'zod';

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .optional(),
});

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    meta: z.object({
      timestamp: z.string(),
      requestId: z.string().optional(),
    }),
  });

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
