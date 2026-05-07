import OrganizationModel from "../models/OrganizationModel.js";
import UserModel from "../models/UserModel.js";
import type { Request, Response } from "express";
import { createOrganizationSchema, slugifyOrganizationName } from "../validations/organizationSchemas.js";

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
        await UserModel.findByIdAndUpdate(userId, {
            organizationId: newOrganization._id,
        });

        return res.status(201).json({
            success: true,
            message: "Organization created successfully",
            organization: serializeOrganization(newOrganization),
        });

    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
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

        const organizations = await OrganizationModel.find({ createdBy: userId }).sort({ createdAt: -1 });

        if (organizations.length === 0) {
            return res.status(404).json({ success: false, message: "Organizations not found" });
        }

        return res.status(200).json({
            success: true,
            organizations: organizations.map(serializeOrganization),
        });

    }
    catch (error: any) {
        console.error("Error fetching organizations:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }

}

const getOrganizationById = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const organization = await OrganizationModel.findOne({
            _id: req.params.id,
            createdBy: userId,
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
}

export { createOrganization, getOrganizations, getOrganizationById };
