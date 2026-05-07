import { z } from 'zod'

export const organizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  website: z.string().nullable(),
  allowedDomains: z.array(z.string()),
  logoUrl: z.string().nullable(),
  createdBy: z.string().min(1),
})

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, 'Organization name is required'),
  description: z.string().trim().optional(),
  website: z.string().trim().optional(),
  allowedDomains: z.array(z.string().trim().min(1)).optional(),
  logoUrl: z.string().trim().optional(),
})

export const organizationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  organization: organizationSchema,
})

export const organizationsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  organizations: z.array(organizationSchema),
})

export type Organization = z.infer<typeof organizationSchema>
export type CreateOrganizationInput = z.input<typeof createOrganizationSchema>
export type OrganizationResponse = z.infer<typeof organizationResponseSchema>
export type OrganizationsResponse = z.infer<typeof organizationsResponseSchema>
