import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../app/store/AuthStore'
import { userKeys } from '../lib/queryKeys'
import { authApi } from '../services/api/authApi'
import type {
  CheckUserEmailInput,
  LoginUserInput,
  RegisterUserInput,
  UpdateProfileInput,
  User,
  UserPreferences,
  UserPreferencesResponse,
} from '../types/apiTypes'

/**
 * TanStack Query Options Factory for User & Auth
 * Useful for queryClient.fetchQuery(), prefetching, or standard useQuery() calls.
 */
export const userQueryOptions = {
  all: () =>
    queryOptions({
      queryKey: userKeys.all,
    }),

  profile: (enabled = true) =>
    queryOptions({
      queryKey: userKeys.profile(),
      queryFn: async (): Promise<User> => {
        const response = await authApi.getProfile()
        return response.user
      },
      enabled,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  preferences: (enabled = true) =>
    queryOptions({
      queryKey: userKeys.preferences(),
      queryFn: (): Promise<UserPreferencesResponse> =>
        authApi.getUserPreferences(),
      enabled,
      staleTime: 1000 * 60 * 5,
    }),
}

// ----------------------------------------------------------------------------
// QUERY HOOKS
// ----------------------------------------------------------------------------

/**
 * Query hook for fetching current user profile.
 */
export const useUserProfileQuery = (enabled = true) => {
  return useQuery(userQueryOptions.profile(enabled))
}

/**
 * Query hook for fetching current user preferences.
 */
export const useUserPreferencesSettingQuery = (enabled = true) => {
  return useQuery(userQueryOptions.preferences(enabled))
}

// ----------------------------------------------------------------------------
// MUTATION HOOKS
// ----------------------------------------------------------------------------

/**
 * Mutation hook for checking email availability.
 */
export const useCheckEmailMutation = () => {
  return useMutation({
    mutationFn: (input: CheckUserEmailInput) => authApi.checkEmail(input),
  })
}

/**
 * Mutation hook for registering a new user.
 */
export const useRegisterMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (input: RegisterUserInput) => authApi.register(input),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
    },
  })
}

/**
 * Mutation hook for logging in.
 */
export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (input: LoginUserInput) => authApi.login(input),
    onSuccess: (data) => {
      setAuth(data.user, data.token)
    },
  })
}

/**
 * Mutation hook for updating user profile.
 */
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => authApi.updateProfile(input),
    onSuccess: (data) => {
      setUser(data.user)
      queryClient.setQueryData(userKeys.profile(), data.user)
      void queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    },
  })
}

/**
 * Mutation hook for updating user preferences.
 */
export const useUpdatePreferencesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (preferences: UserPreferences) =>
      authApi.updateUserPreferences(preferences),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.preferences(), data)
      void queryClient.invalidateQueries({ queryKey: userKeys.preferences() })
    },
  })
}

// ----------------------------------------------------------------------------
// INVALIDATION HELPER HOOK
// ----------------------------------------------------------------------------

export const useInvalidateUserQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
    invalidateProfile: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.profile() }),
    invalidatePreferences: () =>
      queryClient.invalidateQueries({ queryKey: userKeys.preferences() }),
  }
}
