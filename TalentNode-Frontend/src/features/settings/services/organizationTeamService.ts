import type { ApiErrorResponse } from '../../../types/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

type OrganizationTeamMemberRole =
  | 'recruiter'
  | 'hiring_manager'
  | 'interviewer'
  | 'admin'

type TeamMember = {
  id: string
  username: string | null
  email: string | null
  role: OrganizationTeamMemberRole | null
}

type GetTeamResponse = {
  success: boolean
  organizationId: string
  team: TeamMember[]
}

type CreateInviteInput = {
  email: string
  role: OrganizationTeamMemberRole
}

type CreateInviteResponse = {
  success: boolean
  message: string
  invite: {
    id: string
    email: string
    role: OrganizationTeamMemberRole
    status: 'pending' | 'accepted' | 'revoked' | 'expired'
    expiresAt: string
    inviteUrl: string
  }
}

type InvitePreviewResponse = {
  success: boolean
  invite: {
    email: string
    role: OrganizationTeamMemberRole
    status: 'pending' | 'accepted' | 'revoked' | 'expired'
    expiresAt: string
    organization: {
      id?: string
      name?: string
    } | string
  }
}

type AcceptInviteResponse = {
  success: boolean
  message: string
  organization: {
    id: string
    name: string
    slug: string
  } | null
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

export const organizationTeamService = {
  getOrganizationTeam: async (
    accessToken: string,
  ): Promise<GetTeamResponse> => {
    const response = await fetch(`${API_BASE_URL}/organizations/team`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return parseApiResponse(response, (data) => data as GetTeamResponse)
  },

  inviteTeamMember: async (
    accessToken: string,
    input: CreateInviteInput,
  ): Promise<CreateInviteResponse> => {
    const response = await fetch(`${API_BASE_URL}/organizations/team/invites`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    return parseApiResponse(response, (data) => data as CreateInviteResponse)
  },

  getInvitePreview: async (token: string): Promise<InvitePreviewResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/invites/${encodeURIComponent(token)}`,
    )

    return parseApiResponse(response, (data) => data as InvitePreviewResponse)
  },

  deactivateTeamMember: async (
    accessToken: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/team/${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return parseApiResponse(
      response,
      (data) => data as { success: boolean; message: string },
    )
  },

  acceptInvite: async (
    accessToken: string,
    token: string,
  ): Promise<AcceptInviteResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/invites/${encodeURIComponent(token)}/accept`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return parseApiResponse(response, (data) => data as AcceptInviteResponse)
  },
}
