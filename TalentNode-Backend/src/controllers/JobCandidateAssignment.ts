import { Request, Response } from 'express';
import mongoose from 'mongoose';
import JobCandidateAssignmentModel from '../models/JobCandidateAssignmentModel.js';
import JobsModel from '../models/JobsModel.js';
import { DEFAULT_HIRING_STAGES } from '../constants/defaultHiringStages.js';
import {
  getAuthUserId,
  getOrganizationIdFromUserId,
  parseObjectId,
  getAccessibleJobFilterForUser,
} from './helpers/controllerUtils.js';



const getApplicationsByHiringStageForJob = async (req: Request, res: Response) => {
    try {
        const userId = await getAuthUserId(req, res);
        if (!userId) return;

        const organizationId = await getOrganizationIdFromUserId(userId, res);
        if (!organizationId) return;

        const jobId = parseObjectId(req.params.jobId, 'job id', res);
        if (!jobId) return;

        // Ensure hiringStages exist on the job (legacy rows).
        const jobFilter = await getAccessibleJobFilterForUser(userId, organizationId);
        let job = await JobsModel.findOne({ ...jobFilter, _id: jobId });
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        if (!Array.isArray(job.hiringStages) || job.hiringStages.length === 0) {
            await JobsModel.updateOne(
                { _id: jobId, organizationId },
                { $set: { hiringStages: [...DEFAULT_HIRING_STAGES] } },
            );
            job = await JobsModel.findOne({ ...jobFilter, _id: jobId });
            if (!job) {
                return res.status(404).json({ success: false, message: "Job not found" });
            }
        }

        const orderedStages = [...(job.hiringStages ?? [])].sort(
            (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0),
        );

        const assignments = await JobCandidateAssignmentModel.find({
            jobId,
            organizationId,
        })
            .populate("candidateId")
            .lean();

        const firstStageId = orderedStages[0]?._id ? String(orderedStages[0]._id) : undefined;

        const stageIdToApplications = new Map<string, any[]>();
        for (const stage of orderedStages) {
            if (!stage?._id) continue;
            stageIdToApplications.set(String(stage._id), []);
        }

        for (const row of assignments as Array<{
            _id: mongoose.Types.ObjectId;
            hiringStageId?: mongoose.Types.ObjectId;
            candidateId?: any;
            jobId?: mongoose.Types.ObjectId;
        }>) {
            if (!row?.candidateId) continue;
            const stageId = row.hiringStageId ? String(row.hiringStageId) : firstStageId;

            if (!stageId) continue;
            const list = stageIdToApplications.get(stageId);
            if (list) {
                list.push({
                    ...row.candidateId,
                    applicationId: String(row._id),
                    jobId: row.jobId ? String(row.jobId) : String(job._id),
                    hiringStageId: row.hiringStageId ? String(row.hiringStageId) : stageId,
                });
            }
        }

        const stages = orderedStages.map((stage: any, idx: number) => ({
            id: stage._id ? String(stage._id) : String(idx),
            name: stage.name,
            order: typeof stage.order === "number" ? stage.order : idx,
            // Keep payload minimal: only applications (no duplicated candidates)
            candidates: stageIdToApplications.get(String(stage._id)) ?? [],
        }));

        return res.status(200).json({
            success: true,
            jobId: String(job._id),
            stages,
        });
    } catch (error) {
        console.error("Error fetching applications by hiring stage:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


const moveApplicationToHiringStage = async (req: Request, res: Response) => {
    try {
        const userId = await getAuthUserId(req, res);
        if (!userId) return;


        const organizationId = await getOrganizationIdFromUserId(userId, res);
        if (!organizationId) return;

        const jobId = parseObjectId(req.params.jobId, 'job id', res);
        const applicationId = parseObjectId(req.params.applicationId, 'application id', res);
        const hiringStageId = parseObjectId(
            (req.body as { hiringStageId?: string }).hiringStageId,
            'hiring stage id',
            res
        );

        if (!jobId || !applicationId || !hiringStageId) return;


        const jobFilter = await getAccessibleJobFilterForUser(userId, organizationId);
        const job = await JobsModel.findOne({ ...jobFilter, _id: jobId }).select("_id hiringStages");
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        const targetStage = (job.hiringStages ?? []).find(
            (stage: any) => String(stage._id) === hiringStageId,
        );
        if (!targetStage) {
            return res.status(404).json({ success: false, message: "Hiring stage not found" });
        }

        const assignment = await JobCandidateAssignmentModel.findOneAndUpdate(
            { _id: applicationId, jobId, organizationId },
            { $set: { hiringStageId } },
            { new: true },
        );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Application moved successfully",
            application: {
                id: String(assignment._id),
                jobId: String(assignment.jobId),
                candidateId: String(assignment.candidateId),
                hiringStageId: String(assignment.hiringStageId),
            },
            assignment: {
                id: String(assignment._id),
                jobId: String(assignment.jobId),
                candidateId: String(assignment.candidateId),
                hiringStageId: String(assignment.hiringStageId),
            },
        });
    } catch (error) {
        console.error("Error moving application to hiring stage:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export { getApplicationsByHiringStageForJob, moveApplicationToHiringStage };
