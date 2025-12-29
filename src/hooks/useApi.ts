'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseApiOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const { enabled = true, refetchInterval } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: enabled,
  });

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({ data: null, error: error as Error, isLoading: false });
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    fetchData();
  }, [...deps, enabled]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  return { ...state, refetch: fetchData };
}

export function useMutation<T, A extends unknown[]>(
  mutationFn: (...args: A) => Promise<T>
): {
  mutate: (...args: A) => Promise<T>;
  mutateAsync: (...args: A) => Promise<T>;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isPending: boolean;
  reset: () => void;
} {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const mutate = useCallback(async (...args: A) => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const data = await mutationFn(...args);
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (error) {
      setState({ data: null, error: error as Error, isLoading: false });
      throw error;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, mutate, mutateAsync: mutate, isPending: state.isLoading, reset };
}
