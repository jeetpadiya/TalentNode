import type { Request, Response } from "express";

import { DEFAULT_HIRING_STAGES } from "../constants/defaultHiringStages.js";
import JobsModel from "../models/JobsModel.js";
import UserModel from "../models/UserModel.js";
import JobCategoryModel from "../models/JobCategoryModel.js";
import { createJobSchema, updateJobSchema, updateJobStatusSchema } from "../validations/jobSchemas.js";
import mongoose from "mongoose";


import {
    canManageOrganizationRecruitingData,
    getAccessibleJobFilterForUser,
} from "./helpers/controllerUtils.js";

const formatZodErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
    issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
    }));

const serializeHiringStages = (job: any) => {
    const stages = job.hiringStages ?? [];
    return [...stages]
        .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
        .map((s: { _id: unknown; name: string; order: number }) => ({
            id: String(s._id),
            name: s.name,
            order: s.order,
        }));
};

const serializeJob = (job: any, departmentName: string | null = null) => ({
    id: job._id,
    title: job.title,
    // Backward compatible field (stored string)
    department: job.department ?? null,
    // Friendly name
    departmentName: departmentName ?? null,
    location: job.location ?? null,
    workMode: job.workMode ?? "onsite",
    employmentType: job.employmentType ?? "full_time",
    experienceLevel: job.experienceLevel ?? "junior",
    description: job.description ?? "Draft job description",
    responsibilities: job.responsibilities ?? [],
    requirements: job.requirements ?? [],
    niceToHave: job.niceToHave ?? [],
    skills: job.skills ?? [],
    tags: job.tags ?? [],
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    currency: job.currency ?? "INR",
    openings: job.openings ?? 1,
    status: job.status,
    isPublished: job.isPublished,
    publishedAt: job.publishedAt ?? null,
    applicationDeadline: job.applicationDeadline ?? null,
    organizationId: job.organizationId,
    createdBy: job.createdBy,
    hiringManagerId: job.hiringManagerId ?? null,
    hiringStages: serializeHiringStages(job),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
});

const createJob = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const parsedBody = createJobSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required before creating a job",
            });
        }

        if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
            return res.status(403).json({
                success: false,
                message: "Only admins and recruiters can create jobs",
            });
        }

        const payload = parsedBody.data;
        const createdJob = await JobsModel.create({
            ...payload,
            title: payload.title.trim(),
            description: payload.description?.trim() || "Draft job description",
            employmentType: payload.employmentType ?? "full_time",
            organizationId,
            createdBy: userId,
            hiringStages: [...DEFAULT_HIRING_STAGES],
            publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
            applicationDeadline: payload.applicationDeadline
                ? new Date(payload.applicationDeadline)
                : undefined,
        });

        return res.status(201).json({
            success: true,
            message: "Job created successfully",
            job: serializeJob(createdJob),
        });
    } catch (error) {
        console.error("Error creating job:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getJobs = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required to fetch jobs",
            });
        }

        const jobFilter = await getAccessibleJobFilterForUser(userId, String(organizationId));

        const jobs = await JobsModel.find(jobFilter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            jobs: jobs.map((j) => serializeJob(j, null)),
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getJobById = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;
        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required to fetch this job",
            });
        }

        const jobFilter = await getAccessibleJobFilterForUser(userId, String(organizationId));

        let job = await JobsModel.findOne({ ...jobFilter, _id: id });

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        if (!job.hiringStages?.length) {
            await JobsModel.updateOne(
                { ...jobFilter, _id: id },
                { $set: { hiringStages: [...DEFAULT_HIRING_STAGES] } },
            );
            job = await JobsModel.findOne({ ...jobFilter, _id: id });
            if (!job) {
                return res.status(404).json({ success: false, message: "Job not found" });
            }
        }

        // Resolve friendly department name from stored department string.
        // Expected convention (front-end mapper): "{categoryId}|{categoryName}".
        // Fallback: if stored value is just a category id or category name.
        let departmentName: string | null = null;
        const rawDepartment = job.department;

        if (rawDepartment) {
            const parts = String(rawDepartment).split('|');
            const maybeId = parts[0] ?? '';
            const rest = parts.slice(1);

            // id|name
            if (rest.length > 0 && maybeId) {
                const maybeName = rest.join('|').trim();
                if (maybeName) departmentName = maybeName;
            }

            // fallback lookup
            if (!departmentName) {
                // Only attempt _id lookup if maybeId is a valid ObjectId.
                // This prevents CastError when rawDepartment is actually a name (e.g. "software developer").
                if (maybeId && mongoose.Types.ObjectId.isValid(maybeId)) {
                    const byId = await JobCategoryModel.findOne({
                        _id: maybeId,
                        organizationId: String(organizationId),
                    }).select('name');
                    departmentName = byId?.name ?? null;
                }

                if (!departmentName) {
                    const byName = await JobCategoryModel.findOne({
                        name: rawDepartment,
                        organizationId: String(organizationId),
                    }).select('name');
                    departmentName = byName?.name ?? null;
                }
            }

        }

        return res.status(200).json({
            success: true,
            job: serializeJob(job, departmentName),
        });
    } catch (error) {
        console.error("Error fetching job by id:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateJob = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const parsedBody = updateJobSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required to update this job",
            });
        }

        if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
            return res.status(403).json({
                success: false,
                message: "Only admins and recruiters can update jobs",
            });
        }

        const payload = parsedBody.data;

        const updatePayload: Record<string, unknown> = Object.fromEntries(
            Object.entries({
                ...payload,
                title: payload.title?.trim(),
                description: payload.description?.trim(),
                publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
                applicationDeadline: payload.applicationDeadline
                    ? new Date(payload.applicationDeadline)
                    : undefined,
            }).filter(([, value]) => value !== undefined),
        );

        const updatedJob = await JobsModel.findOneAndUpdate(
            { _id: req.params.id, organizationId },
            updatePayload,
            { new: true, runValidators: true },
        );

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Job updated successfully",
            job: serializeJob(updatedJob),
        });
    } catch (error) {
        console.error("Error updating job:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateJobStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const parsedBody = updateJobStatusSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required to update this job",
            });
        }

        if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
            return res.status(403).json({
                success: false,
                message: "Only admins and recruiters can update job status",
            });
        }

        const { status } = parsedBody.data;

        const updatedJob = await JobsModel.findOneAndUpdate(
            { _id: req.params.id, organizationId },
            { status, ...(status === 'open' ? { isPublished: true } : {}) },
            { new: true, runValidators: true },
        );

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Job status updated successfully",
            job: serializeJob(updatedJob),
        });
    } catch (error) {
        console.error("Error updating job status:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateJobPublish = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { isPublished } = req.body as { isPublished?: boolean };
        if (typeof isPublished !== 'boolean') {
            return res.status(400).json({ success: false, message: "isPublished (boolean) is required" });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({ success: false, message: "Organization is required" });
        }

        if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
            return res.status(403).json({ success: false, message: "Only admins and recruiters can publish jobs" });
        }

        // When publishing, also set status to 'open'. When unpublishing, set status to 'paused'.
        const statusUpdate = isPublished ? { isPublished: true, status: 'open', publishedAt: new Date() } : { isPublished: false, status: 'paused' };

        const updatedJob = await JobsModel.findOneAndUpdate(
            { _id: req.params.id, organizationId },
            statusUpdate,
            { new: true, runValidators: true },
        );

        if (!updatedJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        return res.status(200).json({
            success: true,
            message: isPublished ? "Job published successfully" : "Job unpublished successfully",
            job: serializeJob(updatedJob),
        });
    } catch (error) {
        console.error("Error updating job publish status:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export { createJob, getJobs, getJobById, updateJob, updateJobStatus, updateJobPublish };

