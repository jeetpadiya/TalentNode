import { z } from "zod";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";



const apiSuccessSchema = z.object({
  success: z.boolean(),
});

const publicJobsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  workMode: z.string().nullable().optional(),
  employmentType: z.string().nullable().optional(),
  experienceLevel: z.string().nullable().optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  niceToHave: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  openings: z.number().nullable().optional(),
  applicationDeadline: z.string().nullable().optional(),
  createdAt: z.string().optional(),
});

export type PublicJob = z.infer<typeof publicJobsItemSchema>;

const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
});

const publicJobsResponseSchema = z.object({
  success: z.boolean(),
  organization: organizationSchema,
  jobs: z.array(publicJobsItemSchema),
});

export const getPublicJobsByOrgSlug = async (slug: string) => {
  const res = await fetch(
    `${API_BASE_URL}/public/organizations/${encodeURIComponent(slug)}/jobs`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await res.json().catch(() => null);

  const ok = apiSuccessSchema.safeParse(data);
  if (!res.ok || !ok.success) {
    const message =
      (data as any)?.message ?? `Failed to fetch public jobs (${res.status})`;
    throw new Error(message);
  }

  return publicJobsResponseSchema.parse(data);
};

const publicApplicationSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  links: z
    .array(
      z.object({
        key: z.string(),
        value: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  customQuestionAnswers: z
    .array(
      z.object({
        key: z.string(),
        answer: z.union([z.string(), z.array(z.string()), z.boolean()]).optional(),
      }),
    )
    .optional()
    .default([]),
});

export type PublicApplicationInput = z.infer<typeof publicApplicationSchema>;

const publicJobDetailResponseSchema = z.object({
  success: z.boolean(),
  job: publicJobsItemSchema,
  organization: organizationSchema,
  applicationForm: z
    .object({
      basicInfo: z
        .object({
          phone: z.enum(["Hidden", "Optional", "Required"]).optional(),
          location: z.enum(["Hidden", "Optional", "Required"]).optional(),
        })
        .optional(),
      links: z
        .array(
          z.object({
            key: z.string(),
            label: z.string().optional(),
            visibility: z.enum(["Hidden", "Optional", "Required"]).optional().default("Hidden"),
          }),
        )
        .optional()
        .default([]),
      fileUploads: z
        .array(
          z.object({
            key: z.string(),
            label: z.string().optional(),
            visibility: z.enum(["Hidden", "Optional", "Required"]).optional().default("Hidden"),
          }),
        )
        .optional()
        .default([]),
      customQuestions: z
        .array(
          z.object({
            key: z.string(),
            question: z.string(),
            required: z.boolean(),
            fieldType: z
              .enum(["text", "textarea", "select", "checkbox", "radio"])
              .optional()
              .default("text"),
            options: z.array(z.string()).optional().default([]),
          }),
        )
        .optional()
        .default([]),
    })
    .passthrough(),
});

export type PublicJobDetailResponse = z.infer<
  typeof publicJobDetailResponseSchema
>;

export const getPublicJobById = async (jobId: string) => {
  const res = await fetch(
    `${API_BASE_URL}/public/jobs/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = await res.json().catch(() => null);

  const ok = apiSuccessSchema.safeParse(data);
  if (!res.ok || !ok.success) {
    const message =
      (data as any)?.message ?? `Failed to fetch public job (${res.status})`;
    throw new Error(message);
  }

  return publicJobDetailResponseSchema.parse(data);
};

export const submitPublicApplication = async (
  jobId: string,
  payload: PublicApplicationInput | FormData,
) => {
  const isFormData = payload instanceof FormData;
  const res = await fetch(
    `${API_BASE_URL}/public/jobs/${encodeURIComponent(jobId)}/apply`,
    {
      method: "POST",
      ...(isFormData ? {} : { headers: { "Content-Type": "application/json" } }),
      body: isFormData ? payload : JSON.stringify(payload),
    },
  );

  const data = await res.json().catch(() => null);

  const ok = apiSuccessSchema.safeParse(data);
  if (!res.ok || !ok.success) {
    const message = (data as any)?.message ?? `Failed to submit (${res.status})`;
    const errors = (data as any)?.errors;
    throw new Error(message, { cause: { errors } } as any);
  }

  return data as {
    success: boolean;
    message: string;
    applicationId?: string;
  };
};
