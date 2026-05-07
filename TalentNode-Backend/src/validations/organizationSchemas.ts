import { z } from "zod";

const slugifyOrganizationName = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const domainSchema = z
    .string()
    .transform((value) => value.trim().toLowerCase().replace(/^@/, ""))
    .refine((value) => value.length > 0, {
        message: "Domain cannot be empty",
    })
    .refine((value) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value), {
        message: "Invalid domain",
    });

const optionalUrlSchema = (fieldName: string) =>
    z
        .string()
        .trim()
        .url(`Please provide a valid ${fieldName}`)
        .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
            message: `${fieldName} must use http or https`,
        });

export const createOrganizationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Organization name must be at least 2 characters")
        .max(100, "Organization name must be 100 characters or less")
        .refine((value) => slugifyOrganizationName(value).length > 0, {
            message: "Organization name contains invalid characters",
        }),
    description: z
        .string()
        .trim()
        .max(500, "Description must be 500 characters or less")
        .optional(),
    website: optionalUrlSchema("website").optional(),
    allowedDomains: z
        .array(domainSchema)
        .optional()
        .transform((value) => (value ? Array.from(new Set(value)) : [])),
    logoUrl: optionalUrlSchema("logo URL").optional(),
});

export { slugifyOrganizationName };
