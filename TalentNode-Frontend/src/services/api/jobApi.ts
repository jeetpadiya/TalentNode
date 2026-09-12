import { client } from '../../lib/client'
import type {
  AddJobHiringTeamMemberInput,
  AddJobHiringTeamMemberResponse,
  ApplicationFormResponse,
  CreateCustomQuestionInput,
  CreateHiringStageInput,
  CreateJobInput,
  CustomQuestionResponse,
  GetJobHiringTeamResponse,
  HiringStageResponse,
  HiringStagesResponse,
  JobCategoriesResponse,
  JobResponse,
  JobsResponse,
  JobStatus,
  SaveHiringPipelineInput,
  UpdateApplicationFormInput,
  UpdateHiringStageInput,
  UpdateJobInput,
} from '../../types/apiTypes'

/**
 * Centralized Job API Service
 * 
 * Interacts with /api/jobs endpoints using the centralized client.ts
 * with automatic authorization headers, base URL handling, parameter serialization,
 * and error interception.
 */
export const jobApi = {
  // --------------------------------------------------------------------------
  // Core Job Operations
  // --------------------------------------------------------------------------

  /**
   * Fetch all jobs accessible in the active organization (GET /api/jobs).
   */
  getJobs: (params?: Record<string, unknown>): Promise<JobsResponse> => {
    return client.get<JobsResponse>('/jobs', { params })
  },

  /**
   * Fetch a single job by its ID (GET /api/jobs/:id).
   */
  getJobById: (jobId: string): Promise<JobResponse> => {
    return client.get<JobResponse>(`/jobs/${encodeURIComponent(jobId)}`)
  },

  /**
   * Create a new draft job (POST /api/jobs).
   */
  createJob: (input: CreateJobInput): Promise<JobResponse> => {
    return client.post<JobResponse>('/jobs', input)
  },

  /**
   * Update an existing job's details (PUT /api/jobs/:id).
   */
  updateJob: (jobId: string, input: UpdateJobInput): Promise<JobResponse> => {
    return client.put<JobResponse>(`/jobs/${encodeURIComponent(jobId)}`, input)
  },

  /**
   * Update a job's lifecycle status (PATCH /api/jobs/:id/status).
   */
  updateJobStatus: (jobId: string, status: JobStatus): Promise<JobResponse> => {
    return client.patch<JobResponse>(`/jobs/${encodeURIComponent(jobId)}/status`, {
      status,
    })
  },

  /**
   * Publish or unpublish a job (PATCH /api/jobs/:id/publish).
   */
  updateJobPublish: (jobId: string, isPublished: boolean): Promise<JobResponse> => {
    return client.patch<JobResponse>(`/jobs/${encodeURIComponent(jobId)}/publish`, {
      isPublished,
    })
  },

  // --------------------------------------------------------------------------
  // Hiring Stages & Pipeline
  // --------------------------------------------------------------------------

  /**
   * Fetch all hiring stages for a job (GET /api/jobs/:jobId/hiring-stages).
   */
  getHiringStages: (jobId: string): Promise<HiringStagesResponse> => {
    return client.get<HiringStagesResponse>(
      `/jobs/${encodeURIComponent(jobId)}/hiring-stages`,
    )
  },

  /**
   * Create a new hiring stage in a job's pipeline (POST /api/jobs/:jobId/hiring-stages).
   */
  createHiringStage: (
    jobId: string,
    input: CreateHiringStageInput,
  ): Promise<HiringStageResponse> => {
    return client.post<HiringStageResponse>(
      `/jobs/${encodeURIComponent(jobId)}/hiring-stages`,
      input,
    )
  },

  /**
   * Update an existing hiring stage name/order (PUT /api/jobs/:jobId/hiring-stages/:stageId).
   */
  updateHiringStage: (
    jobId: string,
    stageId: string,
    input: UpdateHiringStageInput,
  ): Promise<HiringStageResponse> => {
    return client.put<HiringStageResponse>(
      `/jobs/${encodeURIComponent(jobId)}/hiring-stages/${encodeURIComponent(stageId)}`,
      input,
    )
  },

  /**
   * Delete a hiring stage from a job's pipeline (DELETE /api/jobs/:jobId/hiring-stages/:stageId).
   */
  deleteHiringStage: (
    jobId: string,
    stageId: string,
  ): Promise<HiringStagesResponse> => {
    return client.delete<HiringStagesResponse>(
      `/jobs/${encodeURIComponent(jobId)}/hiring-stages/${encodeURIComponent(stageId)}`,
    )
  },

  /**
   * Reorder/save the entire hiring pipeline for a job (PUT /api/jobs/:jobId/hiring-pipeline).
   */
  saveHiringPipeline: (
    jobId: string,
    stages: SaveHiringPipelineInput[],
  ): Promise<HiringStagesResponse> => {
    return client.put<HiringStagesResponse>(
      `/jobs/${encodeURIComponent(jobId)}/hiring-pipeline`,
      { stages },
    )
  },

  // --------------------------------------------------------------------------
  // Application Form & Custom Questions
  // --------------------------------------------------------------------------

  /**
   * Fetch application form configuration for a job (GET /api/jobs/:jobId/application-form).
   */
  getApplicationForm: (jobId: string): Promise<ApplicationFormResponse> => {
    return client.get<ApplicationFormResponse>(
      `/jobs/${encodeURIComponent(jobId)}/application-form`,
    )
  },

  /**
   * Update application form configuration for a job (PUT /api/jobs/:jobId/application-form).
   */
  updateApplicationForm: (
    jobId: string,
    applicationForm: UpdateApplicationFormInput,
  ): Promise<ApplicationFormResponse> => {
    return client.put<ApplicationFormResponse>(
      `/jobs/${encodeURIComponent(jobId)}/application-form`,
      { applicationForm },
    )
  },

  /**
   * Add a custom question to the job application form (POST /api/jobs/:jobId/application-form/custom-questions).
   */
  createCustomQuestion: (
    jobId: string,
    question: CreateCustomQuestionInput,
  ): Promise<CustomQuestionResponse> => {
    return client.post<CustomQuestionResponse>(
      `/jobs/${encodeURIComponent(jobId)}/application-form/custom-questions`,
      question,
    )
  },

  /**
   * Update a custom question on the job application form (PUT /api/jobs/:jobId/application-form/custom-questions/:questionKey).
   */
  updateCustomQuestion: (
    jobId: string,
    questionKey: string,
    question: Partial<CreateCustomQuestionInput>,
  ): Promise<CustomQuestionResponse> => {
    return client.put<CustomQuestionResponse>(
      `/jobs/${encodeURIComponent(jobId)}/application-form/custom-questions/${encodeURIComponent(questionKey)}`,
      question,
    )
  },

  /**
   * Delete a custom question from the job application form (DELETE /api/jobs/:jobId/application-form/custom-questions/:questionKey).
   */
  deleteCustomQuestion: (
    jobId: string,
    questionKey: string,
  ): Promise<CustomQuestionResponse> => {
    return client.delete<CustomQuestionResponse>(
      `/jobs/${encodeURIComponent(jobId)}/application-form/custom-questions/${encodeURIComponent(questionKey)}`,
    )
  },

  // --------------------------------------------------------------------------
  // Hiring Team Assignment
  // --------------------------------------------------------------------------

  /**
   * Fetch assigned hiring team members and available organization members for a job (GET /api/jobs/:jobId/hiring-team).
   */
  getHiringTeam: (jobId: string): Promise<GetJobHiringTeamResponse> => {
    return client.get<GetJobHiringTeamResponse>(
      `/jobs/${encodeURIComponent(jobId)}/hiring-team`,
    )
  },

  /**
   * Assign an organization member to a job's hiring team (POST /api/jobs/:jobId/hiring-team).
   */
  addHiringTeamMember: (
    jobId: string,
    input: AddJobHiringTeamMemberInput,
  ): Promise<AddJobHiringTeamMemberResponse> => {
    return client.post<AddJobHiringTeamMemberResponse>(
      `/jobs/${encodeURIComponent(jobId)}/hiring-team`,
      input,
    )
  },

  /**
   * Remove a member from a job's hiring team (DELETE /api/jobs/:jobId/hiring-team/:userId).
   */
  removeHiringTeamMember: (
    jobId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> => {
    return client.delete<{ success: boolean; message: string }>(
      `/jobs/${encodeURIComponent(jobId)}/hiring-team/${encodeURIComponent(userId)}`,
    )
  },

  // --------------------------------------------------------------------------
  // Job Categories Helper
  // --------------------------------------------------------------------------

  /**
   * Fetch organization job categories (GET /api/organizations/:orgId/job-categories).
   */
  getJobCategories: (organizationId: string): Promise<JobCategoriesResponse> => {
    return client.get<JobCategoriesResponse>(
      `/organizations/${encodeURIComponent(organizationId)}/job-categories`,
    )
  },
}

export default jobApi
