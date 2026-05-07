import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import {
  checkUserEmail,
  getUserProfile,
  loginUser,
  registerUser,
} from '../../features/auth/services/authService'
import { userSchema } from '../../features/auth/services/authSchemas'
import type { ApiErrorResponse, AuthStore, User } from '../../types/types'

type PersistedAuthState = {
  user: User | null
  accessToken: string | null
}

const persistedAuthSchema = z.object({
  user: userSchema.nullable(),
  accessToken: z.string().min(1).nullable(),
})

const getIsAuthenticated = (user: User | null, accessToken: string | null) =>
  Boolean(user && accessToken)

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiErrorResponse).message
  }

  return 'Something went wrong. Please try again.'
}

export const useAuthStore = create<AuthStore>()(
  persist<AuthStore, [], [], PersistedAuthState>(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, token) => {
        const parsedUser = userSchema.parse(user)

        set({
          user: parsedUser,
          accessToken: token,
          isAuthenticated: getIsAuthenticated(parsedUser, token),
          error: null,
        })
      },

      setUser: (user) => {
        const parsedUser = userSchema.parse(user)

        set((state) => ({
          user: parsedUser,
          isAuthenticated: getIsAuthenticated(parsedUser, state.accessToken),
          error: null,
        }))
      },

      checkEmail: async (email) => {
        set({ isLoading: true, error: null })

        try {
          const response = await checkUserEmail({ email })

          set({ isLoading: false })
          return response.nextStep
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) })
          throw error
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          const response = await loginUser({ email, password })
          const parsedUser = userSchema.parse(response.user)

          set({
            user: parsedUser,
            accessToken: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) })
          throw error
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true, error: null })

        try {
          const response = await registerUser({ username, email, password })
          const parsedUser = userSchema.parse(response.user)

          set({
            user: parsedUser,
            accessToken: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({ isLoading: false, error: getErrorMessage(error) })
          throw error
        }
      },

      fetchProfile: async () => {
        const { accessToken } = get()

        if (!accessToken) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'You need to login first.',
          })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const response = await getUserProfile(accessToken)
          const parsedUser = userSchema.parse(response.user)

          set({
            user: parsedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: getErrorMessage(error),
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: 'talentnode-auth',
      storage: createJSONStorage<PersistedAuthState>(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      merge: (persistedState, currentState) => {
        const parsedState = persistedAuthSchema.safeParse(persistedState)

        if (!parsedState.success) {
          return currentState
        }

        const { user, accessToken } = parsedState.data

        return {
          ...currentState,
          user,
          accessToken,
          isAuthenticated: getIsAuthenticated(user, accessToken),
        }
      },
    },
  ),
)
