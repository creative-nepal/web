import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 1 minute — avoids a background refetch on every mount for
        // typical request/response data. Override per-query via `queryOptions(...)`
        // (see query-keys.ts) for anything more volatile (e.g. staleTime: 0) or more
        // static (e.g. reference data, staleTime: 10-30min).
        staleTime: 1000 * 60,
        // Cache is kept 5 minutes after a query becomes inactive (all observers
        // unmounted), so re-navigating back to a screen within that window is instant.
        gcTime: 1000 * 60 * 5,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
