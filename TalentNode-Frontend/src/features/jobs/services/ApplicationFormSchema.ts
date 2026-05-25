import { z } from "zod";

export const visibilitySchema = z.enum([
  "Hidden",
  "Optional",
  "Required",
]);

export const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "select",
  "checkbox",
  "radio",
]);

export const applicationFieldSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Field key is required"),

  label: z
    .string()
    .trim()
    .min(1, "Field label is required"),

  visibility: visibilitySchema,
});

export const customQuestionSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1, "Question key is required"),

    question: z
      .string()
      .trim()
      .min(1, "Question text is required"),

    fieldType: fieldTypeSchema,

    required: z.boolean(),

    options: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (
      ["select", "checkbox", "radio"].includes(
        data.fieldType,
      ) &&
      data.options.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options are required",
        path: ["options"],
      });
    }
  });

export const applicationFormSchema = z.object({
  basicInfo: z.object({
    phone: visibilitySchema.default("Hidden"),

    location: visibilitySchema.default("Hidden"),
  }).default({ phone: "Hidden", location: "Hidden" }),

  links: z.array(applicationFieldSchema).default([]),

  fileUploads: z.array(applicationFieldSchema).default([]),

  customQuestions: z.array(customQuestionSchema).default([]),
});

export type ApplicationFormInput = z.infer<
  typeof applicationFormSchema>;