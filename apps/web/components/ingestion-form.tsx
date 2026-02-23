'use client';

import { useState, useCallback } from 'react';
import { ingestReadings } from '@/lib/api';
import type { IngestResponse, Reading } from '@/lib/types';
import { useToast } from './toast';

interface IngestionFormProps {
  siteId: string;
  onIngested?: () => void;
}

type FormState =
  | { step: 'idle' }
  | { step: 'submitting'; idempotencyKey: string; readings: Reading[] }
  | { step: 'success'; result: IngestResponse; idempotencyKey: string }
  | { step: 'error'; error: string; idempotencyKey: string; readings: Reading[] };

function generateReadings(count: number): Reading[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    value: Math.round((Math.random() * 100 + 1) * 100) / 100,
    unit: 'kg',
    recordedAt: new Date(now - (count - i) * 5 * 60_000).toISOString(),
  }));
}

export function IngestionForm({ siteId, onIngested }: IngestionFormProps) {
  const [readingCount, setReadingCount] = useState(5);
  const [state, setState] = useState<FormState>({ step: 'idle' });
  const { toast } = useToast();

  const submit = useCallback(
    async (idempotencyKey: string, readings: Reading[]) => {
      setState({ step: 'submitting', idempotencyKey, readings });
      try {
        const result = await ingestReadings(siteId, readings, idempotencyKey);

        setState({ step: 'success', result, idempotencyKey });

        if (result.duplicate) {
          toast(
            'info',
            'Duplicate Detected',
            'Server recognized this as a retry — no data was double-counted.',
          );
        } else {
          toast(
            'success',
            'Batch Ingested',
            `${result.recordCount} readings added (${result.totalValue.toFixed(2)} kg).`,
          );
        }

        onIngested?.();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setState({ step: 'error', error: message, idempotencyKey, readings });
        toast('error', 'Ingestion Failed', message);
      }
    },
    [siteId, onIngested, toast],
  );

  const handleSubmit = () => {
    const key = crypto.randomUUID();
    const readings = generateReadings(readingCount);
    submit(key, readings);
  };

  const handleRetry = () => {
    if (state.step === 'error') {
      submit(state.idempotencyKey, state.readings);
    }
  };

  const handleReset = () => {
    setState({ step: 'idle' });
  };

  const isSubmitting = state.step === 'submitting';

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">
        Manual Ingestion
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">
            Number of readings
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={readingCount}
            onChange={(e) => setReadingCount(Number(e.target.value))}
            disabled={isSubmitting}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1</span>
            <span className="font-mono font-semibold text-card-foreground">
              {readingCount}
            </span>
            <span>100</span>
          </div>
        </div>

        {/* Idempotency Key Display */}
        {state.step !== 'idle' && (
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground mb-0.5">
              Idempotency Key
            </p>
            <p className="font-mono text-xs text-card-foreground break-all">
              {state.idempotencyKey}
            </p>
            {state.step === 'error' && (
              <p className="text-xs text-warning mt-1">
                ↑ Retry will reuse this key — the server won&apos;t double-count.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {state.step === 'idle' && (
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Generate & Submit
            </button>
          )}

          {state.step === 'submitting' && (
            <button
              disabled
              className="flex-1 rounded-lg bg-primary/60 px-4 py-2.5 text-sm font-semibold text-primary-foreground cursor-wait"
            >
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    className="opacity-75"
                  />
                </svg>
                Submitting…
              </span>
            </button>
          )}

          {state.step === 'error' && (
            <>
              <button
                onClick={handleRetry}
                className="flex-1 rounded-lg bg-warning px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-warning/90"
              >
                Retry (Same Key)
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-card-foreground transition-colors hover:bg-muted"
              >
                New Batch
              </button>
            </>
          )}

          {state.step === 'success' && (
            <button
              onClick={handleReset}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Submit Another Batch
            </button>
          )}
        </div>

        {/* Result Display */}
        {state.step === 'success' && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              state.result.duplicate
                ? 'bg-warning/10 border border-warning/30'
                : 'bg-success/10 border border-success/30'
            }`}
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Status:</span>{' '}
                <span className="font-semibold">
                  {state.result.duplicate
                    ? 'Duplicate (cached)'
                    : 'Processed'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Records:</span>{' '}
                <span className="font-mono font-semibold">
                  {state.result.recordCount}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Batch Value:</span>{' '}
                <span className="font-mono font-semibold">
                  {state.result.totalValue.toFixed(2)} kg
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">New Site Total:</span>{' '}
                <span className="font-mono font-semibold">
                  {state.result.newSiteTotal.toFixed(2)} kg
                </span>
              </div>
            </div>
          </div>
        )}

        {state.step === 'error' && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
            <p className="text-sm font-semibold text-destructive">
              Error: {state.error}
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Click &quot;Retry&quot; to resend with the same idempotency key. The server
              guarantees no duplicates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
