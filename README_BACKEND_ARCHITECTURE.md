# TalentNode Backend Architecture (Node + Express + MongoDB)

This document explains how the backend is structured and how requests flow through the system.

---

## 1) High-level overview

**Backend stack**
- **Express**: HTTP server + routing
- **MongoDB (Mongoose)**: persistence (jobs, candidates, applications, orgs, etc.)
- **JWT auth**: `Authorization: Bearer <token>`
- **Zod**: request payload validation
- **Cloudinary**: resume upload for public job applications

**Major layers**
1. **server.ts**: Express app setup (CORS, middleware, routes mounting)
2. **routes/**: URL definitions + middleware chain
3. **controllers/**: request handlers (business logic)
4. **middleware/**: authentication + organization scoping + authorization
5. **models/**: Mongoose schemas/models
6. **validations/**: Zod schemas for payload validation
7. **utils/**: shared utilities (Cloudinary upload, email, helpers)

---

## 2) Express app entrypoint: `TalentNode-Backend/src/server.ts`

### 2.1 Middlewares
- **CORS**
  - Reads `CORS_ORIGINS` and allowlists origins
  - Allows non-browser clients (requests without `Origin` header)
- **JSON parsing**
  - `app.use(express.json())`
- **Rate limiting for public endpoints**
  - Applies to `/api/public` using `express-rate-limit`
- **Health check**
  - `GET /api/health`

### 2.2 Route mounting
Routes are mounted under different prefixes:
- `/api/users` → `UserRoutes`
- `/api/user` → `UserPreferencesRoutes`
- `/api/organizations` → `OrganizationRoutes`
- `/api/jobs` →
  - `JobRoutes`
  - `CandidateApplicationRoutes`
  - `jobCandidateAssignmentRoutes`
  - `HiringStageRoute`
- `/api/candidates` → `CandidateRoutes`
- `/api/organizations/:organizationId/message-templates` → `MessageTemplateRoutes`
- `/api/organizations/:organizationId/review-templates` → `ReviewTemplateRoutes`
- `/api/organizations/:organizationId/job-categories` → `JobCategoryRoutes`
- `/api/public` → `PublicJobRoutes`

### 2.3 Start server
`ConnectDB()` is called before `app.listen()`.

---

## 3) Request pipeline (how security & org scoping works)

Most authenticated + org-scoped endpoints use a middleware chain, conceptually:

1. **`authenticate`** (JWT)
   - Reads `Authorization: Bearer ...`
   - Verifies token with `JWT_SECRET`
   - Attaches `req.user = { id, email }`

2. **Organization context**
   - `requireActiveOrganization` (scopes request to the user’s active organization)
   - `requireOrganizationParam` (validates/derives organizationId from URL params)

3. **Authorization**
   - `requireOrganizationRoles(...)` for role-based permissions
   - Additional role helpers include: admin / recruiter / hiring_manager and hiring-team access

This logic is centralized via exports from:
- `src/middleware/index.ts`

---

## 4) Public portal (unauthenticated) flow

Public endpoints are mounted at `/api/public` and rate-limited.

### 4.1 Routes: `src/routes/PublicJobRoutes.ts`
- `GET /api/public/organizations/:slug/jobs`
- `GET /api/public/jobs/:jobId`
- `POST /api/public/jobs/:jobId/apply` (multipart file upload: `resume`)

### 4.2 Controller: `src/controllers/publicController.ts`

#### A) List public jobs
**Endpoint**: `GET /api/public/organizations/:slug/jobs`

**Flow**
1. Validate `slug`
2. Find organization by `slug`
3. Query jobs where:
   - `organizationId` matches
   - `status: "open"`
   - `isPublished: true`
4. Respond with a **public-friendly** job payload (sanitized; includes only necessary fields)

#### B) Get one job + its application form configuration
**Endpoint**: `GET /api/public/jobs/:jobId`

**Flow**
1. Validate `jobId` (must be a valid ObjectId)
2. Find job where:
   - `_id = jobId`
   - `status: "open"`
   - `isPublished: true`
3. Populate organization (basic fields)
4. Return:
   - serialized job
   - organization
   - `applicationForm` configuration from the Job document

#### C) Submit a public application
**Endpoint**: `POST /api/public/jobs/:jobId/apply`

**Payload**
- `multipart/form-data`
- Fields validated with Zod (`publicApplicationSchema`)
- Optional/resolved file: `resume` via `upload.single('resume')`

**Flow**
1. Validate `jobId`
2. Parse special cases:
   - `links` may arrive as a JSON string
   - `customQuestionAnswers` may arrive as a JSON string
3. Validate request body via `publicApplicationSchema`
4. Fetch job where `status: "open"` and `isPublished: true`
5. Enforce `applicationDeadline` (returns 410 if passed)
6. Enforce dynamic required fields based on `job.applicationForm`
   - phone required / location required
   - resume required if configured
   - required custom questions must have non-empty answers
7. Upload resume to Cloudinary (if file is attached)
8. Upsert candidate:
   - find existing candidate by `(organizationId, email)`
   - create candidate if missing
   - update resume if new resume is provided
9. Prevent duplicate job application:
   - ensure no existing `JobCandidateAssignment` for `(jobId, candidateId)`
10. Create assignment:
   - find first hiring stage from `job.hiringStages` ordered by `order`
   - create `JobCandidateAssignmentModel` linking job/candidate/stage
11. Create/update a `CandidateApplicationModel` record:
   - stores `applicationId` (assignment id)
   - stores `customQuestionAnswers` and nested review/email/comment arrays
12. Respond `201` with `applicationId` (string id)

---

## 5) Authenticated backend flows (organization scoped)

### 5.1 User authentication: `src/routes/UserRoutes.ts` + `src/controllers/UserControlller.ts`

Routes:
- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/check-email`
- `GET /api/users/profile` (JWT)
- `PUT /api/users/profile` (JWT)

**JWT**
- Token contains: `{ id, email, role, organizationId }`
- Access expiration: `7d`

### 5.2 Organization context: `src/routes/OrganizationRoutes.ts`

Routes include:
- `POST /api/organizations` (create organization) [JWT]
- `GET /api/organizations` [JWT]
- `GET /api/organizations/invites/:token` (invite lookup)
- `POST /api/organizations/invites/:token/accept` [JWT]
- `GET /api/organizations/team` [JWT + active org + admin]
- Team management endpoints (invite, revoke, deactivate)
- `GET/PUT /api/organizations/:id` [JWT (+ admin for update)]

---

## 6) Jobs module (job lifecycle and application form)

### 6.1 Routes: `src/routes/JobRoutes.ts`
Mounted under `/api/jobs`.

Organization-scoped chain for most endpoints:
- `authenticate`
- `requireActiveOrganization`

Endpoints:
- `POST /api/jobs/` → create job
- `GET /api/jobs/` → list jobs
- `GET /api/jobs/:jobId/application-form` → get application form config
- `PUT /api/jobs/:jobId/application-form` → update application form config
- `POST /api/jobs/:jobId/application-form/custom-questions` → add custom question
- `PUT/DELETE .../custom-questions/:questionKey` → update/delete custom question
- `GET/POST/DELETE /api/jobs/:jobId/hiring-team/...` → manage hiring team
- `GET /api/jobs/:id` → get job by id
- `PUT /api/jobs/:id` → update job
- `PATCH /api/jobs/:id/status` → update status
- `PATCH /api/jobs/:id/publish` → toggle publish state

### 6.2 Controller: `src/controllers/JobController.ts`

Key behaviors:
- **createJob**
  - requires `req.user.id`
  - verifies user belongs to an organization
  - checks `canManageOrganizationRecruitingData`
  - initializes hiring stages with `DEFAULT_HIRING_STAGES`

- **getJobs**
  - fetches accessible jobs via `getAccessibleJobFilterForUser`

- **getJobById**
  - ensures hiring stages exist (backfill legacy rows)
  - resolves a friendly department name using `JobCategoryModel`
    - supports stored values formatted as `"{categoryId}|{categoryName}"`

- **updateJob / updateJobStatus / updateJobPublish**
  - all are validated with Zod schemas
  - permission checks enforce admin/recruiter recruiting access
  - publish toggles also update `status` (`open` vs `paused`)

### 6.3 Job document structure (partial)
`src/models/JobsModel.ts`:
- embedded `hiringStages: [{ name, order }]`
- `applicationForm` includes:
  - `basicInfo` visibility rules (Hidden/Optional/Required)
  - `links` configuration
  - `fileUploads` configuration
  - `customQuestions` configuration

---

## 7) Hiring stages & pipeline

### 7.1 Routes: `src/routes/HiringStageRoute.ts`
Mounted under `/api/jobs`.

All endpoints use:
- `authenticate`
- `requireActiveOrganization`

Endpoints:
- `POST /api/jobs/:jobId/hiring-stages`
- `GET /api/jobs/:jobId/hiring-stages`
- `PUT /api/jobs/:jobId/hiring-stages/:stageId`
- `DELETE /api/jobs/:jobId/hiring-stages/:stageId`
- `PUT /api/jobs/:jobId/hiring-pipeline` (save/reorder pipeline)

### 7.2 Stage ordering
Several parts of the system sort stages by `order` (lowest first) to determine:
- first stage for new public applications
- stage views for pipeline listing

---

## 8) Candidate application workflow & pipeline movement

### 8.1 Routes: `src/routes/jobCandidateAssignmentRoutes.ts`
Mounted under `/api/jobs`.

- `GET /api/jobs/:jobId/candidates`
- `GET /api/jobs/:jobId/applications` (grouped by hiring stage)
- `PATCH /api/jobs/:jobId/applications/:applicationId/stage`
  - move application to another stage
  - permitted for roles: `admin`, `recruiter`, `hiring_manager`
- `PATCH /api/jobs/:jobId/applications/:applicationId/resolve`
  - mark as `hired | rejected | withdrawn | active`
  - optional email sending on rejection (controlled by request body `sendEmail`)

### 8.2 Controller: `src/controllers/JobCandidateAssignment.ts`

#### A) Get applications grouped by stage
**Endpoint**: `GET /api/jobs/:jobId/applications`

**Flow**
1. Resolve authenticated user id and organization id
2. Ensure job exists and has `hiringStages`
   - backfill missing stages with `DEFAULT_HIRING_STAGES` if needed
   - merge any missing default terminal stages
3. Query `JobCandidateAssignmentModel` for the job/org excluding terminal statuses
4. Populate candidate info via `.populate('candidateId')`
5. Build response:
   - list of stages with `candidates: [{candidate fields..., applicationId, jobId, hiringStageId}]`

#### B) Move application to stage
**Endpoint**: `PATCH /api/jobs/:jobId/applications/:applicationId/stage`

**Flow**
1. Validate `jobId`, `applicationId`, `hiringStageId`
2. Confirm job and that target stage exists inside `job.hiringStages`
3. Update `JobCandidateAssignmentModel` with new `hiringStageId`

#### C) Resolve candidate outcome
**Endpoint**: `PATCH /api/jobs/:jobId/applications/:applicationId/resolve`

**Flow**
1. Validate status
2. Update assignment status (and set `rejectionReason` if rejected)
3. If rejected and `sendEmail === true`, send a rejection email
   - fetch candidate email/name and job title
   - generate HTML body and call `sendCandidateEmail`

---

## 9) Candidate entity CRUD

### 9.1 Routes: `src/routes/CandidateRoutes.ts`
Mounted under `/api/candidates`.

All endpoints use:
- `authenticate`
- `requireActiveOrganization`

CRUD:
- `POST /api/candidates` → create candidate
- `GET /api/candidates` → list candidates
- `GET /api/candidates/:id` → get candidate
- `PUT /api/candidates/:id` → update candidate
- `DELETE /api/candidates/:id` → delete candidate

---

## 10) Application details store (comments, notes, emails, review requests)

Application metadata is represented by:
- `src/models/CandidateApplicationModel.ts`

It stores:
- `comments[]`
- `PrivateNote[]`
- `emails[]`
- `reviewRequests[]`
- `customQuestionAnswers[]`

The REST API for these fields lives in:
- `src/routes/CandidateApplicationRoutes.ts`

(Controllers implement comment creation/edit/deletion, private notes, review request workflows, and email management.)

---

## 11) Error handling

`src/middleware/errorHandler.ts` is mounted last in `server.ts`.
This ensures any thrown/unhandled errors are returned in a consistent JSON structure.

---

## 12) API flow cheat-sheet (end-to-end)

### Public: job listing
1. Frontend → `GET /api/public/organizations/:slug/jobs`
2. server.ts routes → PublicJobRoutes → publicController.getPublicJobs
3. controller queries org + jobs and returns sanitized job payload

### Public: job details + application form
1. Frontend → `GET /api/public/jobs/:jobId`
2. controller enforces `status=open` and `isPublished=true`
3. returns job + applicationForm

### Public: apply
1. Frontend → `POST /api/public/jobs/:jobId/apply` (multipart)
2. controller validates payload with Zod
3. uploads resume to Cloudinary (optional)
4. upserts Candidate
5. checks duplicate application
6. creates JobCandidateAssignment (sets first stage)
7. creates CandidateApplication metadata record

### Private: pipeline view
1. Authenticated frontend → `GET /api/jobs/:jobId/applications`
2. middleware: `authenticate` + org scoping
3. controller returns stages grouped with candidates

### Private: move stage
1. Authenticated frontend → `PATCH /api/jobs/:jobId/applications/:applicationId/stage`
2. permissions: admin/recruiter/hiring_manager
3. controller updates assignment hiringStageId

### Private: resolve (hired/rejected/withdrawn)
1. Authenticated frontend → `PATCH /api/jobs/:jobId/applications/:applicationId/resolve`
2. controller updates assignment status
3. optionally triggers rejection email

---

## 13) Where to add new endpoints

To add a new backend feature:
1. Create/extend a controller method under `src/controllers/`
2. Add a route definition in the relevant `src/routes/*.ts`
3. Mount it from `src/server.ts` under the correct prefix
4. If the endpoint should be org-scoped, include:
   - `authenticate`
   - `requireActiveOrganization` or `requireOrganizationParam`
   - `requireOrganizationRoles(...)` or hiring-team access middleware
5. Add Zod validation in `src/validations/`

---

## Appendix: Key files (for quick navigation)
- `src/server.ts` — app bootstrap + route mounting
- `src/middleware/authenticate.ts` — JWT auth
- `src/middleware/organizationContext.ts` — org scoping
- `src/middleware/organizationAuthorization.ts` — role authorization
- `src/controllers/publicController.ts` — public job portal endpoints
- `src/controllers/JobController.ts` — job CRUD + publish/status
- `src/controllers/JobCandidateAssignment.ts` — pipeline + stage movement + resolve
- `src/controllers/UserControlller.ts` — auth endpoints
- `src/models/*` — Mongoose schemas


