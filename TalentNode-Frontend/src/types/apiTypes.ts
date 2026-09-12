/**
 * Centralized API Types for TalentNode Frontend
 * 
 * Comprehensive domain-specific Request & Response interfaces
 * strictly typed to match the backend API contracts across:
 * - Auth & User
 * - Organizations & Team Management
 * - Jobs, Hiring Stages, Application Forms & Hiring Team
 * - Candidates
 * - Applications, Stages, Reviews & Notes
 * - Settings (Job Categories, Message & Review Templates, User Preferences)
 * - Public Careers Portal
 */

// ============================================================================
// 1. COMMON / BASE API TYPES
// ============================================================================

export interface ApiFieldError {
    field: string
    message: string
}


export interface ApiErrorResponse {
    message: string
    errors?: ApiFieldError[]
    success?: boolean
}

export interface ApiBaseResponse {
    success: boolean
    message?: string
}

// ============================================================================
// 2. AUTH & USER DOMAIN
// ============================================================================

export type UserRole =
    | 'admin'
    | 'recruiter'
    | 'hiring_manager'
    | 'interviewer'
    | 'candidate'

export interface User {
    id: string
    username: string
    email: string
    role: UserRole
    organizationId: string | null
    createdAt?: string
    updatedAt?: string
}

export interface RegisterUserInput {
    username: string
    email: string
    password: string
}

export interface LoginUserInput {
    email: string
    password: string
}

export interface CheckUserEmailInput {
    email: string
}

export interface UpdateProfileInput {
    username: string
    email: string
}

export interface AuthResponse {
    message: string
    token: string
    user: User
    success?: boolean
}

export interface ProfileResponse {
    message: string
    user: User
    success?: boolean
}

export interface CheckUserEmailResponse {
    message: string
    exists: boolean
    nextStep: 'login' | 'signup'
    success?: boolean
}

// ============================================================================
// 3. ORGANIZATION DOMAIN
// ============================================================================

export interface Organization {
    id: string
    name: string
    slug: string
    description: string | null
    website: string | null
    allowedDomains: string[]
    logoUrl: string | null
    createdBy: string
    createdAt?: string
    updatedAt?: string
}

export interface CreateOrganizationInput {
    name: string
    description?: string
    website?: string
    allowedDomains?: string[]
    logoUrl?: string
}

export interface UpdateOrganizationInput {
    name?: string
    description?: string
    website?: string
    allowedDomains?: string[]
    logoUrl?: string
}

export interface OrganizationResponse {
    success: boolean
    message?: string
    organization: Organization
}

export interface OrganizationsResponse {
    success: boolean
    message?: string
    organizations: Organization[]
}

// Organization Team & Members
export type OrganizationTeamMemberRole = UserRole

export interface OrganizationTeamMember {
    id: string
    username: string | null
    email: string | null
    role: OrganizationTeamMemberRole | null
}

export interface GetOrganizationTeamResponse {
    success: boolean
    organizationId: string
    team: OrganizationTeamMember[]
}

export interface DeactivateTeamMemberResponse {
    success: boolean
    message: string
}

// Organization Invites
export type OrganizationInviteStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

export interface CreateOrganizationInviteInput {
    email: string
    role: OrganizationTeamMemberRole
}

export interface OrganizationInvite {
    id: string
    email: string
    role: OrganizationTeamMemberRole
    status: OrganizationInviteStatus
    expiresAt: string
    inviteUrl?: string
}

export interface CreateOrganizationInviteResponse {
    success: boolean
    message: string
    invite: OrganizationInvite
}

export interface RevokeOrganizationInviteResponse {
    success: boolean
    message: string
}

export interface OrganizationInvitePreviewDetails {
    id?: string
    name?: string | null
}

export interface GetOrganizationInviteResponse {
    success: boolean
    invite: {
        email: string
        role: OrganizationTeamMemberRole
        status: OrganizationInviteStatus
        expiresAt: string
        organization: OrganizationInvitePreviewDetails | string
    }
}

export interface AcceptOrganizationInviteResponse {
    success: boolean
    message: string
    organization: {
        id: string
        name: string
        slug: string
    } | null
}

// ============================================================================
// 4. JOBS DOMAIN
// ============================================================================

export type JobWorkMode = 'remote' | 'onsite' | 'hybrid'
export type JobEmploymentType = 'full_time' | 'part_time' | 'internship' | 'contract'
export type JobExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead'
export type JobStatus = 'draft' | 'open' | 'paused' | 'closed' | 'archived'

export interface HiringStage {
    id: string
    name: string
    order: number
}

export interface Job {
    id: string
    title: string
    department: string | null
    departmentName?: string | null
    location: string | null
    workMode: JobWorkMode
    employmentType: JobEmploymentType
    experienceLevel: JobExperienceLevel
    description: string
    responsibilities: string[]
    requirements: string[]
    niceToHave: string[]
    skills: string[]
    tags: string[]
    salaryMin: number | null
    salaryMax: number | null
    currency: string
    openings: number
    status: JobStatus
    isPublished: boolean
    publishedAt: string | null
    applicationDeadline: string | null
    organizationId: string
    createdBy: string
    hiringManagerId: string | null
    hiringStages?: HiringStage[]
    createdAt: string
    updatedAt: string
}

export interface CreateJobInput {
    title: string
}

export interface UpdateJobInput {
    title?: string
    department?: string
    location?: string
    workMode?: JobWorkMode
    employmentType?: JobEmploymentType
    experienceLevel?: JobExperienceLevel
    description?: string
    responsibilities?: string[]
    requirements?: string[]
    niceToHave?: string[]
    skills?: string[]
    tags?: string[]
    salaryMin?: number
    salaryMax?: number
    currency?: string
    openings?: number
    status?: JobStatus
    isPublished?: boolean
    applicationDeadline?: string
}

export interface UpdateJobStatusInput {
    status: JobStatus
}

export interface UpdateJobPublishInput {
    isPublished: boolean
}

export interface JobResponse {
    success: boolean
    message?: string
    job: Job
}

export interface JobsResponse {
    success: boolean
    message?: string
    jobs: Job[]
}

// Job Hiring Stages
export interface CreateHiringStageInput {
    name: string
    order: number
}

export interface UpdateHiringStageInput {
    name?: string
    order?: number
}

export interface SaveHiringPipelineInput {
    id?: string
    name: string
    order: number
}

export interface HiringStagesResponse {
    success: boolean
    message?: string
    hiringStages: HiringStage[]
}

export interface HiringStageResponse {
    success: boolean
    message?: string
    hiringStage: HiringStage
}

// Job Application Form Configuration
export type ApplicationFieldVisibility = 'Hidden' | 'Optional' | 'Required'
export type CustomQuestionFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio'

export interface ApplicationFieldConfig {
    key: string
    label: string
    visibility: ApplicationFieldVisibility
}

export interface CustomQuestion {
    key: string
    question: string
    fieldType: CustomQuestionFieldType
    required: boolean
    options: string[]
}

export interface ApplicationFormConfig {
    basicInfo?: {
        phone?: ApplicationFieldVisibility
        location?: ApplicationFieldVisibility
    }
    links?: ApplicationFieldConfig[]
    fileUploads?: ApplicationFieldConfig[]
    customQuestions?: CustomQuestion[]
}


export interface UpdateApplicationFormInput {
    basicInfo?: {
        phone?: ApplicationFieldVisibility
        location?: ApplicationFieldVisibility
    }
    links?: ApplicationFieldConfig[]
    fileUploads?: ApplicationFieldConfig[]
    customQuestions?: CustomQuestion[]
}

export interface CreateCustomQuestionInput {
    key: string
    question: string
    fieldType: CustomQuestionFieldType
    required: boolean
    options?: string[]
}

export interface ApplicationFormResponse {
    success: boolean
    message?: string
    applicationForm: ApplicationFormConfig
}

export interface CustomQuestionResponse {
    success: boolean
    message?: string
    question?: CustomQuestion
    applicationForm: ApplicationFormConfig
}

// Job Hiring Team
export interface JobHiringTeamMemberUser {
    id: string
    username: string | null
    email: string | null
    role: string | null
}

export interface JobHiringTeamMember {
    id: string
    role: 'recruiter' | 'hiring_manager' | 'interviewer'
    user: JobHiringTeamMemberUser
}

export interface JobHiringTeamGrouped {
    recruiters: JobHiringTeamMember[]
    hiringManagers: JobHiringTeamMember[]
    interviewers: JobHiringTeamMember[]
}

export interface GetJobHiringTeamResponse {
    success: boolean
    jobId: string
    owner: JobHiringTeamMemberUser | null
    hiringTeam: JobHiringTeamGrouped
    availableMembers: JobHiringTeamMemberUser[]
}

export interface AddJobHiringTeamMemberInput {
    userId: string
    role: 'recruiter' | 'hiring_manager' | 'interviewer'
}

export interface AddJobHiringTeamMemberResponse {
    success: boolean
    message: string
    member: JobHiringTeamMember
}

// ============================================================================
// 5. CANDIDATES DOMAIN
// ============================================================================

export type CandidateSource = 'LinkedIn' | 'Referral' | 'Website' | 'Naukri' | 'Other'

export interface CandidateLink {
    platform?: string
    url?: string
}

export interface Candidate {
    _id: string
    id?: string
    name: string
    email: string
    organizationId: string
    phone?: string
    resume?: string
    skills?: string[]
    experience?: number | null
    currentCompany?: string
    currentRole?: string
    links?: CandidateLink[]
    tags?: string[]
    notes?: string
    source?: CandidateSource
    applicationId?: string
    hiringStageId?: string
    jobId?: string
    createdAt?: string
    updatedAt?: string
    [key: string]: unknown
}

export interface CreateCandidateInput {
    name: string
    email: string
    phone?: string
    resume?: string
    skills?: string | string[]
    experience?: string | number
    currentCompany?: string
    currentRole?: string
    tags?: string | string[]
    notes?: string
    source?: CandidateSource
    jobId?: string
}

export interface UpdateCandidateInput extends Partial<CreateCandidateInput> { }

export interface CandidateResponse {
    success: boolean
    message?: string
    candidate: Candidate
}

export interface CandidatesResponse {
    success: boolean
    message?: string
    candidates: Candidate[]
}

export interface CandidatesForJobResponse {
    success: boolean
    candidates: Candidate[]
    jobId?: string
}

export interface DeleteCandidateResponse {
    success: boolean
    message?: string
    deleted?: {
        candidateId: string
        assignments: number
        applications: number
    }
}

// ============================================================================
// 6. APPLICATIONS & PIPELINE DOMAIN
// ============================================================================

export interface ApplicationStage {
    id: string
    name: string
    order: number
    candidates: Candidate[]
}

export interface ApplicationsByStageResponse {
    success: boolean
    jobId: string
    stages: ApplicationStage[]
}

export interface MoveApplicationStageInput {
    targetStageId: string
}

export interface MoveApplicationStageResponse {
    success: boolean
    message?: string
    assignment: {
        id: string
        jobId: string
        candidateId: string
        hiringStageId: string
    }
}

export type ApplicationResolution = 'hired' | 'rejected' | 'withdrawn' | 'active'

export interface ResolveApplicationInput {
    status: ApplicationResolution
    rejectionReason?: string
    sendEmail?: boolean
}

export interface ResolveApplicationResponse {
    success: boolean
    message: string
    assignment?: unknown
}

// Application Reviews
export type ReviewRequestStatus = 'pending' | 'completed' | 'cancelled'
export type ReviewRecommendation = 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire'

export interface ReviewRequestUser {
    id: string
    username: string | null
    email: string | null
}

export interface ReviewRequest {
    id: string
    status: ReviewRequestStatus
    message: string
    createdAt?: string | Date
    completedAt?: string | Date | null
    assignee: ReviewRequestUser
    requestedBy: ReviewRequestUser
}

export interface CreateReviewRequestInput {
    assigneeUserId: string
    message?: string
}

export interface SubmitReviewInput {
    rating: number
    recommendation: ReviewRecommendation
    notes?: string
}

export interface ListReviewRequestsResponse {
    success: boolean
    reviewRequests: ReviewRequest[]
}

export interface CreateReviewRequestResponse {
    success: boolean
    message: string
    reviewRequest: ReviewRequest | null
}

// Application Private Notes
export interface PrivateNoteItem {
    _id?: string
    text: string
    createdBy?:
    | string
    | {
        _id?: string
        username?: string | null
        email?: string | null
    }
    createdAt?: string
}

export interface CreatePrivateNoteInput {
    privatenote: string
    text?: string
}

export interface GetPrivateNotesResponse {
    success: boolean
    message?: string
    privateNotes?: PrivateNoteItem[]
    candidate?: unknown
}

export interface CreatePrivateNoteResponse {
    success: boolean
    message?: string
    application?: unknown
}

// Application Comments
export interface ApplicationComment {
    _id: string
    text: string
    createdBy: string | {
        _id?: string
        username?: string | null
        email?: string | null
    }
    createdAt: string
}

export interface GetApplicationCommentsResponse {
    success: boolean
    message?: string
    comments: ApplicationComment[]
    applications?: unknown[]
}

export interface AddApplicationCommentInput {
    comment: string
}

export interface EditApplicationCommentInput {
    newComment?: string
    text?: string
}

// Application Candidate Emails
export interface CandidateEmail {
    _id: string
    subject: string
    body: string
    sentBy?: string | {
        _id?: string
        username?: string | null
        email?: string | null
    }
    sentTo?: string
    createdAt: string
}

export interface SendCandidateEmailInput {
    subject: string
    body: string
}

export interface SendCandidateEmailResponse {
    success: boolean
    emailLog?: CandidateEmail | unknown
}

export interface GetCandidateEmailsResponse {
    success: boolean
    emails: CandidateEmail[]
}

// ============================================================================
// 7. SETTINGS DOMAIN
// ============================================================================

// Job Categories
export interface JobCategory {
    _id: string
    id?: string
    organizationId: string
    name: string
    order: number
}

export interface CreateJobCategoryInput {
    name: string
    order?: number
}

export interface UpdateJobCategoryInput {
    name?: string
    order?: number
}

export interface JobCategoriesResponse {
    categories: JobCategory[]
}

export interface JobCategoryResponse {
    category: JobCategory
}

// Message Templates
export interface MessageTemplate {
    _id: string
    id?: string
    organizationId: string
    title: string
    name?: string
    subject: string
    body: string
}

export interface CreateMessageTemplateInput {
    title?: string
    name?: string
    subject: string
    body: string
}

export interface UpdateMessageTemplateInput {
    title?: string
    name?: string
    subject?: string
    body?: string
}

export interface MessageTemplatesResponse {
    templates: MessageTemplate[]
}

export interface MessageTemplateResponse {
    template: MessageTemplate
}

// Review Templates
export interface ReviewTemplate {
    _id: string
    id?: string
    organizationId: string
    name: string
    template: string
}

export interface CreateReviewTemplateInput {
    name: string
    template: string
}

export interface UpdateReviewTemplateInput {
    name?: string
    template?: string
}

export interface ReviewTemplatesResponse {
    templates: ReviewTemplate[]
}

export interface ReviewTemplateResponse {
    template: ReviewTemplate
}

// User Preferences
export interface UserPreferences {
    newCandidateApplication: boolean
    newCommentOrReview: boolean
    newMessageFromCandidate: boolean
}

export interface UserPreferencesResponse extends UserPreferences { }

// ============================================================================
// 8. PUBLIC CAREERS PORTAL DOMAIN
// ============================================================================

export interface PublicJob {
    id: string
    title: string
    department: string | null
    location: string | null
    workMode?: string | null
    employmentType?: string | null
    experienceLevel?: string | null
    description?: string
    responsibilities?: string[]
    requirements?: string[]
    niceToHave?: string[]
    skills?: string[]
    tags?: string[]
    salaryMin?: number | null
    salaryMax?: number | null
    currency?: string | null
    openings?: number | null
    applicationDeadline?: string | null
    createdAt?: string
}

export interface PublicOrganization {
    id: string
    name: string
    slug: string
    description?: string | null
    website?: string | null
    logoUrl?: string | null
}

export interface PublicJobsResponse {
    success: boolean
    organization: PublicOrganization
    jobs: PublicJob[]
}

export interface PublicJobDetailResponse {
    success: boolean
    organization: PublicOrganization
    job: PublicJob
    applicationForm?: ApplicationFormConfig
}

export interface PublicApplicationInput {
    name: string
    email: string
    phone?: string
    location?: string
    links?: Array<{
        key: string
        value?: string
    }>
    customQuestionAnswers?: Array<{
        key: string
        answer?: string | string[] | boolean
    }>
    resume?: File | null
}

export interface SubmitPublicApplicationResponse {
    success: boolean
    message: string
    candidateId?: string
    applicationId?: string
}

// ============================================================================
// 9. ANALYTICS DOMAIN
// ============================================================================

export type AnalyticsRange = '7d' | '30d' | '90d' | 'all'

export interface AnalyticsFilterParams {
    jobId?: string
    range?: AnalyticsRange
}

export interface AnalyticsKpiMetrics {
    totalActiveJobs: number
    totalCandidates: number
    totalApplications: number
    hiredCount: number
    activeCount: number
    rejectedCount: number
    offerRate: number
    rejectionRate: number
    avgTimeToHireDays: number
}

export interface PipelineFunnelStage {
    stageId: string
    name: string
    order: number
    count: number
    conversionRate: number
}

export interface SourceAttributionItem {
    source: string
    count: number
    percentage: number
}

export interface ApplicationTrendDataPoint {
    date: string
    displayDate: string
    applications: number
    hires: number
}

export interface JobPerformanceMetric {
    jobId: string
    title: string
    department: string
    status: string
    openings: number
    appliedCount: number
    interviewCount: number
    hiredCount: number
    daysOpen: number
}

export interface RecruitingAnalyticsResponse {
    success: boolean
    kpis: AnalyticsKpiMetrics
    pipelineFunnel: PipelineFunnelStage[]
    sourceAttribution: SourceAttributionItem[]
    applicationTrends: ApplicationTrendDataPoint[]
    jobPerformance: JobPerformanceMetric[]
}


