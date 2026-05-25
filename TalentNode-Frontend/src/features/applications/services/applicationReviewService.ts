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

const reviewUserSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  email: z.string().nullable(),
})

const reviewRequestSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  assignee: reviewUserSchema,
  requestedBy: reviewUserSchema,
})

const listReviewRequestsResponseSchema = z.object({
  success: z.boolean(),
  reviewRequests: z.array(reviewRequestSchema),
})

const createReviewRequestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  reviewRequest: reviewRequestSchema.nullable(),
})

export type ReviewRequest = z.infer<typeof reviewRequestSchema>

export type CreateReviewRequestInput = {
  assigneeUserId: string
  message?: string
}

export const getReviewRequests = async (
  jobId: string,
  applicationId: string,
  accessToken: string,
): Promise<ReviewRequest[]> => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/review-requests`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  const parsed = await parseApiResponse(response, (data) =>
    listReviewRequestsResponseSchema.parse(data),
  )

  return parsed.reviewRequests
}

export const createReviewRequest = async (
  jobId: string,
  applicationId: string,
  accessToken: string,
  input: CreateReviewRequestInput,
): Promise<ReviewRequest | null> => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/review-requests`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  )

  const parsed = await parseApiResponse(response, (data) =>
    createReviewRequestResponseSchema.parse(data),
  )

  return parsed.reviewRequest
}
