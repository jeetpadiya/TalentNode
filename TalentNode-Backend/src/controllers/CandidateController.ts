import type { Request, Response } from "express";
import { MongoServerError } from "mongodb";
import mongoose from "mongoose";

import CandidateApplicationModel from "../models/CandidateApplicationModel.js";
import CandidateModel from "../models/CandidateModel.js";
import JobCandidateAssignmentModel from "../models/JobCandidateAssignmentModel.js";
import JobsModel from "../models/JobsModel.js";
import UserModel from "../models/UserModel.js";
import { createCandidateSchema } from "../validations/candidateSchemas.js";
import { z } from "zod";
import {
    canManageOrganizationRecruitingData,
    getAccessibleJobFilterForUser,
    getOrganizationRoleForUser,
} from "./helpers/controllerUtils.js";


const formatZodErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
    issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
    }));

const getCandidatesForJob = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { jobId } = req.params;
        if (!mongoose.isValidObjectId(jobId)) {
            return res.status(400).json({ success: false, message: "Invalid job id" });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required",
            });
        }

        const job = await JobsModel.findOne({ _id: jobId, organizationId });
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        const accessibleJob = await JobsModel.findOne({
            ...(await getAccessibleJobFilterForUser(userId, String(organizationId))),
            _id: jobId,
        }).select("_id");

        if (!accessibleJob) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        const assignments = await JobCandidateAssignmentModel.find({
            jobId,
            organizationId,
        })
            .populate("candidateId")
            .sort({ createdAt: -1 })
            .lean();

        const candidates = assignments
            .map((row) => row.candidateId)
            .filter((doc): doc is NonNullable<typeof doc> => doc !== null && typeof doc === "object");

        return res.status(200).json({
            success: true,
            candidates,
            jobId: String(job._id),
        });
    } catch (error) {
        console.error("Error fetching candidates for job:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getCandidates = async (req: Request, res: Response) => {
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
                message: "Organization is required to fetch candidates",
            });
        }

        const role = await getOrganizationRoleForUser(userId, String(organizationId));

        if (role === "hiring_manager" || role === "interviewer") {
            const accessibleJobs = await JobsModel.find(
                await getAccessibleJobFilterForUser(userId, String(organizationId)),
            ).select("_id");
            const accessibleJobIds = accessibleJobs.map((job) => job._id);

            const assignments = await JobCandidateAssignmentModel.find({
                organizationId,
                jobId: { $in: accessibleJobIds },
            })
                .sort({ updatedAt: -1 })
                .lean();

            const candidateIds = Array.from(
                new Set(assignments.map((assignment) => String(assignment.candidateId))),
            );

            const candidates = await CandidateModel.find({
                organizationId,
                _id: { $in: candidateIds },
            })
                .sort({ createdAt: -1 })
                .lean();

            const candidateIdToJobId = new Map<string, string>();
            const candidateIdToApplicationId = new Map<string, string>();
            for (const assignment of assignments) {
                const candidateId = String(assignment.candidateId);
                if (!candidateIdToJobId.has(candidateId)) {
                    candidateIdToJobId.set(candidateId, String(assignment.jobId));
                    candidateIdToApplicationId.set(candidateId, String(assignment._id));
                }
            }

            const candidatesWithJob = candidates.map((candidate) => ({
                ...candidate,
                jobId: candidateIdToJobId.get(String(candidate._id)),
                applicationId: candidateIdToApplicationId.get(String(candidate._id)),
            }));

            return res.status(200).json({
                success: true,
                candidates: candidatesWithJob,
            });
        }

        const candidates = await CandidateModel.find({ organizationId })
            .sort({ createdAt: -1 })
            .lean();

        const candidateIds = candidates.map((candidate) => candidate._id);
        const assignments = await JobCandidateAssignmentModel.find({
            organizationId,
            candidateId: { $in: candidateIds },
        })
            .sort({ updatedAt: -1 })
            .lean();

        const candidateIdToJobId = new Map<string, string>();
        const candidateIdToApplicationId = new Map<string, string>();
        for (const assignment of assignments) {
            const candidateId = String(assignment.candidateId);
            if (!candidateIdToJobId.has(candidateId)) {
                candidateIdToJobId.set(candidateId, String(assignment.jobId));
                candidateIdToApplicationId.set(candidateId, String(assignment._id));
            }
        }

        const candidatesWithJob = candidates.map((candidate) => ({
            ...candidate,
            jobId: candidateIdToJobId.get(String(candidate._id)),
            applicationId: candidateIdToApplicationId.get(String(candidate._id)),
        }));

        return res.status(200).json({
            success: true,
            candidates: candidatesWithJob,
        });
    }
    catch(error){
        console.error("Error fetching candidates:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

const getCandidateById = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid candidate id" });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required to fetch this candidate",
            });
        }

        const candidate = await CandidateModel.findOne({ _id: id, organizationId });

        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        const role = await getOrganizationRoleForUser(userId, String(organizationId));
        if (role === "hiring_manager" || role === "interviewer") {
            const accessibleJobs = await JobsModel.find(
                await getAccessibleJobFilterForUser(userId, String(organizationId)),
            ).select("_id");
            const accessibleJobIds = accessibleJobs.map((job) => job._id);
            const assignment = await JobCandidateAssignmentModel.findOne({
                organizationId,
                candidateId: id,
                jobId: { $in: accessibleJobIds },
            }).select("_id");

            if (!assignment) {
                return res.status(404).json({ success: false, message: "Candidate not found" });
            }
        }

        return res.status(200).json({
            success: true,
            candidate,
        });
    }
    catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ success: false, message: "Invalid candidate id" });
        }
        console.error("Error fetching candidate by id:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const createCandidate = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const parsedBody = createCandidateSchema.safeParse(req.body);
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
                message: "Organization is required to create a candidate",
            });
        }

        if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
            return res.status(403).json({
                success: false,
                message: "Only admins and recruiters can create candidates",
            });
        }

        const payload = parsedBody.data;
        const jobIdRaw = payload.jobId;
        const { jobId: _omit, ...candidateRest } = payload;

        const newCandidate = await CandidateModel.create({
            ...candidateRest,
            name: payload.name.trim(),
            email: payload.email.trim().toLowerCase(),
            organizationId,
        });

        const linkJobId =
            jobIdRaw && mongoose.isValidObjectId(jobIdRaw) ? jobIdRaw : undefined;
        if (linkJobId) {
            const job = await JobsModel.findOne({
                _id: linkJobId,
                organizationId,
            })
                .select("_id hiringStages");
            if (job) {
                const orderedStages = Array.isArray(job.hiringStages)
                    ? [...job.hiringStages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    : [];
                const firstStageId =
                    orderedStages[0]?._id ?? undefined;
                try {
                    const assignment = await JobCandidateAssignmentModel.create({
                        organizationId,
                        jobId: linkJobId,
                        candidateId: newCandidate._id,
                        hiringStageId: firstStageId,
                    });
                    await CandidateApplicationModel.findOneAndUpdate(
                        {
                            jobId: linkJobId,
                            candidateId: newCandidate._id,
                            organizationId,
                        },
                        {
                            $setOnInsert: {
                                jobId: linkJobId,
                                candidateId: newCandidate._id,
                                organizationId,
                            },
                            $set: {
                                applicationId: assignment._id,
                            },
                        },
                        { upsert: true, new: true },
                    );
                } catch (assignErr: unknown) {
                    if (!(assignErr instanceof MongoServerError) || assignErr.code !== 11000) {
                        throw assignErr;
                    }
                    // duplicate assignment — ignore (idempotent-ish)
                }
            }
        }

        return res.status(201).json({
            success: true,
            candidate: newCandidate,
        });
    } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A candidate with this email already exists in your organization",
            });
        }
        if (error instanceof mongoose.Error.ValidationError) {
            const fieldErrors = Object.values(error.errors).map((e) => ({
                field: e.path,
                message: e.message,
            }));
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: fieldErrors,
            });
        }
        console.error("Error creating candidate:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};




const updateCandidate = async (req: Request, res: Response) => {

    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid candidate id" });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required to update a candidate",
            });
        }

        if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
            return res.status(403).json({
                success: false,
                message: "Only admins and recruiters can update candidates",
            });
        }

        // Lazy import schema to keep changes localized.
        // Payload supports partial updates.
        // NOTE: we validate only fields present in body.
        const schema = createCandidateSchema
            .partial()
            .extend({
                skills: z.array(z.string().trim()).optional(),
                tags: z.array(z.string().trim()).optional(),
                links: z
                    .array(
                        z.object({
                            platform: z.string().trim().optional(),
                            url: z.string().trim().optional(),
                        }),
                    )
                    .optional(),
            });

        const parsedBody = schema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const payload = parsedBody.data as Record<string, unknown>;

        const existing = await CandidateModel.findOne({ _id: id, organizationId });
        if (!existing) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        // Special normalization similar to create:
        if (typeof payload.email === 'string') {
            payload.email = payload.email.trim().toLowerCase();
        }
        if (typeof payload.name === 'string') {
            payload.name = payload.name.trim();
        }

        await CandidateModel.updateOne(
            { _id: id, organizationId },
            {
                $set: payload,
            },
        );

        const updated = await CandidateModel.findOne({ _id: id, organizationId });

        return res.status(200).json({ success: true, candidate: updated });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const fieldErrors = Object.values(error.errors).map((e) => ({
                field: (e as any).path,
                message: (e as any).message,
            }));
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: fieldErrors,
            });
        }

        // Unique email violation
        if (error && typeof error === 'object' && 'code' in error && (error as any).code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A candidate with this email already exists in your organization",
            });
        }

        console.error("Error updating candidate:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteCandidate = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid candidate id" });
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization is required to delete a candidate",
            });
        }

        if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
            return res.status(403).json({
                success: false,
                message: "Only admins and recruiters can delete candidates",
            });
        }

        const candidate = await CandidateModel.findOne({ _id: id, organizationId }).select("_id");
        if (!candidate) {
            return res.status(404).json({ success: false, message: "Candidate not found" });
        }

        const [assignmentsResult, applicationsResult] = await Promise.all([
            JobCandidateAssignmentModel.deleteMany({
                organizationId,
                candidateId: id,
            }),
            CandidateApplicationModel.deleteMany({
                organizationId,
                candidateId: id,
            }),
        ]);

        await CandidateModel.deleteOne({ _id: id, organizationId });

        return res.status(200).json({
            success: true,
            message: "Candidate deleted successfully",
            deleted: {
                candidateId: id,
                assignments: assignmentsResult.deletedCount,
                applications: applicationsResult.deletedCount,
            },
        });
    } catch (error) {
        console.error("Error deleting candidate:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export {
    getCandidates,
    getCandidatesForJob,
    getCandidateById,
    createCandidate,
    updateCandidate,
    deleteCandidate,
};
