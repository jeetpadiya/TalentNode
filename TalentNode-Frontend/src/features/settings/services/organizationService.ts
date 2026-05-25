import type { ApiErrorResponse } from '../../../types/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

type OrganizationResponse = {
  success: boolean
  message?: string
  organization: Organization
}

export type Organization = {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  allowedDomains: string[]
  logoUrl: string | null
  createdBy: string
}

export type UpdateOrganizationInput = {
  name: string
  description?: string
  website?: string
  allowedDomains?: string[]
  logoUrl?: string
}

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

const identity = <T>(data: T) => data

export const organizationService = {
  getOrganizationById: async (
    organizationId: string,
    accessToken: string,
  ): Promise<OrganizationResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return parseApiResponse(response, (data) =>
      identity(data as OrganizationResponse),
    )
  },

  updateOrganization: async (
    organizationId: string,
    accessToken: string,
    payload: UpdateOrganizationInput,
  ): Promise<OrganizationResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${organizationId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    return parseApiResponse(response, (data) =>
      identity(data as OrganizationResponse),
    )
  },
}

