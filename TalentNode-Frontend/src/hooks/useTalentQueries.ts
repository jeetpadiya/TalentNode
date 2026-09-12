import { useQueryClient } from '@tanstack/react-query'
import { jobKeys, candidateKeys, applicationKeys, publicKeys } from '../lib/queryKeys'

/**
 * Custom React Query hooks for Jobs, Candidates, and Applications.
 * Configured with 5-minute staleTime so background API calls are avoided unless data is updated/invalidated.
 */

// ----------------------------------------------------
// QUERY INVALIDATION UTILITY HOOK
// ----------------------------------------------------

export const useInvalidateTalentQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateJobs: (organizationId?: string) => {
      if (organizationId) {
        return queryClient.invalidateQueries({ queryKey: jobKeys.list(organizationId) })
      }
      return queryClient.invalidateQueries({ queryKey: jobKeys.all })
    },
    invalidateCandidates: (organizationId?: string, jobId?: string) => {
      if (organizationId && jobId) {
        return queryClient.invalidateQueries({ queryKey: candidateKeys.byJob(organizationId, jobId) })
      }
      if (organizationId) {
        return queryClient.invalidateQueries({ queryKey: candidateKeys.list(organizationId) })
      }
      return queryClient.invalidateQueries({ queryKey: candidateKeys.all })
    },
    invalidateApplications: (organizationId?: string, jobId?: string) => {
      if (organizationId && jobId) {
        return queryClient.invalidateQueries({ queryKey: applicationKeys.byJob(organizationId, jobId) })
      }
      if (organizationId) {
        return queryClient.invalidateQueries({ queryKey: applicationKeys.list(organizationId) })
      }
      return queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
    invalidatePublic: (slug?: string, jobId?: string) => {
      if (jobId) {
        return queryClient.invalidateQueries({ queryKey: publicKeys.job(jobId) })
      }
      if (slug) {
        return queryClient.invalidateQueries({ queryKey: publicKeys.jobs(slug) })
      }
      return queryClient.invalidateQueries({ queryKey: publicKeys.all })
    },
    invalidateAll: () => queryClient.invalidateQueries(),
  }
}

// ----------------------------------------------------
// RE-EXPORT DOMAIN QUERIES
// ----------------------------------------------------
export * from './useOrganizationQueries'
export * from './useJobQueries'
export * from './useCandidateQueries'
export * from './useApplicationQueries'
export * from './useSettingsQueries'
export * from './useUserQueries'
export * from './usePublicQueries'
export * from './useAnalyticsQueries'







