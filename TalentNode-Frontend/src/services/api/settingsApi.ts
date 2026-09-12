import { client } from '../../lib/client'
import type {
  CreateJobCategoryInput,
  CreateMessageTemplateInput,
  CreateReviewTemplateInput,
  JobCategoriesResponse,
  JobCategoryResponse,
  MessageTemplateResponse,
  MessageTemplatesResponse,
  ReviewTemplateResponse,
  ReviewTemplatesResponse,
  UpdateJobCategoryInput,
  UpdateMessageTemplateInput,
  UpdateReviewTemplateInput,
  UserPreferences,
  UserPreferencesResponse,
} from '../../types/apiTypes'

/**
 * Centralized Settings API Service
 * 
 * Interacts with:
 * - /api/organizations/:orgId/job-categories
 * - /api/organizations/:orgId/message-templates
 * - /api/organizations/:orgId/review-templates
 * - /api/user/preferences
 * 
 * Uses the centralized client.ts with automatic authorization headers,
 * base URL handling, parameter serialization, and unified error handling.
 */
export const settingsApi = {
  // --------------------------------------------------------------------------
  // Job Categories
  // --------------------------------------------------------------------------

  /**
   * Fetch all job categories for an organization (GET /api/organizations/:orgId/job-categories).
   */
  getJobCategories: (organizationId: string): Promise<JobCategoriesResponse> => {
    return client.get<JobCategoriesResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/job-categories`,
    )
  },

  /**
   * Create a new job category (POST /api/organizations/:orgId/job-categories).
   */
  createJobCategory: (
    organizationId: string,
    input: CreateJobCategoryInput,
  ): Promise<JobCategoryResponse> => {
    return client.post<JobCategoryResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/job-categories`,
      input,
    )
  },

  /**
   * Update an existing job category (PUT /api/organizations/:orgId/job-categories/:id).
   */
  updateJobCategory: (
    organizationId: string,
    categoryId: string,
    input: UpdateJobCategoryInput,
  ): Promise<JobCategoryResponse> => {
    return client.put<JobCategoryResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/job-categories/${encodeURIComponent(categoryId)}`,
      input,
    )
  },

  /**
   * Delete a job category (DELETE /api/organizations/:orgId/job-categories/:id).
   */
  deleteJobCategory: (
    organizationId: string,
    categoryId: string,
  ): Promise<{ message: string }> => {
    return client.delete<{ message: string }>(
      `/organizations/${encodeURIComponent(organizationId)}/job-categories/${encodeURIComponent(categoryId)}`,
    )
  },

  // --------------------------------------------------------------------------
  // Message Templates
  // --------------------------------------------------------------------------

  /**
   * Fetch all message templates for an organization (GET /api/organizations/:orgId/message-templates).
   */
  getMessageTemplates: (
    organizationId: string,
  ): Promise<MessageTemplatesResponse> => {
    return client.get<MessageTemplatesResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/message-templates`,
    )
  },

  /**
   * Create a new message template (POST /api/organizations/:orgId/message-templates).
   */
  createMessageTemplate: (
    organizationId: string,
    input: CreateMessageTemplateInput,
  ): Promise<MessageTemplateResponse> => {
    const body = {
      title: input.title ?? input.name ?? '',
      subject: input.subject,
      body: input.body,
    }
    return client.post<MessageTemplateResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/message-templates`,
      body,
    )
  },

  /**
   * Update an existing message template (PUT /api/organizations/:orgId/message-templates/:id).
   */
  updateMessageTemplate: (
    organizationId: string,
    templateId: string,
    input: UpdateMessageTemplateInput,
  ): Promise<MessageTemplateResponse> => {
    const body: Record<string, unknown> = {}
    if (input.title !== undefined || input.name !== undefined) {
      body.title = input.title ?? input.name
    }
    if (input.subject !== undefined) body.subject = input.subject
    if (input.body !== undefined) body.body = input.body

    return client.put<MessageTemplateResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/message-templates/${encodeURIComponent(templateId)}`,
      body,
    )
  },

  /**
   * Delete a message template (DELETE /api/organizations/:orgId/message-templates/:id).
   */
  deleteMessageTemplate: (
    organizationId: string,
    templateId: string,
  ): Promise<{ message: string }> => {
    return client.delete<{ message: string }>(
      `/organizations/${encodeURIComponent(organizationId)}/message-templates/${encodeURIComponent(templateId)}`,
    )
  },

  // --------------------------------------------------------------------------
  // Review Templates
  // --------------------------------------------------------------------------

  /**
   * Fetch all review templates for an organization (GET /api/organizations/:orgId/review-templates).
   */
  getReviewTemplates: (
    organizationId: string,
  ): Promise<ReviewTemplatesResponse> => {
    return client.get<ReviewTemplatesResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/review-templates`,
    )
  },

  /**
   * Create a new review template (POST /api/organizations/:orgId/review-templates).
   */
  createReviewTemplate: (
    organizationId: string,
    input: CreateReviewTemplateInput,
  ): Promise<ReviewTemplateResponse> => {
    return client.post<ReviewTemplateResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/review-templates`,
      input,
    )
  },

  /**
   * Update an existing review template (PUT /api/organizations/:orgId/review-templates/:id).
   */
  updateReviewTemplate: (
    organizationId: string,
    templateId: string,
    input: UpdateReviewTemplateInput,
  ): Promise<ReviewTemplateResponse> => {
    return client.put<ReviewTemplateResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/review-templates/${encodeURIComponent(templateId)}`,
      input,
    )
  },

  /**
   * Delete a review template (DELETE /api/organizations/:orgId/review-templates/:id).
   */
  deleteReviewTemplate: (
    organizationId: string,
    templateId: string,
  ): Promise<{ message: string }> => {
    return client.delete<{ message: string }>(
      `/organizations/${encodeURIComponent(organizationId)}/review-templates/${encodeURIComponent(templateId)}`,
    )
  },

  // --------------------------------------------------------------------------
  // User Preferences
  // --------------------------------------------------------------------------

  /**
   * Fetch notification preferences for current user (GET /api/user/preferences).
   */
  getUserPreferences: (): Promise<UserPreferencesResponse> => {
    return client.get<UserPreferencesResponse>('/user/preferences')
  },

  /**
   * Update notification preferences for current user (PUT /api/user/preferences).
   */
  updateUserPreferences: (
    preferences: UserPreferences,
  ): Promise<UserPreferencesResponse> => {
    return client.put<UserPreferencesResponse>('/user/preferences', preferences)
  },
}

export default settingsApi
