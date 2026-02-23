export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

export interface Site {
  id: string;
  name: string;
  location: string | null;
  emissionLimit: number;
  totalEmissionsToDate: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteMetrics {
  siteId: string;
  siteName: string;
  location: string | null;
  emissionLimit: number;
  totalEmissions: number;
  complianceStatus: 'WITHIN_LIMIT' | 'LIMIT_EXCEEDED';
  utilizationPercentage: number;
  measurementCount: number;
  batchCount: number;
  lastIngestionAt: string | null;
}

export interface IngestResponse {
  batchId: string;
  siteId: string;
  recordCount: number;
  totalValue: number;
  newSiteTotal: number;
  duplicate: boolean;
}

export interface Reading {
  value: number;
  unit: string;
  recordedAt: string;
}
