import { z } from 'zod'

export const candidateLinkSchema = z.object({
    platform: z.string().optional(),
    url: z.string().optional(),
})

export const candidateSchema = z
    .object({
        _id: z.string(),
        name: z.string(),
        email: z.string(),
        organizationId: z.string(),
        phone: z.string().optional(),
        resume: z.string().optional(),
        skills: z.array(z.string()).optional(),
        experience: z.number().nullable().optional(),
        currentCompany: z.string().optional(),
        currentRole: z.string().optional(),
        links: z.array(candidateLinkSchema).optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        source: z
            .enum(['LinkedIn', 'Referral', 'Website', 'Naukri', 'Other'])
            .optional(),
        applicationId: z.string().optional(),
        hiringStageId: z.string().optional(),
        jobId: z.string().optional(),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
    })
    .passthrough()

export const candidatesListResponseSchema = z.object({
    success: z.boolean(),
    candidates: z.array(candidateSchema),
})

/** GET /jobs/:jobId/candidates */
export const candidatesForJobResponseSchema = z.object({
    success: z.boolean(),
    candidates: z.array(candidateSchema),
    jobId: z.string().optional(),
})

export const candidateSingleResponseSchema = z.object({
    success: z.boolean(),
    candidate: candidateSchema,
})

export const createCandidateFormSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Valid email is required'),
    phone: z.string().trim().optional(),
    resume: z.string().trim().optional(),
    skills: z.string().trim().optional(),
    experience: z.string().trim().optional(),
    currentCompany: z.string().trim().optional(),
    currentRole: z.string().trim().optional(),
    tags: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    source: z
        .union([
            z.literal(''),
            z.enum(['LinkedIn', 'Referral', 'Website', 'Naukri', 'Other']),
        ])
        .optional()
        .transform((v) => (v === '' || v === undefined ? undefined : v)),
})

export type Candidate = z.infer<typeof candidateSchema>
/** Form payload before parsing (e.g. empty string from a select). */
export type CreateCandidateFormValues = z.input<typeof createCandidateFormSchema>
