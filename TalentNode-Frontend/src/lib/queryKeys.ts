/**
 * Centralized TanStack Query Key Factory for TalentNode
 * 
 * Provides hierarchical, strictly-typed query keys across all application domains:
 * - Jobs (listings, details, stages, team, application form, categories)
 * - Candidates (listings, by-job filtering, details)
 * - Applications (listings, pipeline by job, details, review requests, notes)
 * - Organizations (details, team members, invites)
 * - Settings (job categories, message templates, review templates)
 * - User (preferences, profile)
 * - Public (careers job board, job application)
 * 
 * Usage Examples:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.applications.byJob(orgId, jobId) })
 */

// ---------------------------------------------------------------------------
// 1. JOBS
// ---------------------------------------------------------------------------
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: Record<string, unknown>) =>
    [...jobKeys.lists(), organizationId, { ...(filters ?? {}) }] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (jobId: string) => [...jobKeys.details(), jobId] as const,
  stages: (jobId: string) => [...jobKeys.detail(jobId), 'stages'] as const,
  team: (jobId: string) => [...jobKeys.detail(jobId), 'team'] as const,
  form: (jobId: string) => [...jobKeys.detail(jobId), 'form'] as const,
  categories: (organizationId: string) =>
    [...jobKeys.all, 'categories', organizationId] as const,
}

// ---------------------------------------------------------------------------
// 2. CANDIDATES
// ---------------------------------------------------------------------------
export const candidateKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidateKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: Record<string, unknown>) =>
    [...candidateKeys.lists(), organizationId, { ...(filters ?? {}) }] as const,
  byJob: (organizationId: string, jobId: string) =>
    [...candidateKeys.all, 'job', organizationId, jobId] as const,
  details: () => [...candidateKeys.all, 'detail'] as const,
  detail: (candidateId: string) =>
    [...candidateKeys.details(), candidateId] as const,
}

// ---------------------------------------------------------------------------
// 3. APPLICATIONS
// ---------------------------------------------------------------------------
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (organizationId: string, filters?: Record<string, unknown>) =>
    [...applicationKeys.lists(), organizationId, { ...(filters ?? {}) }] as const,
  byJob: (organizationId: string, jobId: string) =>
    [...applicationKeys.all, 'job', organizationId, jobId] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (applicationId: string) =>
    [...applicationKeys.details(), applicationId] as const,
  reviews: (applicationId: string, jobId?: string) =>
    [...applicationKeys.detail(applicationId), 'reviews', ...(jobId ? [jobId] : [])] as const,
  comments: (applicationId: string) =>
    [...applicationKeys.detail(applicationId), 'comments'] as const,
  notes: (applicationId: string, jobId?: string) =>
    [...applicationKeys.detail(applicationId), 'notes', ...(jobId ? [jobId] : [])] as const,
}

// ---------------------------------------------------------------------------
// 4. ORGANIZATIONS & TEAM
// ---------------------------------------------------------------------------
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: () => [...organizationKeys.lists()] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (organizationId: string) =>
    [...organizationKeys.details(), organizationId] as const,
  team: () => [...organizationKeys.all, 'team'] as const,
  invites: () => [...organizationKeys.team(), 'invites'] as const,
  invite: (token: string) => [...organizationKeys.invites(), token] as const,
}

// ---------------------------------------------------------------------------
// 5. SETTINGS (Categories, Message & Review Templates)
// ---------------------------------------------------------------------------
export const settingsKeys = {
  all: ['settings'] as const,
  categories: (organizationId: string) =>
    [...settingsKeys.all, 'categories', organizationId] as const,
  category: (organizationId: string, categoryId: string) =>
    [...settingsKeys.categories(organizationId), categoryId] as const,
  messageTemplates: (organizationId: string) =>
    [...settingsKeys.all, 'message-templates', organizationId] as const,
  messageTemplate: (organizationId: string, templateId: string) =>
    [...settingsKeys.messageTemplates(organizationId), templateId] as const,
  reviewTemplates: (organizationId: string) =>
    [...settingsKeys.all, 'review-templates', organizationId] as const,
  reviewTemplate: (organizationId: string, templateId: string) =>
    [...settingsKeys.reviewTemplates(organizationId), templateId] as const,
  preferences: () => [...settingsKeys.all, 'preferences'] as const,
}

// ---------------------------------------------------------------------------
// 6. USER & PREFERENCES
// ---------------------------------------------------------------------------
export const userKeys = {
  all: ['user'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

// ---------------------------------------------------------------------------
// 7. PUBLIC CAREERS PORTAL
// ---------------------------------------------------------------------------
export const publicKeys = {
  all: ['public'] as const,
  jobs: (slug: string) => [...publicKeys.all, 'jobs', slug] as const,
  job: (jobId: string) => [...publicKeys.all, 'job', jobId] as const,
}

// ---------------------------------------------------------------------------
// 8. RECRUITING ANALYTICS
// ---------------------------------------------------------------------------
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (organizationId: string, filters?: Record<string, unknown>) =>
    [...analyticsKeys.all, 'overview', organizationId, { ...(filters ?? {}) }] as const,
}

// ---------------------------------------------------------------------------
// CENTRALIZED QUERY KEY FACTORY
// ---------------------------------------------------------------------------
export const queryKeys = {
  jobs: jobKeys,
  candidates: candidateKeys,
  applications: applicationKeys,
  organizations: organizationKeys,
  settings: settingsKeys,
  user: userKeys,
  public: publicKeys,
  analytics: analyticsKeys,
} as const

export type QueryKeys = typeof queryKeys
export default queryKeys


