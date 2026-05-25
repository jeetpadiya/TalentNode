import { Request, Response } from 'express';
import CandidateModel from '../models/CandidateModel.js';
import CandidateApplicationModel from '../models/CandidateApplicationModel.js';
import JobCandidateAssignmentModel from '../models/JobCandidateAssignmentModel.js';
import {
  getAccessibleJobFilterForUser,
  getAuthUserId,
  getOrganizationIdFromUserId,
  parseObjectId,
  requireJobAssignedToInterviewerOr403,
} from './helpers/controllerUtils.js';


import type { IUserRole } from '../types/types.js';
import { logError, sendError } from '../utils/errorHandling.js';
import UserModel from '../models/UserModel.js';
import JobsModel from '../models/JobsModel.js';

const ALLOWED_ROLES: IUserRole[] = [
  'admin',
  'recruiter',
  'hiring_manager',
  'interviewer',
];

const resolveUserRoleFromDB = async (userId: string): Promise<IUserRole | null> => {
  const user = await UserModel.findById(userId).select('role');
  return (user?.role as IUserRole | undefined) ?? null;
};

const CreatePrivateNote = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res);
    if (!userId) return;

    // Role must be resolved from DB (do not trust JWT payload)
    const userRole = await resolveUserRoleFromDB(userId);
    if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }

    const organizationId = await getOrganizationIdFromUserId(userId, res);
    if (!organizationId) return;

    const jobId = parseObjectId(req.params.jobId, 'job id', res);
    if (!jobId) return;

    // validate job belongs to org
    const job = await JobsModel.findOne({
      ...(await getAccessibleJobFilterForUser(userId, organizationId)),
      _id: jobId,
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Interviewer must only access assigned interviews
    const ok = await requireJobAssignedToInterviewerOr403(req, res, {
      jobId,
      organizationId,
    });
    if (!ok) return;


    const applicationId = parseObjectId(req.params.applicationId, 'application id', res);
    if (!applicationId) return;

    const { privatenote } = req.body as { privatenote?: string };
    if (!privatenote) {
      return res
        .status(400)
        .json({ success: false, message: 'Application id and private note are requried' });
    }

    const assignment = await JobCandidateAssignmentModel.findOne({
      _id: applicationId,
      jobId,
      organizationId,
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const candidateId = String(assignment.candidateId);
    const candidate = await CandidateModel.findOne({ _id: candidateId, organizationId });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    const application = await CandidateApplicationModel.findOneAndUpdate(
      { jobId, candidateId, organizationId },
      {
        $push: {
          PrivateNote: {
            text: privatenote,
            createdBy: userId,
            createdAt: new Date(),
          },
        },
      },
      {
        new: true,
        upsert: false,
      },
    );

    // If the application document doesn't exist yet, treat it as an idempotent no-op
    // to avoid breaking business logic with a 404.
    if (!application) {
      return res.status(200).json({
        success: true,
        message: 'Private note added successfully',
        application: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Private note added successfully',
      application,
    });
  } catch (error) {
    logError('CreatePrivateNote', error);
    return sendError(res, 500, 'Internal server error');
  }
};

const GetPrivateNoteById = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res);
    if (!userId) return;

    // Role must be resolved from DB (do not trust JWT payload)
    const userRole = await resolveUserRoleFromDB(userId);
    if (!userRole || !ALLOWED_ROLES.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }

    const organizationId = await getOrganizationIdFromUserId(userId, res);
    if (!organizationId) return;

    const jobId = parseObjectId(req.params.jobId, 'job id', res);
    if (!jobId) return;

    const job = await JobsModel.findOne({
      ...(await getAccessibleJobFilterForUser(userId, organizationId)),
      _id: jobId,
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applicationId = parseObjectId(req.params.applicationId, 'application id', res);
    if (!applicationId) return;

    const assignment = await JobCandidateAssignmentModel.findOne({
      _id: applicationId,
      jobId,
      organizationId,
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const application = await CandidateApplicationModel.findOne({
      jobId,
      candidateId: assignment.candidateId,
      organizationId,
    })
      .populate('candidateId', 'name email')
      .populate('PrivateNote.createdBy', 'username email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Candidate application not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Priavte Note fetched successfully',
      privateNotes: application.PrivateNote ?? [],
      candidate: application.candidateId,
    });
  } catch (error) {
    logError('GetPrivateNoteById', error);
    return sendError(res, 500, 'Internal server error');
  }
};

export { CreatePrivateNote, GetPrivateNoteById };
