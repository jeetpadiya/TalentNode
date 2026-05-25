import type { ApiErrorResponse } from '../../../types/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export type JobCategory = {
  _id: string
  organizationId: string
  name: string
  order: number
}

type ListResponse = {
  categories: JobCategory[]
}

type CategoryResponse = {
  category: JobCategory
}

type EmptyResponse = {
  message: string
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

const identity = <T,>(data: T) => data

export const jobCategoriesService = {
  listJobCategories: async (
    accessToken: string,
    organizationId: string,
  ): Promise<JobCategory[]> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/job-categories`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return parseApiResponse(response, (data) =>
      (identity(data) as ListResponse).categories,
    )
  },

  createJobCategory: async (
    accessToken: string,
    organizationId: string,
    payload: { name: string; order: number },
  ): Promise<JobCategory> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/job-categories`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    return parseApiResponse(response, (data) =>
      (identity(data) as CategoryResponse).category,
    )
  },

  updateJobCategory: async (
    accessToken: string,
    organizationId: string,
    categoryId: string,
    payload: { name?: string; order?: number },
  ): Promise<JobCategory> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/job-categories/${encodeURIComponent(categoryId)}`,
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
      (identity(data) as CategoryResponse).category,
    )
  },

  deleteJobCategory: async (
    accessToken: string,
    organizationId: string,
    categoryId: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/job-categories/${encodeURIComponent(categoryId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    void parseApiResponse(response, (data) =>
      (identity(data) as EmptyResponse),
    )
  },
}
