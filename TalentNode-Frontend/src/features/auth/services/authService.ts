import { authApi } from '../../../services/api/authApi'
import type {
  AuthResponse,
  CheckUserEmailInput,
  CheckUserEmailResponse,
  LoginUserInput,
  ProfileResponse,
  RegisterUserInput,
} from '../../../types/apiTypes'

/**
 * Authentication Service
 * Delegates to centralized authApi and client.ts with automatic
 * Authorization bearer injection, JWT expiration checking, and 401 interception.
 */

export const checkUserEmail = async (
  input: CheckUserEmailInput,
): Promise<CheckUserEmailResponse> => {
  return authApi.checkEmail(input)
}

export const registerUser = async (
  input: RegisterUserInput,
): Promise<AuthResponse> => {
  return authApi.register(input)
}

export const loginUser = async (
  input: LoginUserInput,
): Promise<AuthResponse> => {
  return authApi.login(input)
}

export const getUserProfile = async (
  _accessToken?: string,
): Promise<ProfileResponse> => {
  return authApi.getProfile()
}

export const updateUserProfile = async (
  _accessToken: string,
  input: { username: string; email: string },
): Promise<ProfileResponse> => {
  return authApi.updateProfile(input)
}
