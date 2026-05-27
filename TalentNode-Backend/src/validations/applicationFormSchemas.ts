import { z } from "zod";

const visibilitySchema = z.enum([
  "Hidden",
  "Optional",
  "Required",
]);

const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "select",
  "checkbox",
  "radio",
]);

const applicationFieldSchema = z.object({
  key: z.string().trim().min(1),

  label: z.string().trim().min(1),

  visibility: visibilitySchema,
});

export const customQuestionSchema = z.object({
  key: z.string().trim().min(1),

  question: z.string().trim().min(1),

  fieldType: fieldTypeSchema,

  required: z.boolean(),

   options: z.array(z.string()).default([]),
 }).superRefine((data, ctx) => {
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
    phone: visibilitySchema,

    location: visibilitySchema,
  }),

  links: z.array(applicationFieldSchema),

  fileUploads: z.array(applicationFieldSchema),

  customQuestions: z.array(customQuestionSchema),
});
