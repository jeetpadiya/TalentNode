import type { Request, Response } from "express";
import mongoose from "mongoose";
import CandidateApplicationModel from "../models/CandidateApplicationModel.js";
import JobHiringTeamMemberModel from "../models/JobHiringTeamMemberModel.js";
import JobsModel from "../models/JobsModel.js";
import UserModel from "../models/UserModel.js";
import { resolveOrganizationMemberRole } from "../authorization/organizationAccess.js";
import { createReviewRequestSchema } from "../validations/applicationReviewSchemas.js";
import {
  getAccessibleJobFilterForUser,
  getAssignmentOr404,
  getAuthUserId,
  getOrganizationIdFromUserId,
  ensureCandidateApplicationForAssignment,
  findCandidateApplicationForAssignment,
  parseObjectId,
} from "./helpers/controllerUtils.js";
import { logError, sendError } from "../utils/errorHandling.js";

const formatZodErrors = (
  issues: Array<{ path: PropertyKey[]; message: string }>,
) =>
  issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
  }));

const REVIEW_REQUESTER_ROLES = new Set([
  "admin",
  "recruiter",
  "hiring_manager",
]);

const REVIEW_ASSIGNEE_ROLES = new Set(["hiring_manager", "interviewer"]);

const serializeReviewRequest = (request: {
  _id?: mongoose.Types.ObjectId;
  assigneeUserId: unknown;
  requestedBy: unknown;
  message?: string;
  status: string;
  createdAt?: Date;
  completedAt?: Date | null;
}) => {
  const assignee =
    typeof request.assigneeUserId === "object" &&
    request.assigneeUserId !== null &&
    "_id" in request.assigneeUserId
      ? (request.assigneeUserId as {
          _id: mongoose.Types.ObjectId;
          username?: string;
          email?: string;
        })
      : null;

  const requester =
    typeof request.requestedBy === "object" &&
    request.requestedBy !== null &&
    "_id" in request.requestedBy
      ? (request.requestedBy as {
          _id: mongoose.Types.ObjectId;
          username?: string;
          email?: string;
        })
      : null;

  return {
    id: String(request._id),
    status: request.status,
    message: request.message ?? "",
    createdAt: request.createdAt,
    completedAt: request.completedAt ?? null,
    assignee: assignee
      ? {
          id: String(assignee._id),
          username: assignee.username ?? null,
          email: assignee.email ?? null,
        }
      : { id: String(request.assigneeUserId), username: null, email: null },
    requestedBy: requester
      ? {
          id: String(requester._id),
          username: requester.username ?? null,
          email: requester.email ?? null,
        }
      : { id: String(request.requestedBy), username: null, email: null },
  };
};

const getApplicationContext = async (req: Request, res: Response) => {
  const userId = await getAuthUserId(req, res);
  if (!userId) return null;

  const organizationId = await getOrganizationIdFromUserId(userId, res);
  if (!organizationId) return null;

  const jobId = parseObjectId(req.params.jobId, "job id", res);
  if (!jobId) return null;

  const job = await JobsModel.findOne({
    ...(await getAccessibleJobFilterForUser(userId, organizationId)),
    _id: jobId,
  }).select("_id title");
  if (!job) {
    res.status(404).json({ success: false, message: "Job not found" });
    return null;
  }

  const applicationId = parseObjectId(
    req.params.applicationId,
    "application id",
    res,
  );
  if (!applicationId) return null;

  const assignment = await getAssignmentOr404(
    { applicationId, jobId, organizationId },
    res,
  );
  if (!assignment) return null;

  return {
    userId,
    organizationId,
    jobId,
    applicationId,
    candidateId: String(assignment.candidateId),
    jobTitle: job.title,
  };
};

const createReviewRequest = async (req: Request, res: Response) => {
  try {
    const context = await getApplicationContext(req, res);
    if (!context) return;

    const requesterRole = await resolveOrganizationMemberRole(
      context.userId,
      context.organizationId,
    );
    if (!requesterRole || !REVIEW_REQUESTER_ROLES.has(requesterRole)) {
      return res.status(403).json({
        success: false,
        message: "Only admins, recruiters, and hiring managers can request reviews",
      });
    }

    const parsedBody = createReviewRequestSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(parsedBody.error.issues),
      });
    }

    const { assigneeUserId, message } = parsedBody.data;
    if (!mongoose.isValidObjectId(assigneeUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigneeUserId",
      });
    }

    if (String(assigneeUserId) === String(context.userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot request a review from yourself",
      });
    }

    const assignee = await UserModel.findById(assigneeUserId).select(
      "_id username email",
    );
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: "Assignee user not found",
      });
    }

    const hiringTeamMember = await JobHiringTeamMemberModel.findOne({
      organizationId: context.organizationId,
      jobId: context.jobId,
      userId: assigneeUserId,
      role: { $in: [...REVIEW_ASSIGNEE_ROLES] },
    }).select("role");

    if (!hiringTeamMember) {
      return res.status(400).json({
        success: false,
        message:
          "Assignee must be a hiring manager or interviewer on this job's hiring team",
      });
    }

    const application = await ensureCandidateApplicationForAssignment({
      applicationId: context.applicationId,
      jobId: context.jobId,
      candidateId: context.candidateId,
      organizationId: context.organizationId,
    });

    const hasPending = (application.reviewRequests ?? []).some(
      (entry) =>
        String(entry.assigneeUserId) === String(assigneeUserId) &&
        entry.status === "pending",
    );

    if (hasPending) {
      return res.status(409).json({
        success: false,
        message: "A pending review request already exists for this reviewer",
      });
    }

    application.reviewRequests.push({
      assigneeUserId: new mongoose.Types.ObjectId(assigneeUserId),
      requestedBy: new mongoose.Types.ObjectId(context.userId),
      message: message ?? "",
      status: "pending",
      createdAt: new Date(),
    });

    await application.save();

    const populated = await CandidateApplicationModel.findById(application._id)
      .select("reviewRequests")
      .populate("reviewRequests.assigneeUserId", "username email")
      .populate("reviewRequests.requestedBy", "username email");

    const created = populated?.reviewRequests?.[populated.reviewRequests.length - 1];

    return res.status(201).json({
      success: true,
      message: "Review request created successfully",
      reviewRequest: created ? serializeReviewRequest(created) : null,
    });
  } catch (error) {
    logError("createReviewRequest", error);
    return sendError(res, 500, "Internal server error");
  }
};

const getReviewRequests = async (req: Request, res: Response) => {
  try {
    const context = await getApplicationContext(req, res);
    if (!context) return;

    const application = await findCandidateApplicationForAssignment({
      applicationId: context.applicationId,
      jobId: context.jobId,
      candidateId: context.candidateId,
      organizationId: context.organizationId,
    });
    if (application) {
      await application.populate("reviewRequests.assigneeUserId", "username email");
      await application.populate("reviewRequests.requestedBy", "username email");
    }

    const reviewRequests = (application?.reviewRequests ?? [])
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      )
      .map(serializeReviewRequest);

    return res.status(200).json({
      success: true,
      reviewRequests,
    });
  } catch (error) {
    logError("getReviewRequests", error);
    return sendError(res, 500, "Internal server error");
  }
};

export { createReviewRequest, getReviewRequests };
