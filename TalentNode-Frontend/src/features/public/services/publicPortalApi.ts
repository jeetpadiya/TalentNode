/**
 * Public Careers Portal Service Re-export.
 * Bridges legacy feature-scoped path to the centralized API client and types.
 */
export type {
  PublicApplicationInput,
  PublicJob,
  PublicJobDetailResponse,
  PublicJobsResponse,
  PublicOrganization,
  SubmitPublicApplicationResponse,
} from '../../../types/apiTypes'

export {
  default,
  getPublicJobById,
  getPublicJobs,
  getPublicJobsByOrgSlug,
  publicPortalApi,
  submitPublicApplication,
} from '../../../services/api/publicPortalApi'
