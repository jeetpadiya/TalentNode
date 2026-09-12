import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jobKeys } from '../lib/queryKeys'
import { jobApi } from '../services/api/jobApi'
import type {
  AddJobHiringTeamMemberInput,
  CreateCustomQuestionInput,
  CreateHiringStageInput,
  CreateJobInput,
  Job,
  JobStatus,
  SaveHiringPipelineInput,
  UpdateApplicationFormInput,
  UpdateHiringStageInput,
  UpdateJobInput,
} from '../types/apiTypes'

/**
 * TanStack Query Options Factory for Jobs
 * Useful for queryClient.fetchQuery(), prefetching, or standard useQuery() calls.
 */
export const jobQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: jobKeys.all,
    }),

  lists: () =>
    queryOptions({
      queryKey: jobKeys.lists(),
    }),

  list: (organizationId?: string, filters?: Record<string, unknown>) =>
    queryOptions({
      queryKey: jobKeys.list(organizationId ?? '', filters),
      queryFn: async (): Promise<Job[]> => {
        const response = await jobApi.getJobs(filters)
        return response.jobs
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  details: () =>
    queryOptions({
      queryKey: jobKeys.details(),
    }),

  detail: (jobId: string | undefined) =>
    queryOptions({
      queryKey: jobKeys.detail(jobId ?? ''),
      queryFn: async (): Promise<Job> => {
        const response = await jobApi.getJobById(jobId!)
        return response.job
      },
      enabled: Boolean(jobId),
      staleTime: 1000 * 60 * 5,
    }),

  stages: (jobId: string | undefined) =>
    queryOptions({
      queryKey: jobKeys.stages(jobId ?? ''),
      queryFn: async () => {
        const response = await jobApi.getHiringStages(jobId!)
        return response.hiringStages
      },
      enabled: Boolean(jobId),
      staleTime: 1000 * 60 * 5,
    }),

  form: (jobId: string | undefined) =>
    queryOptions({
      queryKey: jobKeys.form(jobId ?? ''),
      queryFn: async () => {
        const response = await jobApi.getApplicationForm(jobId!)
        return response.applicationForm
      },
      enabled: Boolean(jobId),
      staleTime: 1000 * 60 * 5,
    }),

  team: (jobId: string | undefined) =>
    queryOptions({
      queryKey: jobKeys.team(jobId ?? ''),
      queryFn: () => jobApi.getHiringTeam(jobId!),
      enabled: Boolean(jobId),
      staleTime: 1000 * 60 * 3,
    }),

  categories: (organizationId: string | undefined) =>
    queryOptions({
      queryKey: jobKeys.categories(organizationId ?? ''),
      queryFn: async () => {
        const response = await jobApi.getJobCategories(organizationId!)
        return response.categories
      },
      enabled: Boolean(organizationId),
      staleTime: 1000 * 60 * 5,
    }),
}

// ----------------------------------------------------------------------------
// QUERY HOOKS
// ----------------------------------------------------------------------------

/**
 * Query hook for listing all jobs in the organization.
 * Supports backward-compatible signature: (organizationId, accessToken)
 * or modern signature: (organizationId, filters)
 */
export const useJobsQuery = (
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
    ...jobQueryOptions.list(organizationId, filters),
    enabled: isEnabled,
  })
}

/**
 * Query hook for fetching details of a specific job by ID.
 * Supports backward-compatible signature: (jobId, accessToken)
 * or modern signature: (jobId)
 */
export const useJobDetailQuery = (
  jobId: string | undefined,
  legacyAccessToken?: string | null,
) => {
  const isEnabled = Boolean(
    jobId && (legacyAccessToken !== undefined ? Boolean(legacyAccessToken) : true),
  )

  return useQuery({
    ...jobQueryOptions.detail(jobId),
    enabled: isEnabled,
  })
}

/**
 * Query hook for fetching hiring stages for a job.
 */
export const useJobHiringStagesQuery = (jobId: string | undefined) => {
  return useQuery(jobQueryOptions.stages(jobId))
}

/**
 * Query hook for fetching application form configuration for a job.
 */
export const useJobApplicationFormQuery = (jobId: string | undefined) => {
  return useQuery(jobQueryOptions.form(jobId))
}

/**
 * Query hook for fetching hiring team members assigned to a job.
 */
export const useJobHiringTeamQuery = (jobId: string | undefined) => {
  return useQuery(jobQueryOptions.team(jobId))
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS - JOBS
// ----------------------------------------------------------------------------

/**
 * Mutation hook for creating a new job.
 */
export const useCreateJobMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateJobInput) => jobApi.createJob(input),
    onSuccess: (data) => {
      queryClient.setQueryData(jobKeys.detail(data.job.id), data.job)
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

/**
 * Mutation hook for updating job details.
 */
export const useUpdateJobMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: UpdateJobInput }) => {
      const targetId = id ?? jobId
      if (!targetId) throw new Error('Job ID is required for update')
      return jobApi.updateJob(targetId, input)
    },
    onSuccess: (data, variables) => {
      const targetId = variables.id ?? jobId
      if (targetId) {
        queryClient.setQueryData(jobKeys.detail(targetId), data.job)
        void queryClient.invalidateQueries({ queryKey: jobKeys.detail(targetId) })
      }
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

/**
 * Mutation hook for updating job status.
 */
export const useUpdateJobStatusMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id?: string; status: JobStatus }) => {
      const targetId = id ?? jobId
      if (!targetId) throw new Error('Job ID is required for status update')
      return jobApi.updateJobStatus(targetId, status)
    },
    onSuccess: (data, variables) => {
      const targetId = variables.id ?? jobId
      if (targetId) {
        queryClient.setQueryData(jobKeys.detail(targetId), data.job)
        void queryClient.invalidateQueries({ queryKey: jobKeys.detail(targetId) })
      }
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

/**
 * Mutation hook for publishing or unpublishing a job.
 */
export const useUpdateJobPublishMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      isPublished,
    }: {
      id?: string
      isPublished: boolean
    }) => {
      const targetId = id ?? jobId
      if (!targetId) throw new Error('Job ID is required for publish update')
      return jobApi.updateJobPublish(targetId, isPublished)
    },
    onSuccess: (data, variables) => {
      const targetId = variables.id ?? jobId
      if (targetId) {
        queryClient.setQueryData(jobKeys.detail(targetId), data.job)
        void queryClient.invalidateQueries({ queryKey: jobKeys.detail(targetId) })
      }
      void queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    },
  })
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS - HIRING STAGES & PIPELINE
// ----------------------------------------------------------------------------

/**
 * Mutation hook for adding a hiring stage.
 */
export const useCreateHiringStageMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      input,
    }: {
      targetJobId?: string
      input: CreateHiringStageInput
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.createHiringStage(jId, input)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.stages(jId) })
        void queryClient.invalidateQueries({ queryKey: jobKeys.detail(jId) })
      }
    },
  })
}

/**
 * Mutation hook for updating a hiring stage.
 */
export const useUpdateHiringStageMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      stageId,
      input,
    }: {
      targetJobId?: string
      stageId: string
      input: UpdateHiringStageInput
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.updateHiringStage(jId, stageId, input)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.stages(jId) })
        void queryClient.invalidateQueries({ queryKey: jobKeys.detail(jId) })
      }
    },
  })
}

/**
 * Mutation hook for deleting a hiring stage.
 */
export const useDeleteHiringStageMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      stageId,
    }: {
      targetJobId?: string
      stageId: string
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.deleteHiringStage(jId, stageId)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.stages(jId) })
        void queryClient.invalidateQueries({ queryKey: jobKeys.detail(jId) })
      }
    },
  })
}

/**
 * Mutation hook for saving the entire reordered hiring pipeline.
 */
export const useSaveHiringPipelineMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      stages,
    }: {
      targetJobId?: string
      stages: SaveHiringPipelineInput[]
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.saveHiringPipeline(jId, stages)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.stages(jId) })
        void queryClient.invalidateQueries({ queryKey: jobKeys.detail(jId) })
      }
    },
  })
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS - APPLICATION FORM
// ----------------------------------------------------------------------------

/**
 * Mutation hook for updating application form settings.
 */
export const useUpdateApplicationFormMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      applicationForm,
    }: {
      targetJobId?: string
      applicationForm: UpdateApplicationFormInput
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.updateApplicationForm(jId, applicationForm)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.form(jId) })
      }
    },
  })
}

/**
 * Mutation hook for creating a custom question.
 */
export const useCreateCustomQuestionMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      question,
    }: {
      targetJobId?: string
      question: CreateCustomQuestionInput
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.createCustomQuestion(jId, question)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.form(jId) })
      }
    },
  })
}

/**
 * Mutation hook for updating a custom question.
 */
export const useUpdateCustomQuestionMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      questionKey,
      question,
    }: {
      targetJobId?: string
      questionKey: string
      question: Partial<CreateCustomQuestionInput>
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.updateCustomQuestion(jId, questionKey, question)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.form(jId) })
      }
    },
  })
}

/**
 * Mutation hook for deleting a custom question.
 */
export const useDeleteCustomQuestionMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      questionKey,
    }: {
      targetJobId?: string
      questionKey: string
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.deleteCustomQuestion(jId, questionKey)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.form(jId) })
      }
    },
  })
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS - HIRING TEAM
// ----------------------------------------------------------------------------

/**
 * Mutation hook for adding a hiring team member to a job.
 */
export const useAddJobHiringTeamMemberMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      input,
    }: {
      targetJobId?: string
      input: AddJobHiringTeamMemberInput
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.addHiringTeamMember(jId, input)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.team(jId) })
      }
    },
  })
}

/**
 * Mutation hook for removing a hiring team member from a job.
 */
export const useRemoveJobHiringTeamMemberMutation = (jobId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetJobId,
      userId,
    }: {
      targetJobId?: string
      userId: string
    }) => {
      const jId = targetJobId ?? jobId
      if (!jId) throw new Error('Job ID is required')
      return jobApi.removeHiringTeamMember(jId, userId)
    },
    onSuccess: (_data, variables) => {
      const jId = variables.targetJobId ?? jobId
      if (jId) {
        void queryClient.invalidateQueries({ queryKey: jobKeys.team(jId) })
      }
    },
  })
}

// ----------------------------------------------------------------------------
// INVALIDATION HELPER HOOK
// ----------------------------------------------------------------------------

export const useInvalidateJobQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: jobKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: jobKeys.lists() }),
    invalidateList: (organizationId: string, filters?: Record<string, unknown>) =>
      queryClient.invalidateQueries({
        queryKey: jobKeys.list(organizationId, filters),
      }),
    invalidateDetail: (jobId: string) =>
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
    invalidateStages: (jobId: string) =>
      queryClient.invalidateQueries({ queryKey: jobKeys.stages(jobId) }),
    invalidateForm: (jobId: string) =>
      queryClient.invalidateQueries({ queryKey: jobKeys.form(jobId) }),
    invalidateTeam: (jobId: string) =>
      queryClient.invalidateQueries({ queryKey: jobKeys.team(jobId) }),
    invalidateCategories: (organizationId: string) =>
      queryClient.invalidateQueries({
        queryKey: jobKeys.categories(organizationId),
      }),
  }
}
