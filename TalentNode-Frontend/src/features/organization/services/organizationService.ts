import type { ApiErrorResponse } from '../../../types/types'
import {
  createOrganizationSchema,
  organizationResponseSchema,
  organizationsResponseSchema,
  type CreateOrganizationInput,
  type OrganizationResponse,
  type OrganizationsResponse,
} from './organizationSchemas'

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

export const createOrganization = async (
  input: CreateOrganizationInput,
  accessToken: string,
): Promise<OrganizationResponse> => {
  const body = createOrganizationSchema.parse(input)

  const response = await fetch(`${API_BASE_URL}/organizations/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return parseApiResponse(response, (data) =>
    organizationResponseSchema.parse(data),
  )
}

export const getOrganizations = async (
  accessToken: string,
): Promise<OrganizationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/organizations`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseApiResponse(response, (data) =>
    organizationsResponseSchema.parse(data),
  )
}

export const getOrganizationById = async (
  organizationId: string,
  accessToken: string,
): Promise<OrganizationResponse> => {
  const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseApiResponse(response, (data) =>
    organizationResponseSchema.parse(data),
  )
}
