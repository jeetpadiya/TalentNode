import { z } from 'zod'

export const userRoleSchema = z.enum([
  'admin',
  'recruiter',
  'hiring_manager',
  'interviewer',
  'candidate',
])

export const userSchema = z.object({
  id: z.string().min(1),
  username: z.string().trim().min(1),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  role: userRoleSchema,
  organizationId: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const emailSchema = z
  .string()
  .trim()
  .email('Please provide a valid email address')
  .transform((value) => value.toLowerCase())

export const registerUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username is required')
    .max(100, 'Username must be 100 characters or less'),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be 128 characters or less'),
})

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be 128 characters or less'),
})

export const checkUserEmailSchema = z.object({
  email: emailSchema,
})

export const authResponseSchema = z.object({
  message: z.string(),
  token: z.string().min(1),
  user: userSchema,
})

export const profileResponseSchema = z.object({
  message: z.string(),
  user: userSchema,
})

export const checkUserEmailResponseSchema = z.object({
  message: z.string(),
  exists: z.boolean(),
  nextStep: z.enum(['login', 'signup']),
})

export type User = z.infer<typeof userSchema>
export type RegisterUserInput = z.input<typeof registerUserSchema>
export type LoginUserInput = z.input<typeof loginUserSchema>
export type CheckUserEmailInput = z.input<typeof checkUserEmailSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type ProfileResponse = z.infer<typeof profileResponseSchema>
export type CheckUserEmailResponse = z.infer<
  typeof checkUserEmailResponseSchema
>
