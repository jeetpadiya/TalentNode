import client from '../../lib/client'
import type {
  AnalyticsFilterParams,
  RecruitingAnalyticsResponse,
} from '../../types/apiTypes'

/**
 * Centralized Analytics API Service.
 * Interacts with /api/organizations/:organizationId/analytics.
 */
export const analyticsApi = {
  /**
   * Fetch executive recruiting analytics, funnel stages, source attribution, and volume trends.
   * GET /api/organizations/:organizationId/analytics
   */
  getOrganizationAnalytics: async (
    organizationId: string,
    params?: AnalyticsFilterParams,
  ): Promise<RecruitingAnalyticsResponse> => {
    return client.get<RecruitingAnalyticsResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/analytics`,
      { params: params as Record<string, unknown> },
    )
  },
}

export const getOrganizationAnalytics = analyticsApi.getOrganizationAnalytics

export default analyticsApi
