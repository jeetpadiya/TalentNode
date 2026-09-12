import { client } from '../../lib/client'
import type {
  AuthResponse,
  CheckUserEmailInput,
  CheckUserEmailResponse,
  LoginUserInput,
  ProfileResponse,
  RegisterUserInput,
  UpdateProfileInput,
  UserPreferences,
  UserPreferencesResponse,
} from '../../types/apiTypes'

/**
 * Centralized Auth & User API Service
 * 
 * Interacts with /api/users and /api/user endpoints using the centralized client.ts
 * with automatic authorization headers, base URL handling, parameter serialization,
 * and unified error interception.
 */
export const authApi = {
  /**
   * Check if an email already exists and determine the next auth step (POST /api/users/check-email).
   */
  checkEmail: (input: CheckUserEmailInput): Promise<CheckUserEmailResponse> => {
    return client.post<CheckUserEmailResponse>('/users/check-email', input, {
      skipAuth: true,
    })
  },

  /**
   * Register a new user account (POST /api/users/register).
   */
  register: (input: RegisterUserInput): Promise<AuthResponse> => {
    return client.post<AuthResponse>('/users/register', input, {
      skipAuth: true,
    })
  },

  /**
   * Login with email and password (POST /api/users/login).
   */
  login: (input: LoginUserInput): Promise<AuthResponse> => {
    return client.post<AuthResponse>('/users/login', input, {
      skipAuth: true,
    })
  },

  /**
   * Fetch current authenticated user's profile (GET /api/users/profile).
   */
  getProfile: (): Promise<ProfileResponse> => {
    return client.get<ProfileResponse>('/users/profile')
  },

  /**
   * Update current authenticated user's profile (PUT /api/users/profile).
   */
  updateProfile: (input: UpdateProfileInput): Promise<ProfileResponse> => {
    return client.put<ProfileResponse>('/users/profile', input)
  },

  /**
   * Fetch current authenticated user's notification preferences (GET /api/user/preferences).
   */
  getUserPreferences: (): Promise<UserPreferencesResponse> => {
    return client.get<UserPreferencesResponse>('/user/preferences')
  },

  /**
   * Update current authenticated user's notification preferences (PUT /api/user/preferences).
   */
  updateUserPreferences: (
    preferences: UserPreferences,
  ): Promise<UserPreferencesResponse> => {
    return client.put<UserPreferencesResponse>('/user/preferences', preferences)
  },
}

export default authApi
