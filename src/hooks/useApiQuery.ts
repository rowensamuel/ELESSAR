import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '../services/apiClient';

export interface UseApiQueryOptions<T> {
  enabled?: boolean;
  initialData?: T;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError | Error) => void;
}

export interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | Error | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = [],
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const {
    enabled = true,
    initialData = null,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      if (isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err);
        onError?.(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, ...deps]);

  useEffect(() => {
    execute();

    if (refetchInterval && refetchInterval > 0 && enabled) {
      const intervalId = setInterval(execute, refetchInterval);
      return () => clearInterval(intervalId);
    }
  }, [execute, refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    setData,
  };
}
