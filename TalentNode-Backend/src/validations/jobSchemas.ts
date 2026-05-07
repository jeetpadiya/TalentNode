import { z } from "zod";

export const createJobSchema = z.object({
    title: z.string().trim().min(2, "Job title must be at least 2 characters"),
    department: z.string().trim().optional(),
    location: z.string().trim().optional(),
    workMode: z.enum(["remote", "onsite", "hybrid"]).optional(),
    employmentType: z.enum(["full_time", "part_time", "internship", "contract"]).optional(),
    experienceLevel: z.enum(["junior", "mid", "senior", "lead"]).optional(),
    description: z.string().trim().optional(),
    responsibilities: z.array(z.string().trim()).optional(),
    requirements: z.array(z.string().trim()).optional(),
    niceToHave: z.array(z.string().trim()).optional(),
    skills: z.array(z.string().trim()).optional(),
    tags: z.array(z.string().trim()).optional(),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    currency: z.string().trim().min(1).optional(),
    openings: z.number().int().min(1).optional(),
    status: z.enum(["draft", "open", "paused", "closed", "archived"]).optional(),
    isPublished: z.boolean().optional(),
    publishedAt: z.string().datetime().optional(),
    applicationDeadline: z.string().datetime().optional(),
    hiringManagerId: z.string().trim().optional(),
});

export const updateJobSchema = createJobSchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    { message: "At least one field is required" },
);
