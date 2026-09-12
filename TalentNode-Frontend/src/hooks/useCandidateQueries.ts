import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applicationKeys, candidateKeys } from '../lib/queryKeys'
import { candidateApi } from '../services/api/candidateApi'
import type {
  Candidate,
  CreateCandidateInput,
  UpdateCandidateInput,
} from '../types/apiTypes'

/**
 * TanStack Query Options Factory for Candidates
 * Useful for queryClient.fetchQuery(), prefetching, or standard useQuery() calls.
 */
export const candidateQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: candidateKeys.all,
    }),

  lists: () =>
    queryOptions({
      queryKey: candidateKeys.lists(),
    }),

  list: (organizationId?: string, filters?: Record<string, unknown>) =>
    queryOptions({
      queryKey: candidateKeys.list(organizationId ?? '', filters),
      queryFn: async (): Promise<Candidate[]> => {
        const response = await candidateApi.getCandidates(filters)
        return response.candidates
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  byJob: (organizationId: string | undefined, jobId: string | undefined) =>
    queryOptions({
      queryKey: candidateKeys.byJob(organizationId ?? '', jobId ?? ''),
      queryFn: async (): Promise<Candidate[]> => {
        const response = await candidateApi.getCandidatesForJob(jobId!)
        return response.candidates
      },
      enabled: Boolean(jobId),
      staleTime: 1000 * 60 * 5,
    }),

  details: () =>
    queryOptions({
      queryKey: candidateKeys.details(),
    }),

  detail: (candidateId: string | undefined) =>
    queryOptions({
      queryKey: candidateKeys.detail(candidateId ?? ''),
      queryFn: async (): Promise<Candidate> => {
        const response = await candidateApi.getCandidateById(candidateId!)
        return response.candidate
      },
      enabled: Boolean(candidateId),
      staleTime: 1000 * 60 * 5,
    }),
}

// ----------------------------------------------------------------------------
// QUERY HOOKS
// ----------------------------------------------------------------------------

/**
 * Query hook for listing all candidates across the organization.
 * Supports backward-compatible signature: (organizationId, accessToken)
 * or modern signature: (organizationId, filters)
 */
export const useCandidatesQuery = (
  organizationId?: string,
  filtersOrAccessToken?: Record<string, unknown> | string | null,
  _legacyAccessToken?: string | null,
) => {
  const isLegacyToken =
    typeof filtersOrAccessToken === 'string' || filtersOrAccessToken === null
  const filters = isLegacyToken ? undefined : filtersOrAccessToken
  const isEnabled = Boolean(
    organizationId && (isLegacyToken ? Boolean(filtersOrAccessToken) : true),
  )

  return useQuery({
    ...candidateQueryOptions.list(organizationId, filters),
    enabled: isEnabled,
  })
}

/**
 * Query hook for listing candidates assigned to a specific job.
 * Supports backward-compatible signature: (organizationId, jobId, accessToken)
 * or modern signature: (organizationId, jobId)
 */
export const useJobCandidatesQuery = (
  organizationId: string | undefined,
  jobId: string | undefined,
  legacyAccessToken?: string | null,
) => {
  const isEnabled = Boolean(
    jobId && (legacyAccessToken !== undefined ? Boolean(legacyAccessToken) : true),
  )

  return useQuery({
    ...candidateQueryOptions.byJob(organizationId, jobId),
    enabled: isEnabled,
  })
}

/**
 * Query hook for fetching details of a specific candidate by ID.
 */
export const useCandidateDetailQuery = (candidateId: string | undefined) => {
  return useQuery(candidateQueryOptions.detail(candidateId))
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS
// ----------------------------------------------------------------------------

/**
 * Mutation hook for creating a candidate (and optionally assigning to a job).
 */
export const useCreateCandidateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCandidateInput) => candidateApi.createCandidate(input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(candidateKeys.detail(data.candidate._id), data.candidate)
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() })

      if (variables.jobId) {
        void queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === 'candidates' &&
            query.queryKey[1] === 'job' &&
            query.queryKey[3] === variables.jobId,
        })
        void queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === 'applications' &&
            query.queryKey[1] === 'job' &&
            query.queryKey[3] === variables.jobId,
        })
      }
    },
  })
}

/**
 * Mutation hook for updating an existing candidate.
 */
export const useUpdateCandidateMutation = (candidateId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string
      input: UpdateCandidateInput
    }) => {
      const targetId = id ?? candidateId
      if (!targetId) throw new Error('Candidate ID is required for update')
      return candidateApi.updateCandidate(targetId, input)
    },
    onSuccess: (data, variables) => {
      const targetId = variables.id ?? candidateId
      if (targetId) {
        queryClient.setQueryData(candidateKeys.detail(targetId), data.candidate)
        void queryClient.invalidateQueries({ queryKey: candidateKeys.detail(targetId) })
      }
      void queryClient.invalidateQueries({ queryKey: candidateKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })
}

/**
 * Mutation hook for deleting a candidate.
 */
export const useDeleteCandidateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (candidateId: string) => candidateApi.deleteCandidate(candidateId),
    onSuccess: (_data, candidateId) => {
      queryClient.removeQueries({ queryKey: candidateKeys.detail(candidateId) })
      void queryClient.invalidateQueries({ queryKey: candidateKeys.all })
      void queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })
}

// ----------------------------------------------------------------------------
// INVALIDATION HELPER HOOK
// ----------------------------------------------------------------------------

export const useInvalidateCandidateQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: candidateKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: candidateKeys.lists() }),
    invalidateList: (organizationId: string, filters?: Record<string, unknown>) =>
      queryClient.invalidateQueries({
        queryKey: candidateKeys.list(organizationId, filters),
      }),
    invalidateByJob: (organizationId: string, jobId: string) =>
      queryClient.invalidateQueries({
        queryKey: candidateKeys.byJob(organizationId, jobId),
      }),
    invalidateDetail: (candidateId: string) =>
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(candidateId) }),
  }
}
