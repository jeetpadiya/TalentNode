import OrganizationModel from "../models/OrganizationModel.js";
import UserModel from "../models/UserModel.js";
import type { Request, Response } from "express";

import OrganizationTeamMemberModel from "../models/OrganizationTeamMemberModel.js";
import { isOrganizationAdmin } from "../authorization/organizationAccess.js";

import {
    createOrganizationSchema,
    slugifyOrganizationName,
} from "../validations/organizationSchemas.js";


const formatZodErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
    issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
    }));

const serializeOrganization = (organization: any) => ({
    id: organization._id,
    name: organization.name,
    slug: organization.slug,
    description: organization.description ?? null,
    website: organization.website ?? null,
    allowedDomains: organization.allowedDomains,
    logoUrl: organization.logoUrl ?? null,
    createdBy: organization.createdBy,
});

const getAccessibleOrganizationIds = async (userId: string) => {
    const memberships = await OrganizationTeamMemberModel.find({ userId })
        .select("organizationId")
        .lean();

    return Array.from(
        new Set([
            ...memberships.map((membership) => String(membership.organizationId)),
        ]),
    );
};

const createOrganization = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const parsedBody = createOrganizationSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const { name, description, website, allowedDomains, logoUrl } = parsedBody.data;

        const normalizedWebsite = website?.toLowerCase();
        const trimmedLogoUrl = logoUrl?.trim();
        const slug = slugifyOrganizationName(name);

        const existingOrganization = await OrganizationModel.findOne({
            createdBy: userId,
            slug,
        });

        if (existingOrganization) {
            return res.status(409).json({
                success: false,
                message: "You have already created an organization with this name",
            });
        }

        const newOrganization = new OrganizationModel({
            name,
            slug,
            description,
            website: normalizedWebsite,
            allowedDomains,
            logoUrl: trimmedLogoUrl,
            createdBy: userId,
        });

        await newOrganization.save();

        // Ensure the org owner also appears in the team list UI.
        await OrganizationTeamMemberModel.findOneAndUpdate(
            { organizationId: newOrganization._id, userId },
            {
                $setOnInsert: {
                    organizationId: newOrganization._id,
                    userId,
                    role: "admin",
                },
            },
            { upsert: true, new: true },
        );

        await UserModel.findByIdAndUpdate(userId, {
            organizationId: newOrganization._id,
            role: "admin",
        });


        return res.status(201).json({
            success: true,
            message: "Organization created successfully",
            organization: serializeOrganization(newOrganization),
        });
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message: "You have already created an organization with this name",
            });
        }

        console.error("Error creating organization:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getOrganizations = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const memberOrganizationIds = await getAccessibleOrganizationIds(userId);

        const organizations = await OrganizationModel.find({
            $or: [
                { createdBy: userId },
                { _id: { $in: memberOrganizationIds } },
            ],
        }).sort({ createdAt: -1 });

        if (organizations.length === 0) {
            return res.status(404).json({ success: false, message: "Organizations not found" });
        }

        return res.status(200).json({
            success: true,
            organizations: organizations.map(serializeOrganization),
        });
    } catch (error: any) {
        console.error("Error fetching organizations:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getOrganizationById = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const membership = await OrganizationTeamMemberModel.findOne({
            organizationId: req.params.id,
            userId,
        });

        const organization = await OrganizationModel.findOne({
            _id: req.params.id,
            $or: [
                { createdBy: userId },
                ...(membership ? [{ _id: req.params.id }] : []),
            ],
        });

        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }

        await UserModel.findByIdAndUpdate(userId, {
            organizationId: organization._id,
        });

        return res.status(200).json({
            success: true,
            organization: serializeOrganization(organization),
        });
    } catch (error) {
        console.error("Error fetching organization by id:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateOrganization = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const organizationId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id;

        if (!organizationId) {
            return res.status(400).json({ success: false, message: "Invalid organization" });
        }

        if (!(await isOrganizationAdmin(userId, organizationId))) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }

        const existingOrganization = await OrganizationModel.findById(organizationId);
        if (!existingOrganization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }

        // Validate using create schema but allow partial update.
        // We validate what frontend sends (name/description/website/allowedDomains/logoUrl).
        const parsedBody = createOrganizationSchema
            .partial()
            .safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const { name, description, website, allowedDomains, logoUrl } = parsedBody.data;

        const nextName = name ?? existingOrganization.name;
        const nextSlug = name ? slugifyOrganizationName(nextName) : existingOrganization.slug;

        if (name && nextSlug !== existingOrganization.slug) {
            const slugOwnerConflict = await OrganizationModel.findOne({
                _id: { $ne: existingOrganization._id },
                createdBy: existingOrganization.createdBy,
                slug: nextSlug,
            });

            if (slugOwnerConflict) {
                return res.status(409).json({
                    success: false,
                    message: "You have already created an organization with this name",
                });
            }
        }

        if (name) existingOrganization.name = nextName;
        if (name) existingOrganization.slug = nextSlug;
        if (typeof description !== "undefined") existingOrganization.description = description;

        if (typeof website !== "undefined") {
            existingOrganization.website = website ? website.toLowerCase() : undefined;
        }

        if (typeof allowedDomains !== "undefined") {
            existingOrganization.allowedDomains = allowedDomains;
        }

        if (typeof logoUrl !== "undefined") {
            existingOrganization.logoUrl = logoUrl?.trim();
        }

        await existingOrganization.save();

        return res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            organization: serializeOrganization(existingOrganization),
        });
    } catch (error) {
        console.error("Error updating organization:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export { createOrganization, getOrganizations, getOrganizationById, updateOrganization };
