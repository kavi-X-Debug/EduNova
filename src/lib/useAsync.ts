import { useCallback, useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  reload: () => void;
}

interface Settled<T> {
  key: string;
  data?: T;
  error?: Error;
}

/**
 * Runs `fn` on mount, whenever `deps` change, and when `reload()` is called.
 * `loading` is derived from state (no synchronous setState in the effect).
 * Stale responses are ignored; previous data is kept while reloading.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[] = []): AsyncState<T> {
  const [tick, setTick] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const key = `${JSON.stringify(deps)}|${tick}`;

  useEffect(() => {
    let cancelled = false;
    fn().then(
      (data) => {
        if (!cancelled) setSettled({ key, data });
      },
      (e: unknown) => {
        if (!cancelled) setSettled({ key, error: e instanceof Error ? e : new Error(String(e)) });
      },
    );
    return () => {
      cancelled = true;
    };
    // `fn` identity changes every render; `deps` (via key) is the contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const ready = settled?.key === key;
  return {
    data: settled?.error && ready ? undefined : settled?.data,
    loading: !ready,
    error: ready ? settled.error : undefined,
    reload,
  };
}
