import type { Request, Response } from "express";
import mongoose from "mongoose";

import JobsModel from "../models/JobsModel.js";
import UserModel from "../models/UserModel.js";
import {
    createHiringStageSchema,
    updateHiringStageSchema,
} from "../validations/jobSchemas.js";
import {
    canManageOrganizationRecruitingData,
    getAccessibleJobFilterForUser,
} from "./helpers/controllerUtils.js";

import { getParamValue } from "../utils/ParamValue.js";

const formatZodErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
    issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
    }));

const serializeHiringStages = (job: any) => {
    const stages = Array.isArray(job.hiringStages) ? job.hiringStages : [];
    return [...stages]
        .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
        .map((stage: { _id: unknown; name: string; order: number }) => ({
            id: String(stage._id),
            name: stage.name,
            order: stage.order,
        }));
};

const toNormalizedStages = (stages: Array<{ _id?: unknown; name: string; order: number }>) =>
    [...stages]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((stage, index) => ({
            _id: stage._id,
            name: stage.name.trim(),
            order: index,
        }));



const getScopedJob = async (userId: string, jobId: string) => {
    const user = await UserModel.findById(userId).select("organizationId");
    const organizationId = user?.organizationId;
    if (!organizationId) return null;

    const job = await JobsModel.findOne({
        ...(await getAccessibleJobFilterForUser(userId, String(organizationId))),
        _id: jobId,
    });
    return job;
};

const requirePipelineManager = async (userId: string, jobId: string, res: Response) => {
    const user = await UserModel.findById(userId).select("organizationId");
    const organizationId = user?.organizationId;
    if (!organizationId) {
        res.status(400).json({ success: false, message: "Organization is required" });
        return false;
    }

    if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
        res.status(403).json({
            success: false,
            message: "Only admins and recruiters can manage hiring stages",
        });
        return false;
    }

    return JobsModel.findOne({ _id: jobId, organizationId });
};

const getHiringStages = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const jobId = getParamValue(req.params.jobId);
        if (!jobId) {
            return res.status(400).json({ success: false, message: "Job id is required" });
        }

        const job = await requirePipelineManager(userId, jobId, res);
        if (job === false) return;
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        return res.status(200).json({
            success: true,
            hiringStages: serializeHiringStages(job),
        });
    } catch (error) {
        console.error("Error fetching hiring stages:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const createHiringStage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const jobId = getParamValue(req.params.jobId);
        if (!jobId) {
            return res.status(400).json({ success: false, message: "Job id is required" });
        }

        const parsedBody = createHiringStageSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const job = await requirePipelineManager(userId, jobId, res);
        if (job === false) return;
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        const currentStages = serializeHiringStages(job);
        const requestedOrder = parsedBody.data.order ?? currentStages.length;
        const insertOrder = Math.min(Math.max(requestedOrder, 0), currentStages.length);

        const newStage = {
            _id: new mongoose.Types.ObjectId(),
            name: parsedBody.data.name.trim(),
            order: insertOrder,
        };

        const nextStages = toNormalizedStages([
            ...currentStages
                .filter((stage) => mongoose.Types.ObjectId.isValid(stage.id))
                .map((stage) => ({
                    _id: stage.id,
                    name: stage.name,
                    order: stage.order,
                })),
            newStage,
        ]);

        job.hiringStages = nextStages as any;
        await job.save();

        const createdStage = serializeHiringStages(job).find(
            (stage) => stage.id === String(newStage._id),
        );

        return res.status(201).json({
            success: true,
            message: "Hiring stage created successfully",
            hiringStage: createdStage,
        });
    } catch (error) {
        console.error("Error creating hiring stage:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateHiringStage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const parsedBody = updateHiringStageSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formatZodErrors(parsedBody.error.issues),
            });
        }

        const stageId = getParamValue(req.params.stageId);
        if (!stageId) {
            return res.status(400).json({ success: false, message: "Stage id is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(stageId)) {
            return res.status(400).json({ success: false, message: "Invalid stage id" });
        }
        const jobId = getParamValue(req.params.jobId);
        if (!jobId) {
            return res.status(400).json({ success: false, message: "Job id is required" });
        }

        const job = await requirePipelineManager(userId, jobId, res);
        if (job === false) return;
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        const serialized = serializeHiringStages(job);
        const stageIndex = serialized.findIndex((stage) => stage.id === stageId);
        if (stageIndex === -1) {
            return res.status(404).json({ success: false, message: "Hiring stage not found" });
        }

        const stageToUpdate = serialized[stageIndex]!;
        const requestedOrder = parsedBody.data.order ?? stageToUpdate.order;
        const clampedOrder = Math.min(Math.max(requestedOrder, 0), serialized.length - 1);

        const reordered = serialized.filter((stage) => stage.id !== stageId);
        reordered.splice(clampedOrder, 0, {
            ...stageToUpdate,
            name: parsedBody.data.name?.trim() ?? stageToUpdate.name,
            order: clampedOrder,
        });

        const nextStages = toNormalizedStages(
            reordered.map((stage) => ({
                _id: stage.id,
                name: stage.name,
                order: stage.order,
            })),
        );

        job.hiringStages = nextStages as any;
        await job.save();

        const updatedStage = serializeHiringStages(job).find((stage) => stage.id === stageId);

        return res.status(200).json({
            success: true,
            message: "Hiring stage updated successfully",
            hiringStage: updatedStage,
        });
    } catch (error) {
        console.error("Error updating hiring stage:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteHiringStage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const stageId = getParamValue(req.params.stageId);
        if (!stageId) {
            return res.status(400).json({ success: false, message: "Stage id is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(stageId)) {
            return res.status(400).json({ success: false, message: "Invalid stage id" });
        }
        const jobId = getParamValue(req.params.jobId);
        if (!jobId) {
            return res.status(400).json({ success: false, message: "Job id is required" });
        }

        const job = await getScopedJob(userId, jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        const serialized = serializeHiringStages(job);
        if (serialized.length <= 1) {
            return res.status(400).json({
                success: false,
                message: "At least one hiring stage is required",
            });
        }

        const nextStagesRaw = serialized.filter((stage) => stage.id !== stageId);
        if (nextStagesRaw.length === serialized.length) {
            return res.status(404).json({ success: false, message: "Hiring stage not found" });
        }

        const nextStages = toNormalizedStages(
            nextStagesRaw.map((stage) => ({
                _id: stage.id,
                name: stage.name,
                order: stage.order,
            })),
        );

        job.hiringStages = nextStages as any;
        await job.save();

        return res.status(200).json({
            success: true,
            message: "Hiring stage deleted successfully",
            hiringStages: serializeHiringStages(job),
        });
    } catch (error) {
        console.error("Error deleting hiring stage:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const saveHiringPipeline = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const jobId = getParamValue(req.params.jobId);

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job id is required",
      });
    }

    const stages = req.body.stages;

    if (!Array.isArray(stages)) {
      return res.status(400).json({
        success: false,
        message: "Stages array is required",
      });
    }

    const job = await requirePipelineManager(userId, jobId, res);
    if (job === false) return;

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

 const normalizedStages = stages.map(
  (
    stage: {
      id?: string;
      name: string;
      order: number;
    },
    index: number,
  ) => ({
    _id:
      stage.id && mongoose.Types.ObjectId.isValid(stage.id)
        ? new mongoose.Types.ObjectId(stage.id)
        : new mongoose.Types.ObjectId(),

    name: stage.name.trim(),

    order: index,
  }),
);

    job.hiringStages = normalizedStages;

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Pipeline updated successfully",
      hiringStages: serializeHiringStages(job),
    });
  } catch (error) {
    console.error("Error saving hiring pipeline:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export { createHiringStage, deleteHiringStage, getHiringStages, updateHiringStage,saveHiringPipeline };
