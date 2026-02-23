'use client';

import Link from 'next/link';
import type { Site } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { UtilizationBar } from './utilization-bar';

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const utilization =
    site.emissionLimit > 0
      ? (site.totalEmissionsToDate / site.emissionLimit) * 100
      : 0;

  const status: 'WITHIN_LIMIT' | 'LIMIT_EXCEEDED' =
    site.totalEmissionsToDate > site.emissionLimit
      ? 'LIMIT_EXCEEDED'
      : 'WITHIN_LIMIT';

  return (
    <Link href={`/sites/${site.id}`}>
      <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
              {site.name}
            </h3>
            {site.location && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {site.location}
              </p>
            )}
          </div>
          <StatusBadge status={status} className="ml-2 shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total Emissions</p>
            <p className="font-mono font-semibold text-card-foreground">
              {site.totalEmissionsToDate.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">kg</span>
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Limit</p>
            <p className="font-mono font-semibold text-card-foreground">
              {site.emissionLimit.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">kg</span>
            </p>
          </div>
        </div>

        <UtilizationBar percentage={Math.round(utilization * 100) / 100} />
      </div>
    </Link>
  );
}
