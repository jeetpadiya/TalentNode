import type { ApiErrorResponse,GetCommentsResponse } from '../../../types/types'
import { z } from 'zod'

import { candidateSchema } from '../../candidates/services/CandidateSchema'


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

const applicationStageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  order: z.number(),
  candidates: z.array(candidateSchema),
})

const applicationsByStageResponseSchema = z.object({
  success: z.boolean(),
  jobId: z.string().min(1),
  stages: z.array(applicationStageSchema),
})

const moveApplicationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  assignment: z.object({
    id: z.string().min(1),
    jobId: z.string().min(1),
    candidateId: z.string().min(1),
    hiringStageId: z.string().min(1),
  }),
})

export type ApplicationStage = z.infer<typeof applicationStageSchema>

export const getApplicationsByHiringStages = async (
  jobId: string,
  accessToken: string,
): Promise<ApplicationStage[]> => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  const data = await parseApiResponse(response, (value) =>
    applicationsByStageResponseSchema.parse(value),
  )

  return data.stages
}

export const moveApplicationToHiringStage = async (
  jobId: string,
  applicationId: string,
  hiringStageId: string,
  accessToken: string,
) => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/stage`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hiringStageId }),
    },
  )

  return parseApiResponse(response, (value) =>
    moveApplicationResponseSchema.parse(value),
  )
}

export const resolveApplication = async ({
  jobId,
  applicationId,
  status,
  rejectionReason,
  sendEmail,
  accessToken,
}: {
  jobId: string;
  applicationId: string;
  status: 'hired' | 'rejected' | 'withdrawn' | 'active';
  rejectionReason?: string;
  sendEmail?: boolean;
  accessToken: string;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/resolve`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, rejectionReason, sendEmail }),
    },
  )

  return parseApiResponse(response, (value) =>
    value as { success: boolean; message: string; assignment: any }
  )
}

export const addApplicationComment = async ({
  jobId,
  applicationId,
  comment,
  accessToken,
}: {
  jobId: string,
  applicationId: string,
  comment: string,
  accessToken: string | null,
}):Promise<GetCommentsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    },
  )
return parseApiResponse(
  response,
  (data) => data as GetCommentsResponse
);
}

export const getApplicationComments = async (
  jobId: string,
  accessToken: string,
  applicationId:string,
):Promise<GetCommentsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/comments`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
return parseApiResponse(
  response,
  (data) => data as GetCommentsResponse
);
}


export const editApplicationComment = async ({
  jobId,
  applicationId,
  commentId,
  newComment,
  accessToken,
}: {
  jobId: string;
  applicationId:string;
  commentId: string;
  newComment: string;
  accessToken: string;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newComment }),
    },
  )

  return parseApiResponse(response, (value) =>
    value as { success: boolean; message?: string }
  ) 
}


export const deleteApplicationComment = async ({
  jobId,
  applicationId,
  commentId,
  accessToken,

}:{
  jobId: string;
  applicationId:string;
  commentId: string;
  accessToken: string;
}) =>{
  const response  = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/comments/${encodeURIComponent(commentId)}`,{
    method:'DELETE',
    headers:{
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    }
  })

    return parseApiResponse(response, (value) =>
    value as { success: boolean; message?: string }
  )
}


export const sendCandidateEmail = async ({
  jobId,
  applicationId,
  subject,
  body,
  accessToken,
}: {
  jobId: string;
  applicationId: string;
  subject: string;
  body: string;
  accessToken: string;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/emails`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, body }),
    },
  )
  return parseApiResponse(response, (value) => value as { success: boolean; emailLog: any })
}

export const getCandidateEmails = async (
  jobId: string,
  applicationId: string,
  accessToken: string,
) => {
  const response = await fetch(
    `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/emails`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  return parseApiResponse(response, (value) => value as { success: boolean; emails: any[] })
}
