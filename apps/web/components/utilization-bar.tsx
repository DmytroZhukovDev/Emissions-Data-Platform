'use client';

interface UtilizationBarProps {
  percentage: number;
}

export function UtilizationBar({ percentage }: UtilizationBarProps) {
  const clamped = Math.min(percentage, 100);
  const color =
    percentage > 100
      ? 'bg-destructive'
      : percentage > 80
        ? 'bg-warning'
        : 'bg-success';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>Utilization</span>
        <span className="font-mono">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
