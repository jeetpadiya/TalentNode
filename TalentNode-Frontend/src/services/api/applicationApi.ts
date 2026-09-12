import { client } from '../../lib/client'
import type {
  AddApplicationCommentInput,
  ApplicationsByStageResponse,
  CreatePrivateNoteInput,
  CreatePrivateNoteResponse,
  CreateReviewRequestInput,
  CreateReviewRequestResponse,
  EditApplicationCommentInput,
  GetApplicationCommentsResponse,
  GetCandidateEmailsResponse,
  GetPrivateNotesResponse,
  ListReviewRequestsResponse,
  MoveApplicationStageResponse,
  ResolveApplicationInput,
  ResolveApplicationResponse,
  SendCandidateEmailInput,
  SendCandidateEmailResponse,
} from '../../types/apiTypes'

/**
 * Centralized Application API Service
 * 
 * Interacts with /api/jobs/:jobId/applications endpoints using the centralized client.ts
 * with automatic authorization headers, base URL handling, parameter serialization,
 * and unified error interception.
 */
export const applicationApi = {
  // --------------------------------------------------------------------------
  // Pipeline & Stages
  // --------------------------------------------------------------------------

  /**
   * Fetch all applications for a job grouped by hiring stages (GET /api/jobs/:jobId/applications).
   */
  getApplicationsByHiringStages: (
    jobId: string,
  ): Promise<ApplicationsByStageResponse> => {
    return client.get<ApplicationsByStageResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications`,
    )
  },

  /**
   * Move an application to a new hiring stage in the Kanban pipeline (PATCH /api/jobs/:jobId/applications/:applicationId/stage).
   */
  moveApplicationToHiringStage: (
    jobId: string,
    applicationId: string,
    hiringStageId: string,
  ): Promise<MoveApplicationStageResponse> => {
    return client.patch<MoveApplicationStageResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/stage`,
      { hiringStageId },
    )
  },

  /**
   * Resolve an application (e.g. mark hired, rejected, withdrawn, active) (PATCH /api/jobs/:jobId/applications/:applicationId/resolve).
   */
  resolveApplication: (
    jobId: string,
    applicationId: string,
    input: ResolveApplicationInput,
  ): Promise<ResolveApplicationResponse> => {
    return client.patch<ResolveApplicationResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/resolve`,
      input,
    )
  },

  // --------------------------------------------------------------------------
  // Review Requests
  // --------------------------------------------------------------------------

  /**
   * Fetch review requests for an application (GET /api/jobs/:jobId/applications/:applicationId/review-requests).
   */
  getReviewRequests: (
    jobId: string,
    applicationId: string,
  ): Promise<ListReviewRequestsResponse> => {
    return client.get<ListReviewRequestsResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/review-requests`,
    )
  },

  /**
   * Create a review request for a team member (POST /api/jobs/:jobId/applications/:applicationId/review-requests).
   */
  createReviewRequest: (
    jobId: string,
    applicationId: string,
    input: CreateReviewRequestInput,
  ): Promise<CreateReviewRequestResponse> => {
    return client.post<CreateReviewRequestResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/review-requests`,
      input,
    )
  },

  // --------------------------------------------------------------------------
  // Private Notes
  // --------------------------------------------------------------------------

  /**
   * Fetch private notes for an application (GET /api/jobs/:jobId/applications/:applicationId/private-note).
   */
  getPrivateNotes: (
    jobId: string,
    applicationId: string,
  ): Promise<GetPrivateNotesResponse> => {
    return client.get<GetPrivateNotesResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/private-note`,
    )
  },

  /**
   * Add a private note to an application (POST /api/jobs/:jobId/applications/:applicationId/private-note).
   */
  createPrivateNote: (
    jobId: string,
    applicationId: string,
    input: CreatePrivateNoteInput | string,
  ): Promise<CreatePrivateNoteResponse> => {
    const body =
      typeof input === 'string'
        ? { privatenote: input }
        : { privatenote: input.privatenote ?? input.text ?? '' }

    return client.post<CreatePrivateNoteResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/private-note`,
      body,
    )
  },

  // --------------------------------------------------------------------------
  // Comments
  // --------------------------------------------------------------------------

  /**
   * Fetch comments on an application (GET /api/jobs/:jobId/applications/:applicationId/comments).
   */
  getComments: (
    jobId: string,
    applicationId: string,
  ): Promise<GetApplicationCommentsResponse> => {
    return client.get<GetApplicationCommentsResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/comments`,
    )
  },

  /**
   * Add a comment to an application (POST /api/jobs/:jobId/applications/:applicationId/comments).
   */
  addComment: (
    jobId: string,
    applicationId: string,
    input: AddApplicationCommentInput | string,
  ): Promise<GetApplicationCommentsResponse> => {
    const body = typeof input === 'string' ? { comment: input } : input
    return client.post<GetApplicationCommentsResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/comments`,
      body,
    )
  },

  /**
   * Edit a comment on an application (PUT /api/jobs/:jobId/applications/:applicationId/comments/:commentId).
   */
  editComment: (
    jobId: string,
    applicationId: string,
    commentId: string,
    input: EditApplicationCommentInput | string,
  ): Promise<{ success: boolean; message?: string }> => {
    const body =
      typeof input === 'string'
        ? { text: input }
        : { text: input.text ?? input.newComment ?? '' }

    return client.put<{ success: boolean; message?: string }>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/comments/${encodeURIComponent(commentId)}`,
      body,
    )
  },

  /**
   * Delete a comment on an application (DELETE /api/jobs/:jobId/applications/:applicationId/comments/:commentId).
   */
  deleteComment: (
    jobId: string,
    applicationId: string,
    commentId: string,
  ): Promise<{ success: boolean; message?: string }> => {
    return client.delete<{ success: boolean; message?: string }>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/comments/${encodeURIComponent(commentId)}`,
    )
  },

  // --------------------------------------------------------------------------
  // Candidate Emails
  // --------------------------------------------------------------------------

  /**
   * Fetch sent email history for an application (GET /api/jobs/:jobId/applications/:applicationId/emails).
   */
  getCandidateEmails: (
    jobId: string,
    applicationId: string,
  ): Promise<GetCandidateEmailsResponse> => {
    return client.get<GetCandidateEmailsResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/emails`,
    )
  },

  /**
   * Send an email to a candidate in an application (POST /api/jobs/:jobId/applications/:applicationId/emails).
   */
  sendCandidateEmail: (
    jobId: string,
    applicationId: string,
    input: SendCandidateEmailInput,
  ): Promise<SendCandidateEmailResponse> => {
    return client.post<SendCandidateEmailResponse>(
      `/jobs/${encodeURIComponent(jobId)}/applications/${encodeURIComponent(applicationId)}/emails`,
      input,
    )
  },
}

export default applicationApi
