export type { ApiResponse } from '@emissions/shared';

export function successResponse<T>(data: T, requestId?: string) {
  return {
    success: true as const,
    data,
    meta: { timestamp: new Date().toISOString(), requestId },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
  requestId?: string,
) {
  return {
    success: false as const,
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString(), requestId },
  };
}
