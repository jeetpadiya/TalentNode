import { client } from '../../lib/client'
import type {
  AcceptOrganizationInviteResponse,
  CreateOrganizationInput,
  CreateOrganizationInviteInput,
  CreateOrganizationInviteResponse,
  DeactivateTeamMemberResponse,
  GetOrganizationInviteResponse,
  GetOrganizationTeamResponse,
  OrganizationResponse,
  OrganizationsResponse,
  RevokeOrganizationInviteResponse,
  UpdateOrganizationInput,
} from '../../types/apiTypes'

/**
 * Centralized Organization API Service
 * 
 * Interacts with /api/organizations endpoints using the centralized client.ts
 * with automatic authorization headers, base URL handling, and error interception.
 */
export const organizationApi = {
  /**
   * Fetch all organizations accessible to the current user (GET /api/organizations).
   */
  getOrganizations: (): Promise<OrganizationsResponse> => {
    return client.get<OrganizationsResponse>('/organizations')
  },

  /**
   * Fetch a single organization by ID (GET /api/organizations/:id).
   */
  getOrganizationById: (organizationId: string): Promise<OrganizationResponse> => {
    return client.get<OrganizationResponse>(`/organizations/${encodeURIComponent(organizationId)}`)
  },

  /**
   * Create a new organization (POST /api/organizations).
   */
  createOrganization: (input: CreateOrganizationInput): Promise<OrganizationResponse> => {
    return client.post<OrganizationResponse>('/organizations', input)
  },

  /**
   * Update an existing organization (PUT /api/organizations/:id).
   */
  updateOrganization: (
    organizationId: string,
    input: UpdateOrganizationInput,
  ): Promise<OrganizationResponse> => {
    return client.put<OrganizationResponse>(
      `/organizations/${encodeURIComponent(organizationId)}`,
      input,
    )
  },

  /**
   * Fetch all team members in the active organization (GET /api/organizations/team).
   */
  getOrganizationTeam: (): Promise<GetOrganizationTeamResponse> => {
    return client.get<GetOrganizationTeamResponse>('/organizations/team')
  },

  /**
   * Deactivate a team member by user ID (DELETE /api/organizations/team/:userId).
   */
  deactivateTeamMember: (userId: string): Promise<DeactivateTeamMemberResponse> => {
    return client.delete<DeactivateTeamMemberResponse>(
      `/organizations/team/${encodeURIComponent(userId)}`,
    )
  },

  /**
   * Invite a new team member to the organization (POST /api/organizations/team/invites).
   */
  inviteTeamMember: (
    input: CreateOrganizationInviteInput,
  ): Promise<CreateOrganizationInviteResponse> => {
    return client.post<CreateOrganizationInviteResponse>('/organizations/team/invites', input)
  },

  /**
   * Revoke a pending organization team invite (POST /api/organizations/team/invites/:inviteId/revoke).
   */
  revokeInvite: (inviteId: string): Promise<RevokeOrganizationInviteResponse> => {
    return client.post<RevokeOrganizationInviteResponse>(
      `/organizations/team/invites/${encodeURIComponent(inviteId)}/revoke`,
    )
  },

  /**
   * Preview an invite by token without authentication (GET /api/organizations/invites/:token).
   */
  getInviteByToken: (token: string): Promise<GetOrganizationInviteResponse> => {
    return client.get<GetOrganizationInviteResponse>(
      `/organizations/invites/${encodeURIComponent(token)}`,
      { skipAuth: true },
    )
  },

  /**
   * Accept an organization invite (POST /api/organizations/invites/:token/accept).
   */
  acceptInvite: (token: string): Promise<AcceptOrganizationInviteResponse> => {
    return client.post<AcceptOrganizationInviteResponse>(
      `/organizations/invites/${encodeURIComponent(token)}/accept`,
    )
  },
}

export default organizationApi
