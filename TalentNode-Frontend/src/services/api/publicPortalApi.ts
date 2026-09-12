import client from '../../lib/client'
import type {
  PublicApplicationInput,
  PublicJobDetailResponse,
  PublicJobsResponse,
  SubmitPublicApplicationResponse,
} from '../../types/apiTypes'

/**
 * Public Careers Portal API Service.
 * Note: All public career portal endpoints use `skipAuth: true` because
 * candidates and applicants access these pages without being logged into the ATS.
 */
export const publicPortalApi = {
  /**
   * Get all active and published jobs for an organization by organization slug.
   * GET /api/public/organizations/:slug/jobs
   */
  getPublicJobs: async (slug: string): Promise<PublicJobsResponse> => {
    return client.get<PublicJobsResponse>(
      `/public/organizations/${encodeURIComponent(slug)}/jobs`,
      { skipAuth: true },
    )
  },

  /**
   * Alias for getPublicJobs for backward compatibility.
   */
  getPublicJobsByOrgSlug: async (slug: string): Promise<PublicJobsResponse> => {
    return publicPortalApi.getPublicJobs(slug)
  },

  /**
   * Get public job details along with the dynamic application form configuration.
   * GET /api/public/jobs/:jobId
   */
  getPublicJobById: async (jobId: string): Promise<PublicJobDetailResponse> => {
    return client.get<PublicJobDetailResponse>(
      `/public/jobs/${encodeURIComponent(jobId)}`,
      { skipAuth: true },
    )
  },

  /**
   * Submit an application for a public job opening.
   * Supports both multipart/form-data (FormData) when a resume file is included
   * and standard JSON payload when submitted without file attachments.
   * POST /api/public/jobs/:jobId/apply
   */
  submitPublicApplication: async (
    jobId: string,
    payload: FormData | PublicApplicationInput,
  ): Promise<SubmitPublicApplicationResponse> => {
    return client.post<SubmitPublicApplicationResponse>(
      `/public/jobs/${encodeURIComponent(jobId)}/apply`,
      payload,
      { skipAuth: true },
    )
  },
}

// Named function exports for direct imports
export const getPublicJobs = publicPortalApi.getPublicJobs
export const getPublicJobsByOrgSlug = publicPortalApi.getPublicJobsByOrgSlug
export const getPublicJobById = publicPortalApi.getPublicJobById
export const submitPublicApplication = publicPortalApi.submitPublicApplication

export default publicPortalApi
