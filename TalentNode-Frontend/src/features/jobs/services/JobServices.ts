import type { ApiErrorResponse } from '../../../types/types'
import {
    createJobSchema,
    updateJobSchema,
    jobsResponseSchema,
    jobResponseSchema,
    type Job,
    type CreateJobInput,
    type UpdateJobInput

} from './JobSchema'

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

export const getJobs = async (accessToken: string): Promise<Job[]> => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await parseApiResponse(response, (value) =>
    jobsResponseSchema.parse(value),
  )

  return data.jobs
}

export const getJobById = async (
  jobId: string,
  accessToken: string,
): Promise<Job> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await parseApiResponse(response, (value) =>
    jobResponseSchema.parse(value),
  )

  return data.job
}

export const createJob = async (
  input: CreateJobInput,
  accessToken: string,
): Promise<Job> => {
  const body = createJobSchema.parse(input)

  const response = await fetch(`${API_BASE_URL}/jobs/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await parseApiResponse(response, (value) =>
    jobResponseSchema.parse(value),
  )

  return data.job
}

export const updateJob = async (
  jobId: string,
  input: UpdateJobInput,
  accessToken: string,
): Promise<Job> => {
  const body = updateJobSchema.parse(input)

  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await parseApiResponse(response, (value) =>
    jobResponseSchema.parse(value),
  )

  return data.job
}
