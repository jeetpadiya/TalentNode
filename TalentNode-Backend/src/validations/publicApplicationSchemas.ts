import { z } from "zod";

const linkAnswerSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().trim().optional().default(""),
});

const customQuestionAnswerSchema = z.object({
  key: z.string().trim().min(1),
  answer: z.union([z.string(), z.array(z.string()), z.boolean()]).optional(),
});

export const publicApplicationSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("A valid email address is required"),
  phone: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  links: z.array(linkAnswerSchema).optional().default([]),
  customQuestionAnswers: z.array(customQuestionAnswerSchema).optional().default([]),
});

export type PublicApplicationInput = z.infer<typeof publicApplicationSchema>;
