import type { Request, Response } from "express";

import JobsModel from "../models/JobsModel.js";
import UserModel from "../models/UserModel.js";
import { createJobSchema, updateJobSchema } from "../validations/jobSchemas.js";

const formatZodErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
    issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
    }));

const serializeJob = (job: any) => ({
    id: job._id,
    title: job.title,
    department: job.department ?? null,
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

        const payload = parsedBody.data;
        const createdJob = await JobsModel.create({
            ...payload,
            title: payload.title.trim(),
            description: payload.description?.trim() || "Draft job description",
            employmentType: payload.employmentType ?? "full_time",
            organizationId,
            createdBy: userId,
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

        const jobs = await JobsModel.find({ organizationId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            jobs: jobs.map(serializeJob),
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

        const job = await JobsModel.findOne({ _id: id, organizationId });

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        return res.status(200).json({
            success: true,
            job: serializeJob(job),
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

        const payload = parsedBody.data;
        const updatePayload = Object.fromEntries(Object.entries({
            ...payload,
            title: payload.title?.trim(),
            description: payload.description?.trim(),
            publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
            applicationDeadline: payload.applicationDeadline
                ? new Date(payload.applicationDeadline)
                : undefined,
        }).filter(([, value]) => value !== undefined));

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

export { createJob, getJobs, getJobById, updateJob };
