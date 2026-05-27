import type { Request, Response } from "express";
import mongoose from "mongoose";
import UserModel from "../../models/UserModel.js";
import JobsModel from "../../models/JobsModel.js";
import JobCandidateAssignmentModel from "../../models/JobCandidateAssignmentModel.js";
import CandidateApplicationModel from "../../models/CandidateApplicationModel.js";
import CandidateModel from "../../models/CandidateModel.js";
import JobHiringTeamMemberModel from "../../models/JobHiringTeamMemberModel.js";
import {
  canManageRecruitingData,
  getAccessibleJobFilterForUser,
  resolveOrganizationMemberRole,
} from "../../authorization/organizationAccess.js";


export const getAuthUserId = async (
  req: Request,
  res: Response
): Promise<string | null> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }
  return userId;
};

export const getOrganizationIdFromUserId = async (
  userId: string,
  res: Response
): Promise<string | null> => {
  const user = await UserModel.findById(userId).select("organizationId");
  const organizationId = user?.organizationId;
  if (!organizationId) {
    res.status(400).json({
      success: false,
      message: "Organization is required",
    });
    return null;
  }
  return String(organizationId);
};

/** Organization id from authorization middleware (required on request). */
export const requireOrganizationOnRequest = (
  req: Request,
  res: Response,
): string | null => {
  const organizationId = req.organization?.organizationId;
  if (!organizationId) {
    res.status(500).json({
      success: false,
      message: "Organization context missing",
    });
    return null;
  }
  return organizationId;
};

/** Prefer middleware-populated `req.organization`, else load active org from user. */
export const getOrganizationIdFromRequest = async (
  req: Request,
  res: Response,
): Promise<string | null> => {
  if (req.organization?.organizationId) {
    return req.organization.organizationId;
  }

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return null;
  }

  return getOrganizationIdFromUserId(userId, res);
};

export const parseObjectId = (
  value: unknown,
  fieldName: string,
  res: Response
): string | null => {
  const str = Array.isArray(value) ? value[0] : (value as string | undefined);
  if (!str || !mongoose.isValidObjectId(str)) {
    res.status(400).json({
      success: false,
      message: `Invalid ${fieldName}`,
    });
    return null;
  }
  return str;
};

export const getJobOr404 = async (
  jobId: string,
  organizationId: string,
  res: Response
) => {
  const job = await JobsModel.findOne({ _id: jobId, organizationId });
  if (!job) {
    res.status(404).json({ success: false, message: "Job not found" });
    return null;
  }
  return job;
};

/** @deprecated Use `resolveOrganizationMemberRole` from `authorization/organizationAccess`. */
export const getOrganizationRoleForUser = resolveOrganizationMemberRole;

export { getAccessibleJobFilterForUser };

export const canManageOrganizationRecruitingData = async (
  userId: string,
  organizationId: string,
) => {
  const role = await resolveOrganizationMemberRole(userId, organizationId);
  return role !== null && canManageRecruitingData(role);
};

export const getAssignmentOr404 = async (
  params: {
    applicationId: string;
    jobId: string;
    organizationId: string;
  },
  res: Response
) => {
  const { applicationId, jobId, organizationId } = params;
  const assignment = await JobCandidateAssignmentModel.findOne({
    _id: applicationId,
    jobId,
    organizationId,
  });

  if (!assignment) {
    res
      .status(404)
      .json({ success: false, message: "Application not found" });
    return null;
  }

  return assignment;
};

export const isJobAssignedToInterviewer = async (
  params: { userId: string; organizationId: string; jobId: string }
) => {
  const { userId, organizationId, jobId } = params;

  return JobHiringTeamMemberModel.exists({
    organizationId,
    userId,
    role: "interviewer",
    jobId,
  });
};

export const requireJobAssignedToInterviewerOr403 = async (
  req: Request,
  res: Response,
  params: { jobId: string; organizationId: string }
) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return false;
  }

  const role = await resolveOrganizationMemberRole(
    userId,
    params.organizationId,
  );
  if (role !== "interviewer") return true;

  const ok = await isJobAssignedToInterviewer({
    userId,
    organizationId: params.organizationId,
    jobId: params.jobId,
  });

  if (!ok) {
    res.status(403).json({ success: false, message: "Forbidden" });
    return false;
  }

  return true;
};


export const getCandidateApplicationOr404 = async (
  params: {
    applicationId?: string;
    jobId: string;
    candidateId: string;
    organizationId: string;
    populateCandidate?: boolean;
  },
  res: Response
) => {
  const { applicationId, jobId, candidateId, organizationId, populateCandidate } = params;

  const query = CandidateApplicationModel.findOne(
    applicationId
      ? {
          $or: [
            { applicationId },
            { jobId, candidateId, organizationId },
          ],
        }
      : { jobId, candidateId, organizationId },
  );

  const application = populateCandidate
    ? await query.populate("candidateId", "name email")
    : await query;

  if (!application) {
    res.status(404).json({
      success: false,
      message: "Candidate application not found",
    });
    return null;
  }

  return application;
};

export const findCandidateApplicationForAssignment = async (params: {
  applicationId: string;
  jobId: string;
  candidateId: string | mongoose.Types.ObjectId;
  organizationId: string;
}) => {
  const { applicationId, jobId, candidateId, organizationId } = params;

  const application = await CandidateApplicationModel.findOne({
    $or: [
      { applicationId },
      { jobId, candidateId, organizationId },
    ],
  });

  if (
    application &&
    (!application.applicationId || String(application.applicationId) !== String(applicationId))
  ) {
    application.applicationId = new mongoose.Types.ObjectId(applicationId);
    await application.save();
  }

  return application;
};

export const ensureCandidateApplicationForAssignment = async (params: {
  applicationId: string;
  jobId: string;
  candidateId: string | mongoose.Types.ObjectId;
  organizationId: string;
}) => {
  const { applicationId, jobId, candidateId, organizationId } = params;

  const existing = await findCandidateApplicationForAssignment(params);
  if (existing) return existing;

  return CandidateApplicationModel.create({
    applicationId,
    jobId,
    candidateId,
    organizationId,
  });
};

export const getCandidateOr404 = async (
  params: { candidateId: string; organizationId: string },
  res: Response
) => {
  const { candidateId, organizationId } = params;
  const candidate = await CandidateModel.findOne({
    _id: candidateId,
    organizationId,
  });

  if (!candidate) {
    res.status(404).json({
      success: false,
      message: "Candidate not found",
    });
    return null;
  }

  return candidate;
};



