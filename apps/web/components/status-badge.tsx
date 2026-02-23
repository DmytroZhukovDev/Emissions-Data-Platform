'use client';

interface StatusBadgeProps {
  status: 'WITHIN_LIMIT' | 'LIMIT_EXCEEDED';
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const isExceeded = status === 'LIMIT_EXCEEDED';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isExceeded
          ? 'bg-destructive/15 text-destructive'
          : 'bg-success/15 text-success'
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isExceeded ? 'bg-destructive' : 'bg-success'
        }`}
      />
      {isExceeded ? 'Limit Exceeded' : 'Within Limit'}
    </span>
  );
}
