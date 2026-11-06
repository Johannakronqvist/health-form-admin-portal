import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'success'; data: T };

/**
 * Runs an async function on mount (and on retry), aborting it on unmount.
 * Pass a stable function (defined outside the component or wrapped in useCallback).
 */
export function useAsync<T>(fn: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fn(controller.signal).then(
      (data) => setState({ status: 'success', data }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
      },
    );

    return () => controller.abort();
  }, [fn, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
