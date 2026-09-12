import { client } from '../../lib/client'
import type {
  CandidateResponse,
  CandidatesForJobResponse,
  CandidatesResponse,
  CreateCandidateInput,
  DeleteCandidateResponse,
  UpdateCandidateInput,
} from '../../types/apiTypes'

/**
 * Formats comma-separated string fields (skills, tags, experience) into clean API payloads.
 */
const formatCandidatePayload = <T extends CreateCandidateInput | UpdateCandidateInput>(
  input: T,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = { ...input }

  if (typeof payload.skills === 'string') {
    payload.skills = payload.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  if (typeof payload.tags === 'string') {
    payload.tags = payload.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }

  if (typeof payload.experience === 'string') {
    const trimmed = payload.experience.trim()
    payload.experience =
      trimmed !== '' && !Number.isNaN(Number(trimmed))
        ? Number(trimmed)
        : undefined
  }

  return payload
}

/**
 * Centralized Candidate API Service
 * 
 * Interacts with /api/candidates and /api/jobs/:jobId/candidates endpoints using the centralized client.ts
 * with automatic authorization headers, base URL handling, parameter serialization,
 * and unified error interception.
 */
export const candidateApi = {
  /**
   * Fetch all candidates accessible in the active organization (GET /api/candidates).
   */
  getCandidates: (params?: Record<string, unknown>): Promise<CandidatesResponse> => {
    return client.get<CandidatesResponse>('/candidates', { params })
  },

  /**
   * Fetch a single candidate by ID (GET /api/candidates/:id).
   */
  getCandidateById: (candidateId: string): Promise<CandidateResponse> => {
    return client.get<CandidateResponse>(`/candidates/${encodeURIComponent(candidateId)}`)
  },

  /**
   * Fetch all candidates assigned to a specific job (GET /api/jobs/:jobId/candidates).
   */
  getCandidatesForJob: (jobId: string): Promise<CandidatesForJobResponse> => {
    return client.get<CandidatesForJobResponse>(
      `/jobs/${encodeURIComponent(jobId)}/candidates`,
    )
  },

  /**
   * Create a new candidate, optionally linking them to a job (POST /api/candidates).
   */
  createCandidate: (input: CreateCandidateInput): Promise<CandidateResponse> => {
    const body = formatCandidatePayload(input)
    return client.post<CandidateResponse>('/candidates', body)
  },

  /**
   * Update an existing candidate's profile/metadata (PUT /api/candidates/:id).
   */
  updateCandidate: (
    candidateId: string,
    input: UpdateCandidateInput,
  ): Promise<CandidateResponse> => {
    const body = formatCandidatePayload(input)
    return client.put<CandidateResponse>(
      `/candidates/${encodeURIComponent(candidateId)}`,
      body,
    )
  },

  /**
   * Delete a candidate and associated applications (DELETE /api/candidates/:id).
   */
  deleteCandidate: (candidateId: string): Promise<DeleteCandidateResponse> => {
    return client.delete<DeleteCandidateResponse>(
      `/candidates/${encodeURIComponent(candidateId)}`,
    )
  },
}

export default candidateApi
