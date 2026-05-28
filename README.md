# TalentNode

TalentNode is a hiring management platform with:
- A **React + TypeScript (Vite)** frontend
- A **Node.js + Express + TypeScript** backend
- **MongoDB (Mongoose)** persistence
- A **public job portal** for unauthenticated applicants
- An org-scoped internal dashboard with job pipeline stages

Backend architecture details are documented in: **[`README_BACKEND_ARCHITECTURE.md`](./README_BACKEND_ARCHITECTURE.md)**.

---

## Repo layout

- `TalentNode-Backend/` — Express API + auth + organization scoping + pipeline logic
- `TalentNode-Frontend/` — React web app
- `README_BACKEND_ARCHITECTURE.md` — backend request flow and key modules

---

## Quick start

### 1) Backend

```bash
cd TalentNode-Backend
npm i
npm run dev
```

Backend script:
- `npm run dev` → `tsx watch src/server.ts`

### 2) Frontend

```bash
cd TalentNode-Frontend
npm i
npm run dev
```

Frontend script:
- `npm run dev` → `vite`

---

## Environment variables (expected)

The backend uses `dotenv` and relies on environment variables for:

- **MongoDB connection** (used by `ConnectDB()`)
- **JWT** verification (used by `authenticate` middleware)
- **CORS allowlist** (`CORS_ORIGINS`)
- **Cloudinary** for resume uploads (used in public apply flow)
- **Email** sending (used when resolving/rejecting with `sendEmail`)

> Set these in your backend `.env` file (e.g., `TalentNode-Backend/.env`) following the needs of the modules described in `README_BACKEND_ARCHITECTURE.md`.

---

## Application features

### Public job portal (unauthenticated)

Mounted under:
- `GET  /api/public/organizations/:slug/jobs`
- `GET  /api/public/jobs/:jobId`
- `POST /api/public/jobs/:jobId/apply` (multipart upload: `resume`)

Core behaviors:
- Only **open** and **published** jobs are returned
- Public application submission:
  - validates dynamic fields configured by the job’s `applicationForm`
  - uploads resume to **Cloudinary** (when configured/attached)
  - upserts a `Candidate`
  - prevents duplicate applications
  - creates `JobCandidateAssignment` in the first hiring stage

### Authenticated internal dashboard (organization scoped)

Key modules:
- Auth: register/login/profile (JWT)
- Organization management and role/permission checks
- Job CRUD + publish/status
- Hiring stages + pipeline management
- Candidate assignments per stage
- Resolving candidates (hired/rejected/withdrawn) with optional email

---

## Scripts

### Backend

From `TalentNode-Backend/`:
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run backfill:application-ids`

### Frontend

From `TalentNode-Frontend/`:
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

---

## API reference

For request/route flow, security, and pipeline behavior, see:
- **`README_BACKEND_ARCHITECTURE.md`**

(That document describes the Express middleware chain, public portal endpoints, and the internal application pipeline endpoints.)

---

## License

ISC

