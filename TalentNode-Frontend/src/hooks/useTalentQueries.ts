import { useQuery, useQueryClient } from '@tanstack/react-query'
import { jobKeys, candidateKeys, applicationKeys } from '../lib/queryKeys'
import { getJobs, getJobById } from '../features/jobs/services/JobServices'
import { getCandidates, getCandidatesForJob } from '../features/candidates/services/CandidateServices'
import { getApplicationsByHiringStages } from '../features/applications/services/ApplicationServices'

/**
 * Custom React Query hooks for Jobs, Candidates, and Applications.
 * Configured with 5-minute staleTime so background API calls are avoided unless data is updated/invalidated.
 */

// ----------------------------------------------------
// JOBS QUERIES & MUTATION HELPERS
// ----------------------------------------------------

export const useJobsQuery = (organizationId: string | undefined, accessToken: string | null) => {
  return useQuery({
    queryKey: jobKeys.list(organizationId ?? ''),
    queryFn: () => getJobs(accessToken!),
    enabled: Boolean(organizationId && accessToken),
    staleTime: 1000 * 60 * 5, // 5 mins cache freshness
  })
}

export const useJobDetailQuery = (jobId: string | undefined, accessToken: string | null) => {
  return useQuery({
    queryKey: jobKeys.detail(jobId ?? ''),
    queryFn: () => getJobById(jobId!, accessToken!),
    enabled: Boolean(jobId && accessToken),
    staleTime: 1000 * 60 * 5,
  })
}

// ----------------------------------------------------
// CANDIDATES QUERIES
// ----------------------------------------------------

export const useCandidatesQuery = (organizationId: string | undefined, accessToken: string | null) => {
  return useQuery({
    queryKey: candidateKeys.list(organizationId ?? ''),
    queryFn: () => getCandidates(accessToken!),
    enabled: Boolean(organizationId && accessToken),
    staleTime: 1000 * 60 * 5,
  })
}

export const useJobCandidatesQuery = (
  organizationId: string | undefined,
  jobId: string | undefined,
  accessToken: string | null
) => {
  return useQuery({
    queryKey: candidateKeys.byJob(organizationId ?? '', jobId ?? ''),
    queryFn: () => getCandidatesForJob(jobId!, accessToken!),
    enabled: Boolean(organizationId && jobId && accessToken),
    staleTime: 1000 * 60 * 5,
  })
}

// ----------------------------------------------------
// APPLICATIONS QUERIES
// ----------------------------------------------------

export const useApplicationsQuery = (
  organizationId: string | undefined,
  jobId: string | undefined,
  accessToken: string | null
) => {
  return useQuery({
    queryKey: applicationKeys.byJob(organizationId ?? '', jobId ?? ''),
    queryFn: () => getApplicationsByHiringStages(jobId!, accessToken!),
    enabled: Boolean(organizationId && jobId && accessToken),
    staleTime: 1000 * 60 * 5,
  })
}

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
    invalidateAll: () => queryClient.invalidateQueries(),
  }
}
