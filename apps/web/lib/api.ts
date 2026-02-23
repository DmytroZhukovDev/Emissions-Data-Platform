import type {
  ApiResponse,
  Site,
  SiteMetrics,
  IngestResponse,
  Reading,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const body: ApiResponse<T> = await res.json();

  if (!body.success) {
    const msg = body.error?.message || `Request failed with status ${res.status}`;
    const err = new Error(msg) as Error & { code?: string; details?: unknown };
    err.code = body.error?.code;
    err.details = body.error?.details;
    throw err;
  }

  return body;
}

export async function fetchSites(): Promise<Site[]> {
  const res = await request<Site[]>('/sites');
  return res.data!;
}

export async function fetchSite(id: string): Promise<Site> {
  const res = await request<Site>(`/sites/${id}`);
  return res.data!;
}

export async function fetchSiteMetrics(id: string): Promise<SiteMetrics> {
  const res = await request<SiteMetrics>(`/sites/${id}/metrics`);
  return res.data!;
}

export async function createSite(data: {
  name: string;
  location?: string;
  emissionLimit: number;
  metadata?: Record<string, unknown>;
}): Promise<Site> {
  const res = await request<Site>('/sites', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data!;
}

export async function ingestReadings(
  siteId: string,
  readings: Reading[],
  idempotencyKey: string,
): Promise<IngestResponse> {
  const res = await request<IngestResponse>('/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ siteId, readings }),
  });
  return res.data!;
}
