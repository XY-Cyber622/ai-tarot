import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

export interface UseAsyncResult<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  run: () => Promise<void>;
  reset: () => void;
}

/**
 * Minimal async state hook used by Sprint 3 (AI call) and beyond.
 * - Cancels stale runs on unmount.
 * - Re-runs when deps change.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown> = []
): UseAsyncResult<T> {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setStatus('pending');
    setError(null);
    try {
      const result = await fn();
      if (!mountedRef.current) return;
      setData(result);
      setStatus('success');
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  return {
    status,
    data,
    error,
    isLoading: status === 'pending',
    run,
    reset,
  };
}
