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

const privateNoteItemSchema = z.object({
  _id: z.string().optional(),
  text: z.string(),
  createdBy: z
    .union([
      z.string(),
      z.object({
        username: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        _id: z.string().optional(),
      }),
    ])
    .optional(),
  createdAt: z.string().optional(),
})

const getPrivateNotesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  privateNotes: z.array(privateNoteItemSchema).optional(),
  // controller also populates candidateId
  candidate: z.unknown().optional(),
})

const createPrivateNoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  application: z.unknown().optional(),
})

export type PrivateNoteItem = z.infer<typeof privateNoteItemSchema>

const getPrivateNoteRoute = ({
  jobId,
  applicationId,
}: {
  jobId: string
  applicationId: string
}) =>
  `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/private-note`

export const getPrivateNotesByApplication = async ({
  jobId,
  applicationId,
  accessToken,
}: {
  jobId: string
  applicationId: string
  accessToken: string
}): Promise<PrivateNoteItem[]> => {
  const response = await fetch(`${API_BASE_URL}${getPrivateNoteRoute({ jobId, applicationId })}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await parseApiResponse(response, (value) =>
    getPrivateNotesResponseSchema.parse(value),
  )

  // UI needs the full list
  return (data.privateNotes ?? []) as PrivateNoteItem[]
}

export const createPrivateNoteForApplication = async ({
  jobId,
  applicationId,
  privatenote,
  accessToken,
}: {
  jobId: string
  applicationId: string
  privatenote: string
  accessToken: string
}): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}${getPrivateNoteRoute({ jobId, applicationId })}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ privatenote }),
    },
  )

  await parseApiResponse(response, (value) =>
    createPrivateNoteResponseSchema.parse(value),
  )
}

