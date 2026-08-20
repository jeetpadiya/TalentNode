/**
 * TanStack Query Key Factory for TalentNode
 * Structured query keys for Jobs, Candidates, Applications, and Organizations.
 * Ensures consistent caching, easy invalidation, and prevents duplicate API hits.
 */

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
  reviews: (applicationId: string) =>
    [...applicationKeys.detail(applicationId), 'reviews'] as const,
  comments: (applicationId: string) =>
    [...applicationKeys.detail(applicationId), 'comments'] as const,
  notes: (applicationId: string) =>
    [...applicationKeys.detail(applicationId), 'notes'] as const,
}

export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: () => [...organizationKeys.lists()] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (organizationId: string) =>
    [...organizationKeys.details(), organizationId] as const,
}
