import type { ApiErrorResponse } from '../../../types/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export type ReviewTemplate = {
  _id: string
  organizationId: string
  name: string
  template: string
}

type ListResponse = {
  templates: ReviewTemplate[]
}

type TemplateResponse = {
  template: ReviewTemplate
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

export const reviewTemplatesService = {
  listReviewTemplates: async (
    accessToken: string,
    organizationId: string,
  ): Promise<ReviewTemplate[]> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/review-templates`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    return parseApiResponse(response, (data) =>
      (identity(data) as ListResponse).templates,
    )
  },

  createReviewTemplate: async (
    accessToken: string,
    organizationId: string,
    payload: { name: string; template: string },
  ): Promise<ReviewTemplate> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/review-templates`,
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
      (identity(data) as TemplateResponse).template,
    )
  },

  updateReviewTemplate: async (
    accessToken: string,
    organizationId: string,
    templateId: string,
    payload: { name: string; template: string },
  ): Promise<ReviewTemplate> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/review-templates/${encodeURIComponent(templateId)}`,
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
      (identity(data) as TemplateResponse).template,
    )
  },

  deleteReviewTemplate: async (
    accessToken: string,
    organizationId: string,
    templateId: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/review-templates/${encodeURIComponent(templateId)}`,
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
