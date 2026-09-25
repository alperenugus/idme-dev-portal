import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../lib/api/errors';

/**
 * App-wide React Query configuration. Auth/permission failures (401/403) are
 * never retried; transient failures retry a couple of times with backoff.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && !error.isRetryable) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}
