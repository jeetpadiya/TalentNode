import type { ApiErrorResponse } from '../../../types/types'
import {
  authResponseSchema,
  checkUserEmailResponseSchema,
  checkUserEmailSchema,
  loginUserSchema,
  profileResponseSchema,
  registerUserSchema,
  type AuthResponse,
  type CheckUserEmailInput,
  type CheckUserEmailResponse,
  type LoginUserInput,
  type ProfileResponse,
  type RegisterUserInput,
} from './authSchemas'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

const parseApiResponse = async <T>(
  response: Response,
  parser: (data: unknown) => T,
): Promise<T> => {
  const data: unknown = await response.json()

  if (!response.ok) {
    throw data as ApiErrorResponse
  }

  return parser(data)
}

export const checkUserEmail = async (
  input: CheckUserEmailInput,
): Promise<CheckUserEmailResponse> => {
  const body = checkUserEmailSchema.parse(input)

  const response = await fetch(`${API_BASE_URL}/users/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return parseApiResponse(response, (data) =>
    checkUserEmailResponseSchema.parse(data),
  )
}

export const registerUser = async (
  input: RegisterUserInput,
): Promise<AuthResponse> => {
  const body = registerUserSchema.parse(input)

  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return parseApiResponse(response, (data) => authResponseSchema.parse(data))
}

export const loginUser = async (
  input: LoginUserInput,
): Promise<AuthResponse> => {
  const body = loginUserSchema.parse(input)

  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return parseApiResponse(response, (data) => authResponseSchema.parse(data))
}

export const getUserProfile = async (
  accessToken: string,
): Promise<ProfileResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseApiResponse(response, (data) => profileResponseSchema.parse(data))
}
