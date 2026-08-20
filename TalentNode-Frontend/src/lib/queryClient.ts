import { QueryClient } from '@tanstack/react-query'

/**
 * Configure default QueryClient with caching policies.
 * staleTime: 5 minutes - prevents automatic re-fetching unless data is invalidated on updates/mutations.
 * gcTime (cacheTime): 10 minutes - keeps inactive query data in memory before garbage collection.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
})
