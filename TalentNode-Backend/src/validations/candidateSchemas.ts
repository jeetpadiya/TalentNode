import { z } from "zod";

const linkSchema = z.object({
    platform: z.string().trim().optional(),
    url: z.string().trim().optional(),
});

export const createCandidateSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Valid email is required"),
    phone: z.string().trim().optional(),
    resume: z.string().trim().optional(),
    skills: z.array(z.string().trim()).optional(),
    experience: z.coerce.number().min(0).optional(),
    currentCompany: z.string().trim().optional(),
    currentRole: z.string().trim().optional(),
    links: z.array(linkSchema).optional(),
    tags: z.array(z.string().trim()).optional(),
    notes: z.string().trim().optional(),
    source: z.enum(["LinkedIn", "Referral", "Website", "Naukri", "Other"]).optional(),
    /** When set, assigns the created candidate to this job (same organization). */
    jobId: z.string().trim().optional(),
});
