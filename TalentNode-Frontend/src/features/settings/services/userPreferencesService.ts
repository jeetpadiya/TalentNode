const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

export type UserPreferences = {
  newCandidateApplication: boolean
  newCommentOrReview: boolean
  newMessageFromCandidate: boolean
}

type UserPreferencesResponse = {
  newCandidateApplication: boolean
  newCommentOrReview: boolean
  newMessageFromCandidate: boolean
}

const parseApiResponse = async <T>(
  response: Response,
  parser: (data: unknown) => T,
): Promise<T> => {
  const data: unknown = await response.json()

  if (!response.ok) {
    throw data
  }

  return parser(data)
}

export const userPreferencesService = {
  getUserPreferences: async (
    accessToken: string,
  ): Promise<UserPreferences> => {
    const response = await fetch(`${API_BASE_URL}/user/preferences`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return parseApiResponse(response, (data) => data as UserPreferencesResponse)
  },

  updateUserPreferences: async (
    accessToken: string,
    payload: UserPreferences,
  ): Promise<UserPreferences> => {
    const response = await fetch(`${API_BASE_URL}/user/preferences`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return parseApiResponse(response, (data) => data as UserPreferencesResponse)
  },
}

