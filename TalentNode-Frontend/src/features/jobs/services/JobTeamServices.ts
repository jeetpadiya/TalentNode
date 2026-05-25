import type { ApiErrorResponse } from '../../../types/types'
import { z } from 'zod'

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

const ownerSchema = z
  .object({
    id: z.string(),
    username: z.string().nullable(),
    email: z.string().nullable(),
    role: z.string().nullable(),
  })
  .nullable()

const userSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  email: z.string().nullable(),
  role: z.string().nullable(),
})

const hiringTeamMemberSchema = z.object({
  id: z.string(),
  role: z.enum(['recruiter', 'hiring_manager', 'interviewer']),
  user: userSchema,
})

const hiringTeamOwnerResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string(),
  owner: ownerSchema,
  hiringTeam: z.object({
    recruiters: z.array(hiringTeamMemberSchema),
    hiringManagers: z.array(hiringTeamMemberSchema),
    interviewers: z.array(hiringTeamMemberSchema),
  }),
  availableMembers: z.array(userSchema),
})

const addHiringTeamMemberResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  member: hiringTeamMemberSchema,
})

const mutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export type HiringTeamRole = z.infer<typeof hiringTeamMemberSchema>['role']
export type HiringTeamMember = z.infer<typeof hiringTeamMemberSchema>
export type HiringTeamUser = z.infer<typeof userSchema>
export type HiringTeamResponse = z.infer<typeof hiringTeamOwnerResponseSchema>

export const getHiringTeamForJob = async (
  jobId: string,
  accessToken: string,
): Promise<HiringTeamResponse> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/hiring-team`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return parseApiResponse(response, (value) =>
    hiringTeamOwnerResponseSchema.parse(value),
  )
}

export const addHiringTeamMemberForJob = async (
  jobId: string,
  accessToken: string,
  payload: { userId: string },
): Promise<z.infer<typeof addHiringTeamMemberResponseSchema>> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/hiring-team`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseApiResponse(response, (value) =>
    addHiringTeamMemberResponseSchema.parse(value),
  )
}

export const removeHiringTeamMemberForJob = async (
  jobId: string,
  accessToken: string,
  userId: string,
): Promise<z.infer<typeof mutationResponseSchema>> => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${jobId}/hiring-team/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  return parseApiResponse(response, (value) =>
    mutationResponseSchema.parse(value),
  )
}
