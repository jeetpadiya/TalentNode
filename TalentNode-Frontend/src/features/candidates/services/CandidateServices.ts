import type { ApiErrorResponse } from '../../../types/types'
import {
    candidateSingleResponseSchema,
    candidatesForJobResponseSchema,
    candidatesListResponseSchema,
    createCandidateFormSchema,
    type Candidate,
    type CreateCandidateFormValues,
} from './CandidateSchema'

export type CreateCandidateWithJobOptions = {
    /** Required for job-scoped assignment; sent to API as `jobId`. */
    jobId: string
}

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api'

const parseApiResponse = async <T>(
    response: Response,
    parser: (data: unknown) => T,
): Promise<T> => {
    const data: unknown = await response.json()

    if (!response.ok) {
        throw data as ApiErrorResponse
    }

    return parser(data)
}

const formToApiBody = (values: CreateCandidateFormValues) => {
    const parsed = createCandidateFormSchema.parse(values)
    const skills = parsed.skills
        ? parsed.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
        : undefined
    const tags = parsed.tags
        ? parsed.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
        : undefined
    const exp =
        parsed.experience?.trim() !== ''
            ? Number(parsed.experience)
            : undefined

    return {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone || undefined,
        resume: parsed.resume || undefined,
        skills,
        experience:
            exp !== undefined && !Number.isNaN(exp) ? exp : undefined,
        currentCompany: parsed.currentCompany || undefined,
        currentRole: parsed.currentRole || undefined,
        tags,
        notes: parsed.notes || undefined,
        source: parsed.source,
    }
}

const formToApiBodyWithJob = (
    values: CreateCandidateFormValues,
    jobId?: string,
) => {
    const base = formToApiBody(values)
    if (jobId?.trim()) return { ...base, jobId: jobId.trim() }
    return base
}

export const getCandidates = async (
    accessToken: string,
): Promise<Candidate[]> => {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    const data = await parseApiResponse(response, (value) =>
        candidatesListResponseSchema.parse(value),
    )

    return data.candidates
}

export const getCandidatesForJob = async (
    jobId: string,
    accessToken: string,
): Promise<Candidate[]> => {
    const response = await fetch(
        `${API_BASE_URL}/jobs/${encodeURIComponent(jobId)}/candidates`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    )

    const data = await parseApiResponse(response, (value) =>
        candidatesForJobResponseSchema.parse(value),
    )

    return data.candidates
}

export const createCandidate = async (
    input: CreateCandidateFormValues,
    accessToken: string,
    options?: CreateCandidateWithJobOptions,
): Promise<Candidate> => {
    const body = formToApiBodyWithJob(input, options?.jobId)

    const response = await fetch(`${API_BASE_URL}/candidates`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    const data = await parseApiResponse(response, (value) =>
        candidateSingleResponseSchema.parse(value),
    )

    return data.candidate
}

export type { Candidate, CreateCandidateFormValues }

export type EditCandidateFormValues = Partial<CreateCandidateFormValues>

export const editCandidate = async (
    candidateId: string,
    values: EditCandidateFormValues,
    accessToken: string,
): Promise<Candidate> => {
    const response = await fetch(
        `${API_BASE_URL}/candidates/${encodeURIComponent(candidateId)}`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        },
    )

    const data = await parseApiResponse(response, (value) =>
        candidateSingleResponseSchema.parse(value),
    )

    return data.candidate
}

