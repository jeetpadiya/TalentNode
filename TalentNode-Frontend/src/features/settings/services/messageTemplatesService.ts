import type { ApiErrorResponse } from '../../../types/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export type MessageTemplate = {
  _id: string
  organizationId: string
  title: string
  subject: string
  body: string
}

type ListResponse = {
  templates: MessageTemplate[]
}

type TemplateResponse = {
  template: MessageTemplate
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

export const messageTemplatesService = {
  listMessageTemplates: async (
    accessToken: string,
    organizationId: string,
  ): Promise<MessageTemplate[]> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/message-templates`,
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

  createMessageTemplate: async (
    accessToken: string,
    organizationId: string,
    payload: { title: string; subject: string; body: string },
  ): Promise<MessageTemplate> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/message-templates`,
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

  updateMessageTemplate: async (
    accessToken: string,
    organizationId: string,
    templateId: string,
    payload: { title: string; subject: string; body: string },
  ): Promise<MessageTemplate> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/message-templates/${encodeURIComponent(templateId)}`,
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

  deleteMessageTemplate: async (
    accessToken: string,
    organizationId: string,
    templateId: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/organizations/${encodeURIComponent(
        organizationId,
      )}/message-templates/${encodeURIComponent(templateId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // backend returns { message: 'Template deleted' }
    void parseApiResponse(response, (data) =>
      (identity(data) as EmptyResponse),
    )
  },
}

