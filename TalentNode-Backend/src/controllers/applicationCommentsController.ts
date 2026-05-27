import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserModel from '../models/UserModel.js';
import JobsModel from '../models/JobsModel.js';
import JobCandidateAssignmentModel from '../models/JobCandidateAssignmentModel.js';
import { getParamValue } from '../utils/ParamValue.js';


import {
  getAuthUserId,
  getCandidateOr404,
  getOrganizationIdFromUserId,
  getAssignmentOr404,
  parseObjectId,
  getAccessibleJobFilterForUser,
  ensureCandidateApplicationForAssignment,
  findCandidateApplicationForAssignment,
} from './helpers/controllerUtils.js';



const createComment = async (req: Request, res: Response) => {

    try {

        const userId = await getAuthUserId(req, res);
        if (!userId) return;

        const organizationId = await getOrganizationIdFromUserId(userId, res);
        if (!organizationId) return;

        const jobId = parseObjectId(req.params.jobId, 'job id', res);
        if (!jobId) return;

        const job = await JobsModel.findOne({
          ...(await getAccessibleJobFilterForUser(userId, organizationId)),
          _id: jobId,
        });
        if (!job) {
          return res.status(404).json({ success: false, message: "Job not found" });
        }

        const applicationId = parseObjectId(
          req.params.applicationId,
          'application id',
          res
        );
        const { comment } = req.body;
        if (!applicationId || !comment) {
          return res.status(400).json({
            message: "Application ID and comment are required",
          });
        }

        const assignment = await getAssignmentOr404(
          {
            applicationId,
            jobId,
            organizationId,
          },
          res
        );
        if (!assignment) return;

        const candidateId = String(assignment.candidateId);
        const candidate = await getCandidateOr404({
          candidateId,
          organizationId,
        }, res);
        if (!candidate) return;


        const application = await ensureCandidateApplicationForAssignment({
            applicationId,
            jobId,
            candidateId,
            organizationId,
        });

        application.comments.push({
            text: comment,
            createdBy: new mongoose.Types.ObjectId(userId),
            createdAt: new Date(),
        });
        await application.save();

        return res.status(200).json({
            success: true,
            message: "Comment added successfully",
            application,
        })

    }
    catch (error) {
        console.error("Error fetching comments for job:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }

}

const getApplicationComments = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(userId);

    const organizationId = user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message:
          "User does not belong to any organization",
      });
    }

    const jobId = getParamValue(
      req.params.jobId
    );

    const applicationId = getParamValue(
      req.params.applicationId
    );

    // Validate Job ID
    if (
      !jobId ||
      !mongoose.Types.ObjectId.isValid(jobId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    // Validate Application ID
    if (
      !applicationId ||
      !mongoose.Types.ObjectId.isValid(
        applicationId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // Check Job Ownership
    const job = await JobsModel.findOne({
      ...(await getAccessibleJobFilterForUser(userId, String(organizationId))),
      _id: jobId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const assignment = await JobCandidateAssignmentModel.findOne({
      _id: applicationId,
      jobId,
      organizationId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Fetch ONLY this candidate application
    const application = await findCandidateApplicationForAssignment({
      applicationId,
      jobId,
      candidateId: assignment.candidateId,
      organizationId: String(organizationId),
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
        "Candidate application not found",
      });
    }

    await application.populate("candidateId", "name email");
    await application.populate("comments.createdBy", "username email");

    return res.status(200).json({
      success: true,
      message:
        "Comments fetched successfully",

      comments: application.comments,

      candidate: application.candidateId,
    });

  } catch (error) {
    console.error(
      "Error fetching comments:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const editApplicationComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(userId);

    const organizationId = user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization is required",
      });
    }

    const jobId = getParamValue(req.params.jobId);
    const applicationId = getParamValue(req.params.applicationId);
    const commentId = getParamValue(req.params.commentId);

    if (
      !jobId ||
      !applicationId ||
      !commentId ||
      !mongoose.isValidObjectId(jobId) ||
      !mongoose.isValidObjectId(applicationId) ||
      !mongoose.isValidObjectId(commentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ids",
      });
    }

    const safeJobId = jobId;
    const safeApplicationId = applicationId;
    const safeCommentId = commentId;

    const text = req.body.text ?? req.body.comment;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const job = await JobsModel.findOne({
      ...(await getAccessibleJobFilterForUser(userId, String(organizationId))),
      _id: safeJobId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const assignment = await JobCandidateAssignmentModel.findOne({
      _id: safeApplicationId,
      jobId: safeJobId,
      organizationId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const application = await findCandidateApplicationForAssignment({
      applicationId: safeApplicationId,
      jobId: safeJobId,
      candidateId: assignment.candidateId,
      organizationId: String(organizationId),
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const comment = application.comments.id(safeCommentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Optional ownership check
    if (String(comment.createdBy) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    comment.text = text.trim();

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error editing comment:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const DeleteApplicationComment = async (
  req: Request,
  res: Response
) => {
  try {

    const userId = req.user?.id;

    // Auth check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Params
    const jobId = getParamValue(
      req.params.jobId
    );

    const applicationId = getParamValue(
      req.params.applicationId
    );

    const commentId = getParamValue(
      req.params.commentId
    );

    // Validate required params
    if (
      !jobId ||
      !applicationId ||
      !commentId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required ids are missing",
      });
    }

    // Validate Mongo IDs
    if (
      !mongoose.Types.ObjectId.isValid(
        jobId
      ) ||
      !mongoose.Types.ObjectId.isValid(
        applicationId
      ) ||
      !mongoose.Types.ObjectId.isValid(
        commentId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ids",
      });
    }

    // Find user
    const user = await UserModel.findById(
      userId
    );

    const organizationId =
      user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message:
          "Organization is required",
      });
    }

    // Verify job
    const job = await JobsModel.findOne({
      ...(await getAccessibleJobFilterForUser(userId, String(organizationId))),
      _id: jobId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Find assignment
    const assignment =
      await JobCandidateAssignmentModel.findOne(
        {
          _id: applicationId,
          jobId,
          organizationId,
        }
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    // Find candidate application
    const application =
      await findCandidateApplicationForAssignment({
        applicationId,
        jobId,
        candidateId: assignment.candidateId,
        organizationId: String(organizationId),
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Candidate application not found",
      });
    }

    // Find comment
    const comment =
      application.comments.find(
        (comment) =>
          String(comment._id) ===
          String(commentId)
      );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Ownership check
    if (
      String(comment.createdBy) !==
      String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own comments",
      });
    }

    // Delete comment
    comment.deleteOne();

    // Save document
    await application.save();

    return res.status(200).json({
      success: true,
      message:
        "Comment deleted successfully",
    });

  } catch (error) {

    console.error(
      "Error deleting comment:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

export { createComment, getApplicationComments, editApplicationComment,DeleteApplicationComment };
