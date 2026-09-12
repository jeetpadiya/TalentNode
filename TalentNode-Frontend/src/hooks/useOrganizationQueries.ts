import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../lib/queryKeys'
import { organizationApi } from '../services/api/organizationApi'
import type {
  CreateOrganizationInput,
  CreateOrganizationInviteInput,
  UpdateOrganizationInput,
} from '../types/apiTypes'

/**
 * TanStack Query Options Factory for Organizations
 * Useful for queryClient.fetchQuery(), prefetching, or standard useQuery() calls.
 */
export const organizationQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: organizationKeys.all,
    }),

  list: () =>
    queryOptions({
      queryKey: organizationKeys.list(),
      queryFn: () => organizationApi.getOrganizations(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  detail: (organizationId: string | undefined) =>
    queryOptions({
      queryKey: organizationKeys.detail(organizationId ?? ''),
      queryFn: () => organizationApi.getOrganizationById(organizationId!),
      enabled: Boolean(organizationId),
      staleTime: 1000 * 60 * 5,
    }),

  team: (enabled = true) =>
    queryOptions({
      queryKey: organizationKeys.team(),
      queryFn: () => organizationApi.getOrganizationTeam(),
      enabled,
      staleTime: 1000 * 60 * 3,
    }),

  invite: (token: string | undefined) =>
    queryOptions({
      queryKey: organizationKeys.invite(token ?? ''),
      queryFn: () => organizationApi.getInviteByToken(token!),
      enabled: Boolean(token),
      staleTime: 1000 * 60 * 2,
    }),
}

// ----------------------------------------------------------------------------
// QUERY HOOKS
// ----------------------------------------------------------------------------

/**
 * Query hook for listing user's accessible organizations.
 */
export const useOrganizationsQuery = () => {
  return useQuery(organizationQueryOptions.list())
}

/**
 * Query hook for fetching details of a specific organization.
 */
export const useOrganizationQuery = (organizationId: string | undefined) => {
  return useQuery(organizationQueryOptions.detail(organizationId))
}

/**
 * Query hook for fetching the active organization's team members.
 */
export const useOrganizationTeamQuery = (enabled = true) => {
  return useQuery(organizationQueryOptions.team(enabled))
}

/**
 * Query hook for fetching public invite preview details by token.
 */
export const useOrganizationInviteQuery = (token: string | undefined) => {
  return useQuery(organizationQueryOptions.invite(token))
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS
// ----------------------------------------------------------------------------

/**
 * Mutation hook for creating a new organization.
 */
export const useCreateOrganizationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => organizationApi.createOrganization(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
    },
  })
}

/**
 * Mutation hook for updating an existing organization.
 */
export const useUpdateOrganizationMutation = (organizationId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) =>
      organizationApi.updateOrganization(organizationId!, input),
    onSuccess: (data) => {
      if (organizationId) {
        queryClient.setQueryData(organizationKeys.detail(organizationId), data)
        void queryClient.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) })
      }
      void queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
    },
  })
}

/**
 * Mutation hook for inviting a team member to the organization.
 */
export const useInviteTeamMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOrganizationInviteInput) => organizationApi.inviteTeamMember(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.team() })
    },
  })
}

/**
 * Mutation hook for deactivating a team member.
 */
export const useDeactivateTeamMemberMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => organizationApi.deactivateTeamMember(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.team() })
    },
  })
}

/**
 * Mutation hook for revoking an organization team invite.
 */
export const useRevokeInviteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: string) => organizationApi.revokeInvite(inviteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.team() })
    },
  })
}

/**
 * Mutation hook for accepting an organization invite.
 */
export const useAcceptInviteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => organizationApi.acceptInvite(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.all })
    },
  })
}

// ----------------------------------------------------------------------------
// INVALIDATION HELPER HOOK
// ----------------------------------------------------------------------------

export const useInvalidateOrganizationQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: organizationKeys.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: organizationKeys.lists() }),
    invalidateDetail: (orgId: string) =>
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(orgId) }),
    invalidateTeam: () => queryClient.invalidateQueries({ queryKey: organizationKeys.team() }),
  }
}
