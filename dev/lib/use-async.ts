import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../api/client';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Runs an async loader and tracks loading/error state, discarding results from
 * superseded calls.
 *
 * `loader` must be referentially stable (wrap it in `useCallback`). Taking a
 * memoized function instead of a dependency array keeps
 * `react-hooks/exhaustive-deps` verifiable, which matters because `npm run
 * lint` runs with `--max-warnings 0`.
 */
export function useAsync<T>(loader: () => Promise<T>): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    loader().then(
      (data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      },
      (error: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: errorMessage(error) });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [loader, nonce]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return { ...state, reload };
}
