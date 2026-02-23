'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchSites } from '@/lib/api';
import type { Site } from '@/lib/types';
import { SiteCard } from '@/components/site-card';

const POLL_INTERVAL = 5000;

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSites = useCallback(async () => {
    try {
      const data = await fetchSites();
      setSites(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSites();
    const interval = setInterval(loadSites, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadSites]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-semibold mb-2">
          Failed to load sites
        </p>
        <p className="text-sm text-destructive/80 mb-4">{error}</p>
        <button
          onClick={loadSites}
          className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white hover:bg-destructive/90"
        >
          Retry
        </button>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No sites found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create a site via the API to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Monitoring Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sites.length} site{sites.length !== 1 ? 's' : ''} monitored ·
            Auto-refreshing every {POLL_INTERVAL / 1000}s
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  );
}
