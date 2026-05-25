import { z } from "zod";

export const createReviewRequestSchema = z.object({
  assigneeUserId: z.string().min(1, "assigneeUserId is required"),
  message: z
    .string()
    .trim()
    .max(2000, "Message must be 2000 characters or fewer")
    .optional(),
});
