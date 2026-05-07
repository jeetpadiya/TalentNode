import { z } from "zod";

const emailSchema = z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .transform((value) => value.toLowerCase());

export const registerUserSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "Username is required")
        .max(100, "Username must be 100 characters or less"),
    email: emailSchema,
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must be 128 characters or less"),
});

export const loginUserSchema = z.object({
    email: emailSchema,
    password: z
        .string()
        .min(1, "Password is required")
        .max(128, "Password must be 128 characters or less"),
});

export const checkUserEmailSchema = z.object({
    email: emailSchema,
});
