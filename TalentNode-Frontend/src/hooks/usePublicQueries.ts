import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { publicKeys } from '../lib/queryKeys'
import { publicPortalApi } from '../services/api/publicPortalApi'
import type {
  PublicApplicationInput,
  PublicJobDetailResponse,
  PublicJobsResponse,
  SubmitPublicApplicationResponse,
} from '../types/apiTypes'

/**
 * TanStack Query Options Factory for Public Careers Portal.
 * Useful for queryClient.fetchQuery(), prefetching, or standard useQuery() calls.
 */
export const publicQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: publicKeys.all,
    }),

  jobs: (slug: string | undefined) =>
    queryOptions({
      queryKey: publicKeys.jobs(slug ?? ''),
      queryFn: async (): Promise<PublicJobsResponse> => {
        if (!slug) throw new Error('Organization slug is required')
        return publicPortalApi.getPublicJobs(slug)
      },
      enabled: Boolean(slug),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  job: (jobId: string | undefined) =>
    queryOptions({
      queryKey: publicKeys.job(jobId ?? ''),
      queryFn: async (): Promise<PublicJobDetailResponse> => {
        if (!jobId) throw new Error('Job ID is required')
        return publicPortalApi.getPublicJobById(jobId)
      },
      enabled: Boolean(jobId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
}

// ----------------------------------------------------------------------------
// QUERY HOOKS
// ----------------------------------------------------------------------------

/**
 * Query hook for fetching an organization's public career jobs.
 */
export const usePublicJobsQuery = (slug: string | undefined) => {
  return useQuery(publicQueryOptions.jobs(slug))
}

/**
 * Query hook for fetching a specific public job's details and application form schema.
 */
export const usePublicJobDetailQuery = (jobId: string | undefined) => {
  return useQuery(publicQueryOptions.job(jobId))
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS
// ----------------------------------------------------------------------------

/**
 * Mutation hook for submitting an application on the public careers portal.
 */
export const useSubmitPublicApplicationMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation<
    SubmitPublicApplicationResponse,
    Error,
    { targetJobId?: string; payload: FormData | PublicApplicationInput }
  >({
    mutationFn: ({
      targetJobId,
      payload,
    }: {
      targetJobId?: string
      payload: FormData | PublicApplicationInput
    }) => {
      const id = targetJobId ?? jobId
      if (!id) throw new Error('Job ID is required for application submission')
      return publicPortalApi.submitPublicApplication(id, payload)
    },
    onSuccess: (_response, variables) => {
      const id = variables.targetJobId ?? jobId
      if (id) {
        void queryClient.invalidateQueries({ queryKey: publicKeys.job(id) })
      }
    },
  })
}

// ----------------------------------------------------------------------------
// INVALIDATION HELPER HOOK
// ----------------------------------------------------------------------------

/**
 * Helper hook for invalidating public portal cached queries.
 */
export const useInvalidatePublicQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: publicKeys.all }),
    invalidateJobs: (slug: string) =>
      queryClient.invalidateQueries({ queryKey: publicKeys.jobs(slug) }),
    invalidateJob: (jobId: string) =>
      queryClient.invalidateQueries({ queryKey: publicKeys.job(jobId) }),
  }
}
