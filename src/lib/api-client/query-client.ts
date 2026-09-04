import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,

        gcTime: 1000 * 60 * 5,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
