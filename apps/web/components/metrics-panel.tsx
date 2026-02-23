'use client';

import type { SiteMetrics } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { UtilizationBar } from './utilization-bar';

interface MetricsPanelProps {
  metrics: SiteMetrics;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-card-foreground">
          Site Metrics
        </h2>
        <StatusBadge status={metrics.complianceStatus} />
      </div>

      <div className="space-y-6">
        <UtilizationBar percentage={metrics.utilizationPercentage} />

        <div className="grid grid-cols-2 gap-4">
          <MetricItem
            label="Total Emissions"
            value={`${metrics.totalEmissions.toLocaleString()} kg`}
          />
          <MetricItem
            label="Emission Limit"
            value={`${metrics.emissionLimit.toLocaleString()} kg`}
          />
          <MetricItem
            label="Measurements"
            value={metrics.measurementCount.toLocaleString()}
          />
          <MetricItem
            label="Batches Ingested"
            value={metrics.batchCount.toLocaleString()}
          />
          <MetricItem
            label="Location"
            value={metrics.location || '—'}
          />
          <MetricItem
            label="Last Ingestion"
            value={
              metrics.lastIngestionAt
                ? new Date(metrics.lastIngestionAt).toLocaleString()
                : 'Never'
            }
          />
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold text-card-foreground">
        {value}
      </p>
    </div>
  );
}
