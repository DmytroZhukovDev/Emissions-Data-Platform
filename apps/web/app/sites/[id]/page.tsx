'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { fetchSite, fetchSiteMetrics } from '@/lib/api';
import type { Site, SiteMetrics } from '@/lib/types';
import { MetricsPanel } from '@/components/metrics-panel';
import { IngestionForm } from '@/components/ingestion-form';

const POLL_INTERVAL = 5000;

export default function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [site, setSite] = useState<Site | null>(null);
  const [metrics, setMetrics] = useState<SiteMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([
        fetchSite(id),
        fetchSiteMetrics(id),
      ]);
      setSite(s);
      setMetrics(m);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load site');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !site || !metrics) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-semibold mb-2">
          {error || 'Site not found'}
        </p>
        <Link
          href="/"
          className="text-sm text-primary hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{site.name}</h1>
        {site.location && (
          <p className="text-muted-foreground mt-1">{site.location}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricsPanel metrics={metrics} />
        <IngestionForm siteId={id} onIngested={loadData} />
      </div>
    </div>
  );
}
