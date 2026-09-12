import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { applicationKeys, analyticsKeys } from '../lib/queryKeys'
import { applicationApi } from '../services/api/applicationApi'

import type {
  AddApplicationCommentInput,
  ApplicationComment,
  ApplicationStage,
  CandidateEmail,
  CreatePrivateNoteInput,
  CreateReviewRequestInput,
  EditApplicationCommentInput,
  PrivateNoteItem,
  ResolveApplicationInput,
  ReviewRequest,
  SendCandidateEmailInput,
} from '../types/apiTypes'

/**
 * TanStack Query Options Factory for Applications & Hiring Pipeline
 * Useful for queryClient.fetchQuery(), prefetching, or standard useQuery() calls.
 */
export const applicationQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: applicationKeys.all,
    }),

  lists: () =>
    queryOptions({
      queryKey: applicationKeys.lists(),
    }),

  byJob: (organizationId: string | undefined, jobId: string | undefined) =>
    queryOptions({
      queryKey: applicationKeys.byJob(organizationId ?? '', jobId ?? ''),
      queryFn: async (): Promise<ApplicationStage[]> => {
        const response = await applicationApi.getApplicationsByHiringStages(jobId!)
        return response.stages
      },
      enabled: Boolean(jobId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  details: () =>
    queryOptions({
      queryKey: applicationKeys.details(),
    }),

  detail: (applicationId: string | undefined) =>
    queryOptions({
      queryKey: applicationKeys.detail(applicationId ?? ''),
      enabled: Boolean(applicationId),
      staleTime: 1000 * 60 * 5,
    }),

  reviews: (jobId: string | undefined, applicationId: string | undefined) =>
    queryOptions({
      queryKey: applicationKeys.reviews(applicationId ?? '', jobId),
      queryFn: async (): Promise<ReviewRequest[]> => {
        const response = await applicationApi.getReviewRequests(jobId!, applicationId!)
        return response.reviewRequests
      },
      enabled: Boolean(jobId && applicationId),
      staleTime: 1000 * 60 * 3,
    }),

  notes: (jobId: string | undefined, applicationId: string | undefined) =>
    queryOptions({
      queryKey: applicationKeys.notes(applicationId ?? '', jobId),
      queryFn: async (): Promise<PrivateNoteItem[]> => {
        const response = await applicationApi.getPrivateNotes(jobId!, applicationId!)
        return response.privateNotes ?? []
      },
      enabled: Boolean(jobId && applicationId),
      staleTime: 1000 * 60 * 3,
    }),

  comments: (jobId: string | undefined, applicationId: string | undefined) =>
    queryOptions({
      queryKey: applicationKeys.comments(applicationId ?? ''),
      queryFn: async (): Promise<ApplicationComment[]> => {
        const response = await applicationApi.getComments(jobId!, applicationId!)
        return response.comments
      },
      enabled: Boolean(jobId && applicationId),
      staleTime: 1000 * 60 * 2,
    }),

  emails: (jobId: string | undefined, applicationId: string | undefined) =>
    queryOptions({
      queryKey: [
        ...applicationKeys.detail(applicationId ?? ''),
        'emails',
        ...(jobId ? [jobId] : []),
      ] as const,
      queryFn: async (): Promise<CandidateEmail[]> => {
        const response = await applicationApi.getCandidateEmails(jobId!, applicationId!)
        return response.emails
      },
      enabled: Boolean(jobId && applicationId),
      staleTime: 1000 * 60 * 2,
    }),
}

// ----------------------------------------------------------------------------
// QUERY HOOKS
// ----------------------------------------------------------------------------

/**
 * Query hook for listing applications grouped by hiring stages for a job.
 * Supports backward-compatible signature: (organizationId, jobId, accessToken)
 * or modern signature: (organizationId, jobId)
 */
export const useApplicationsQuery = (
  organizationId: string | undefined,
  jobId: string | undefined,
  legacyAccessToken?: string | null,
) => {
  const isEnabled = Boolean(
    jobId && (legacyAccessToken !== undefined ? Boolean(legacyAccessToken) : true),
  )

  return useQuery({
    ...applicationQueryOptions.byJob(organizationId, jobId),
    enabled: isEnabled,
  })
}

/**
 * Query hook for fetching review requests on an application.
 */
export const useApplicationReviewsQuery = (
  jobId: string | undefined,
  applicationId: string | undefined,
) => {
  return useQuery(applicationQueryOptions.reviews(jobId, applicationId))
}

/**
 * Query hook for fetching private notes on an application.
 */
export const useApplicationPrivateNotesQuery = (
  jobId: string | undefined,
  applicationId: string | undefined,
) => {
  return useQuery(applicationQueryOptions.notes(jobId, applicationId))
}

/**
 * Query hook for fetching comments on an application.
 */
export const useApplicationCommentsQuery = (
  jobId: string | undefined,
  applicationId: string | undefined,
) => {
  return useQuery(applicationQueryOptions.comments(jobId, applicationId))
}

/**
 * Query hook for fetching sent candidate emails on an application.
 */
export const useApplicationEmailsQuery = (
  jobId: string | undefined,
  applicationId: string | undefined,
) => {
  return useQuery(applicationQueryOptions.emails(jobId, applicationId))
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS
// ----------------------------------------------------------------------------

/**
 * Mutation hook for moving an application to a new hiring stage.
 * Features optimistic cache updates for instant 0ms UI transitions.
 */
export const useMoveApplicationStageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      hiringStageId,
    }: {
      jobId: string
      applicationId: string
      hiringStageId: string
    }) =>
      applicationApi.moveApplicationToHiringStage(
        jobId,
        applicationId,
        hiringStageId,
      ),

    onMutate: async ({ jobId, applicationId, hiringStageId }) => {
      // 1. Cancel ongoing queries matching this job's applications
      await queryClient.cancelQueries({
        predicate: (query) =>
          query.queryKey[0] === 'applications' &&
          query.queryKey[1] === 'job' &&
          query.queryKey.includes(jobId),
      })

      // 2. Snapshot current state for rollback
      const previousQueries = queryClient.getQueriesData<ApplicationStage[]>({
        predicate: (query) =>
          query.queryKey[0] === 'applications' &&
          query.queryKey[1] === 'job' &&
          query.queryKey.includes(jobId),
      })

      // 3. Optimistically update the cached stages
      queryClient.setQueriesData<ApplicationStage[]>(
        {
          predicate: (query) =>
            query.queryKey[0] === 'applications' &&
            query.queryKey[1] === 'job' &&
            query.queryKey.includes(jobId),
        },
        (oldStages) => {
          if (!oldStages) return oldStages

          let candidateToMove: any = null

          // Remove candidate from source stage
          const stagesAfterRemoval = oldStages.map((stage) => {
            const match = stage.candidates.find(
              (c: any) =>
                c.applicationId === applicationId ||
                c._id === applicationId,
            )
            if (match) {
              candidateToMove = {
                ...match,
                hiringStageId,
              }
              return {
                ...stage,
                candidates: stage.candidates.filter(
                  (c: any) =>
                    c.applicationId !== applicationId &&
                    c._id !== applicationId,
                ),
              }
            }
            return stage
          })

          if (!candidateToMove) return oldStages

          // Insert candidate into target stage
          return stagesAfterRemoval.map((stage) => {
            if (stage.id === hiringStageId) {
              return {
                ...stage,
                candidates: [candidateToMove, ...stage.candidates],
              }
            }
            return stage
          })
        },
      )

      return { previousQueries }
    },

    onError: (err: any, _variables, context) => {
      // Roll back to previous snapshot if request fails
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
      toast.error(err?.message || 'Failed to move candidate')
    },

    onSuccess: () => {
      toast.success('Candidate moved successfully')
    },

    onSettled: (_data, _error, variables) => {
      // Invalidate applications and candidates queries for this job
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'applications' &&
          query.queryKey.includes(variables.jobId),
      })
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'candidates' &&
          query.queryKey.includes(variables.jobId),
      })
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
    },
  })
}

/**
 * Mutation hook for resolving an application (hired, rejected, withdrawn, active).
 * Features optimistic cache updates so badges update instantly.
 */
export const useResolveApplicationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      input,
    }: {
      jobId: string
      applicationId: string
      input: ResolveApplicationInput
    }) => applicationApi.resolveApplication(jobId, applicationId, input),

    onMutate: async ({ jobId, applicationId, input }) => {
      await queryClient.cancelQueries({
        predicate: (query) =>
          query.queryKey[0] === 'applications' &&
          query.queryKey[1] === 'job' &&
          query.queryKey.includes(jobId),
      })

      const previousQueries = queryClient.getQueriesData<ApplicationStage[]>({
        predicate: (query) =>
          query.queryKey[0] === 'applications' &&
          query.queryKey[1] === 'job' &&
          query.queryKey.includes(jobId),
      })

      queryClient.setQueriesData<ApplicationStage[]>(
        {
          predicate: (query) =>
            query.queryKey[0] === 'applications' &&
            query.queryKey[1] === 'job' &&
            query.queryKey.includes(jobId),
        },
        (oldStages) => {
          if (!oldStages) return oldStages
          return oldStages.map((stage) => ({
            ...stage,
            candidates: stage.candidates.map((c: any) => {
              if (c.applicationId === applicationId || c._id === applicationId) {
                return {
                  ...c,
                  status: input.status,
                  rejectionReason: input.rejectionReason,
                }
              }
              return c
            }),
          }))
        },
      )

      return { previousQueries }
    },

    onError: (err: any, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
      toast.error(err?.message || 'Failed to update application resolution')
    },

    onSuccess: (_data, variables) => {
      const statusLabel =
        variables.input.status === 'hired'
          ? 'hired'
          : variables.input.status === 'rejected'
          ? 'rejected'
          : 'resolved'
      toast.success(`Candidate marked as ${statusLabel}`)
    },

    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'applications' &&
          query.queryKey.includes(variables.jobId),
      })
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'candidates' &&
          query.queryKey.includes(variables.jobId),
      })
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
    },
  })
}


/**
 * Mutation hook for creating a review request.
 */
export const useCreateReviewRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      input,
    }: {
      jobId: string
      applicationId: string
      input: CreateReviewRequestInput
    }) => applicationApi.createReviewRequest(jobId, applicationId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: applicationKeys.reviews(variables.applicationId, variables.jobId),
      })
    },
  })
}

/**
 * Mutation hook for creating a private note.
 */
export const useCreatePrivateNoteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      input,
    }: {
      jobId: string
      applicationId: string
      input: CreatePrivateNoteInput | string
    }) => applicationApi.createPrivateNote(jobId, applicationId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: applicationKeys.notes(variables.applicationId, variables.jobId),
      })
    },
  })
}

/**
 * Mutation hook for adding a comment.
 */
export const useAddApplicationCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      input,
    }: {
      jobId: string
      applicationId: string
      input: AddApplicationCommentInput | string
    }) => applicationApi.addComment(jobId, applicationId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: applicationKeys.comments(variables.applicationId),
      })
    },
  })
}

/**
 * Mutation hook for editing a comment.
 */
export const useEditApplicationCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      commentId,
      input,
    }: {
      jobId: string
      applicationId: string
      commentId: string
      input: EditApplicationCommentInput | string
    }) =>
      applicationApi.editComment(jobId, applicationId, commentId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: applicationKeys.comments(variables.applicationId),
      })
    },
  })
}

/**
 * Mutation hook for deleting a comment.
 */
export const useDeleteApplicationCommentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      commentId,
    }: {
      jobId: string
      applicationId: string
      commentId: string
    }) => applicationApi.deleteComment(jobId, applicationId, commentId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: applicationKeys.comments(variables.applicationId),
      })
    },
  })
}

/**
 * Mutation hook for sending an email to a candidate.
 */
export const useSendCandidateEmailMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      jobId,
      applicationId,
      input,
    }: {
      jobId: string
      applicationId: string
      input: SendCandidateEmailInput
    }) => applicationApi.sendCandidateEmail(jobId, applicationId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'applications' &&
          query.queryKey[1] === 'detail' &&
          query.queryKey[2] === variables.applicationId,
      })
    },
  })
}

// ----------------------------------------------------------------------------
// INVALIDATION HELPER HOOK
// ----------------------------------------------------------------------------

export const useInvalidateApplicationQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: applicationKeys.all }),
    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() }),
    invalidateByJob: (organizationId: string, jobId: string) =>
      queryClient.invalidateQueries({
        queryKey: applicationKeys.byJob(organizationId, jobId),
      }),
    invalidateDetail: (applicationId: string) =>
      queryClient.invalidateQueries({
        queryKey: applicationKeys.detail(applicationId),
      }),
    invalidateReviews: (applicationId: string, jobId?: string) =>
      queryClient.invalidateQueries({
        queryKey: applicationKeys.reviews(applicationId, jobId),
      }),
    invalidateNotes: (applicationId: string, jobId?: string) =>
      queryClient.invalidateQueries({
        queryKey: applicationKeys.notes(applicationId, jobId),
      }),
    invalidateComments: (applicationId: string) =>
      queryClient.invalidateQueries({
        queryKey: applicationKeys.comments(applicationId),
      }),
  }
}
