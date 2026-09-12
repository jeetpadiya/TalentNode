import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsKeys } from '../lib/queryKeys'
import { settingsApi } from '../services/api/settingsApi'
import type {
  CreateJobCategoryInput,
  CreateMessageTemplateInput,
  CreateReviewTemplateInput,
  JobCategory,
  MessageTemplate,
  ReviewTemplate,
  UpdateJobCategoryInput,
  UpdateMessageTemplateInput,
  UpdateReviewTemplateInput,
  UserPreferences,
  UserPreferencesResponse,
} from '../types/apiTypes'

/**
 * TanStack Query Options Factory for Settings
 * Useful for queryClient.fetchQuery(), prefetching, or standard useQuery() calls.
 */
export const settingsQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: settingsKeys.all,
    }),

  categories: (organizationId: string | undefined) =>
    queryOptions({
      queryKey: settingsKeys.categories(organizationId ?? ''),
      queryFn: async (): Promise<JobCategory[]> => {
        const response = await settingsApi.getJobCategories(organizationId!)
        return response.categories
      },
      enabled: Boolean(organizationId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  messageTemplates: (organizationId: string | undefined) =>
    queryOptions({
      queryKey: settingsKeys.messageTemplates(organizationId ?? ''),
      queryFn: async (): Promise<MessageTemplate[]> => {
        const response = await settingsApi.getMessageTemplates(organizationId!)
        return response.templates
      },
      enabled: Boolean(organizationId),
      staleTime: 1000 * 60 * 5,
    }),

  reviewTemplates: (organizationId: string | undefined) =>
    queryOptions({
      queryKey: settingsKeys.reviewTemplates(organizationId ?? ''),
      queryFn: async (): Promise<ReviewTemplate[]> => {
        const response = await settingsApi.getReviewTemplates(organizationId!)
        return response.templates
      },
      enabled: Boolean(organizationId),
      staleTime: 1000 * 60 * 5,
    }),

  preferences: () =>
    queryOptions({
      queryKey: settingsKeys.preferences(),
      queryFn: (): Promise<UserPreferencesResponse> =>
        settingsApi.getUserPreferences(),
      staleTime: 1000 * 60 * 5,
    }),
}

// ----------------------------------------------------------------------------
// QUERY HOOKS
// ----------------------------------------------------------------------------

/**
 * Query hook for listing job categories for an organization.
 */
export const useJobCategoriesQuery = (organizationId: string | undefined) => {
  return useQuery(settingsQueryOptions.categories(organizationId))
}

/**
 * Query hook for listing message templates for an organization.
 */
export const useMessageTemplatesQuery = (organizationId: string | undefined) => {
  return useQuery(settingsQueryOptions.messageTemplates(organizationId))
}

/**
 * Query hook for listing review templates for an organization.
 */
export const useReviewTemplatesQuery = (organizationId: string | undefined) => {
  return useQuery(settingsQueryOptions.reviewTemplates(organizationId))
}

/**
 * Query hook for fetching user notification preferences.
 */
export const useUserPreferencesQuery = () => {
  return useQuery(settingsQueryOptions.preferences())
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS - JOB CATEGORIES
// ----------------------------------------------------------------------------

/**
 * Mutation hook for creating a job category.
 */
export const useCreateJobCategoryMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      input,
    }: {
      targetOrgId?: string
      input: CreateJobCategoryInput
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.createJobCategory(orgId, input)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.categories(orgId),
        })
      }
    },
  })
}

/**
 * Mutation hook for updating a job category.
 */
export const useUpdateJobCategoryMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      categoryId,
      input,
    }: {
      targetOrgId?: string
      categoryId: string
      input: UpdateJobCategoryInput
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.updateJobCategory(orgId, categoryId, input)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.categories(orgId),
        })
      }
    },
  })
}

/**
 * Mutation hook for deleting a job category.
 */
export const useDeleteJobCategoryMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      categoryId,
    }: {
      targetOrgId?: string
      categoryId: string
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.deleteJobCategory(orgId, categoryId)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.categories(orgId),
        })
      }
    },
  })
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS - MESSAGE TEMPLATES
// ----------------------------------------------------------------------------

/**
 * Mutation hook for creating a message template.
 */
export const useCreateMessageTemplateMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      input,
    }: {
      targetOrgId?: string
      input: CreateMessageTemplateInput
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.createMessageTemplate(orgId, input)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.messageTemplates(orgId),
        })
      }
    },
  })
}

/**
 * Mutation hook for updating a message template.
 */
export const useUpdateMessageTemplateMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      templateId,
      input,
    }: {
      targetOrgId?: string
      templateId: string
      input: UpdateMessageTemplateInput
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.updateMessageTemplate(orgId, templateId, input)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.messageTemplates(orgId),
        })
      }
    },
  })
}

/**
 * Mutation hook for deleting a message template.
 */
export const useDeleteMessageTemplateMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      templateId,
    }: {
      targetOrgId?: string
      templateId: string
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.deleteMessageTemplate(orgId, templateId)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.messageTemplates(orgId),
        })
      }
    },
  })
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS - REVIEW TEMPLATES
// ----------------------------------------------------------------------------

/**
 * Mutation hook for creating a review template.
 */
export const useCreateReviewTemplateMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      input,
    }: {
      targetOrgId?: string
      input: CreateReviewTemplateInput
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.createReviewTemplate(orgId, input)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.reviewTemplates(orgId),
        })
      }
    },
  })
}

/**
 * Mutation hook for updating a review template.
 */
export const useUpdateReviewTemplateMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      templateId,
      input,
    }: {
      targetOrgId?: string
      templateId: string
      input: UpdateReviewTemplateInput
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.updateReviewTemplate(orgId, templateId, input)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.reviewTemplates(orgId),
        })
      }
    },
  })
}

/**
 * Mutation hook for deleting a review template.
 */
export const useDeleteReviewTemplateMutation = (organizationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetOrgId,
      templateId,
    }: {
      targetOrgId?: string
      templateId: string
    }) => {
      const orgId = targetOrgId ?? organizationId
      if (!orgId) throw new Error('Organization ID is required')
      return settingsApi.deleteReviewTemplate(orgId, templateId)
    },
    onSuccess: (_data, variables) => {
      const orgId = variables.targetOrgId ?? organizationId
      if (orgId) {
        void queryClient.invalidateQueries({
          queryKey: settingsKeys.reviewTemplates(orgId),
        })
      }
    },
  })
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS - USER PREFERENCES
// ----------------------------------------------------------------------------

/**
 * Mutation hook for updating user notification preferences.
 */
export const useUpdateUserPreferencesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (preferences: UserPreferences) =>
      settingsApi.updateUserPreferences(preferences),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.preferences(), data)
      void queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(),
      })
    },
  })
}

// ----------------------------------------------------------------------------
// INVALIDATION HELPER HOOK
// ----------------------------------------------------------------------------

export const useInvalidateSettingsQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: settingsKeys.all }),
    invalidateCategories: (organizationId: string) =>
      queryClient.invalidateQueries({
        queryKey: settingsKeys.categories(organizationId),
      }),
    invalidateMessageTemplates: (organizationId: string) =>
      queryClient.invalidateQueries({
        queryKey: settingsKeys.messageTemplates(organizationId),
      }),
    invalidateReviewTemplates: (organizationId: string) =>
      queryClient.invalidateQueries({
        queryKey: settingsKeys.reviewTemplates(organizationId),
      }),
    invalidatePreferences: () =>
      queryClient.invalidateQueries({
        queryKey: settingsKeys.preferences(),
      }),
  }
}
