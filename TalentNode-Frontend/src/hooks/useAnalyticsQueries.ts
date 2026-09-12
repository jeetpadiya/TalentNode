import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { analyticsKeys } from '../lib/queryKeys'
import { analyticsApi } from '../services/api/analyticsApi'
import type {
  AnalyticsFilterParams,
  RecruitingAnalyticsResponse,
} from '../types/apiTypes'

/**
 * TanStack Query Options Factory for Recruiting Analytics.
 */
export const analyticsQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: analyticsKeys.all,
    }),

  overview: (
    organizationId: string | undefined,
    filters?: AnalyticsFilterParams,
  ) =>
    queryOptions({
      queryKey: analyticsKeys.overview(organizationId ?? '', filters as Record<string, unknown>),
      queryFn: async (): Promise<RecruitingAnalyticsResponse> => {
        if (!organizationId) throw new Error('Organization ID is required for analytics')
        return analyticsApi.getOrganizationAnalytics(organizationId, filters)
      },
      enabled: Boolean(organizationId),
      staleTime: 1000 * 60 * 3, // 3 minutes
    }),
}

// ----------------------------------------------------------------------------
// QUERY HOOKS
// ----------------------------------------------------------------------------

/**
 * Query hook for fetching comprehensive recruiting analytics for an organization.
 */
export const useAnalyticsQuery = (
  organizationId: string | undefined,
  filters?: AnalyticsFilterParams,
) => {
  return useQuery(analyticsQueryOptions.overview(organizationId, filters))
}

// ----------------------------------------------------------------------------
// INVALIDATION HELPER HOOK
// ----------------------------------------------------------------------------

/**
 * Invalidation helper for analytics queries.
 */
export const useInvalidateAnalyticsQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
    invalidateOverview: (organizationId: string) =>
      queryClient.invalidateQueries({
        queryKey: [...analyticsKeys.all, 'overview', organizationId],
      }),
  }
}
