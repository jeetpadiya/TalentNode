import { z } from 'zod'


export const jobSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  department: z.string().nullable(),
  location: z.string().nullable(),
  workMode: z.enum(['remote', 'onsite', 'hybrid']),
  employmentType: z.enum(['full_time', 'part_time', 'internship', 'contract']),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead']),
  description: z.string(),
  responsibilities: z.array(z.string()),
  requirements: z.array(z.string()),
  niceToHave: z.array(z.string()),
  skills: z.array(z.string()),
  tags: z.array(z.string()),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  currency: z.string(),
  openings: z.number(),
  status: z.enum(['draft', 'open', 'paused', 'closed', 'archived']),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  applicationDeadline: z.string().nullable(),
  organizationId: z.string().min(1),
  createdBy: z.string().min(1),
  hiringManagerId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const createJobSchema = z.object({
  title: z.string().trim().min(2, 'Job title must be at least 2 characters'),
})

export const updateJobSchema = z.object({
  title: z.string().trim().min(2).optional(),
  department: z.string().trim().optional(),
  location: z.string().trim().optional(),
  workMode: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  employmentType: z
    .enum(['full_time', 'part_time', 'internship', 'contract'])
    .optional(),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  description: z.string().trim().min(2).optional(),
  responsibilities: z.array(z.string().trim()).optional(),
  requirements: z.array(z.string().trim()).optional(),
  niceToHave: z.array(z.string().trim()).optional(),
  skills: z.array(z.string().trim()).optional(),
  tags: z.array(z.string().trim()).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().trim().min(1).optional(),
  openings: z.number().int().min(1).optional(),
  status: z.enum(['draft', 'open', 'paused', 'closed', 'archived']).optional(),
  isPublished: z.boolean().optional(),
  applicationDeadline: z.string().optional(),
})

export const jobsResponseSchema = z.object({
  success: z.boolean(),
  jobs: z.array(jobSchema),
})

export const jobResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  job: jobSchema,
})

export type Job = z.infer<typeof jobSchema>
export type CreateJobInput = z.input<typeof createJobSchema>
export type UpdateJobInput = z.input<typeof updateJobSchema>