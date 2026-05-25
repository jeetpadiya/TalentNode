import type { Request, Response } from 'express';

import UserModel from '../models/UserModel.js';
import JobsModel from '../models/JobsModel.js';
import OrganizationModel from '../models/OrganizationModel.js';
import OrganizationTeamMemberModel from '../models/OrganizationTeamMemberModel.js';
import JobHiringTeamMemberModel from '../models/JobHiringTeamMemberModel.js';

import { getAuthUserId, getOrganizationIdFromUserId, parseObjectId, getJobOr404 } from './helpers/controllerUtils.js';

type JobHiringTeamRole = 'recruiter' | 'hiring_manager' | 'interviewer';

const serializeUser = (user: any) => ({
  id: String(user?._id ?? user?.id),
  username: user?.username ?? null,
  email: user?.email ?? null,
  role: user?.role ?? null,
});

const serializeOrganizationMember = (member: any) => {
  const user = member.userId;

  return {
    id: String(user?._id ?? member.userId),
    username: user?.username ?? null,
    email: user?.email ?? null,
    role: member.role ?? null,
  };
};

const getJobHiringTeamRoleFromOrganizationRole = (
  role: unknown,
): JobHiringTeamRole | null => {
  if (
    role === 'recruiter' ||
    role === 'hiring_manager' ||
    role === 'interviewer'
  ) {
    return role;
  }

  return null;
};

const serializeAssignment = (assignment: any) => {
  const user = assignment.userId;

  return {
    id: String(assignment._id),
    role: assignment.role,
    user: user?._id
      ? {
          ...serializeUser(user),
          role: assignment.role,
        }
      : {
          id: String(assignment.userId),
          username: null,
          email: null,
          role: null,
        },
  };
};

const groupHiringTeam = (assignments: any[]) => ({
  recruiters: assignments
    .filter((assignment) => assignment.role === 'recruiter')
    .map(serializeAssignment),
  hiringManagers: assignments
    .filter((assignment) => assignment.role === 'hiring_manager')
    .map(serializeAssignment),
  interviewers: assignments
    .filter((assignment) => assignment.role === 'interviewer')
    .map(serializeAssignment),
});

const canManageHiringTeam = async (
  userId: string,
  organizationId: string,
  job: any,
) => {
  if (String(job.createdBy) === String(userId)) return true;

  const membership = await OrganizationTeamMemberModel.findOne({
    organizationId,
    userId,
    role: { $in: ['admin', 'recruiter'] },
  });

  return Boolean(membership);
};

const getHiringTeamForJob = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res);
    if (!userId) return;

    const organizationId = await getOrganizationIdFromUserId(userId, res);
    if (!organizationId) return;

    const jobId = parseObjectId(req.params.jobId, 'job id', res);
    if (!jobId) return;

    const job = await getJobOr404(jobId, organizationId, res);
    if (!job) return;

    if (!(await canManageHiringTeam(userId, organizationId, job))) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, recruiters, or the job creator can manage hiring team',
      });
    }

    const organization = await OrganizationModel.findOne({ _id: organizationId }).select('createdBy');
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    const [owner, assignments, organizationMembers] = await Promise.all([
      UserModel.findById(organization.createdBy).select('username email role'),
      JobHiringTeamMemberModel.find({ jobId, organizationId })
        .populate('userId', 'username email role')
        .sort({ createdAt: 1 })
        .lean(),
      OrganizationTeamMemberModel.find({ organizationId })
        .populate('userId', 'username email role')
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const assignedUserIds = new Set(
      assignments.map((assignment: any) => String(assignment.userId?._id ?? assignment.userId)),
    );

    return res.status(200).json({
      success: true,
      jobId: String(job._id),
      owner: owner
        ? {
            id: String(owner._id),
            username: (owner as any).username ?? null,
            email: (owner as any).email ?? null,
            role: owner.role ?? null,
          }
        : null,
      hiringTeam: groupHiringTeam(assignments),
      availableMembers: organizationMembers
        .filter((member: any) => {
          const memberUserId = member.userId?._id ?? member.userId;
          return (
            memberUserId &&
            getJobHiringTeamRoleFromOrganizationRole(member.role) &&
            !assignedUserIds.has(String(memberUserId))
          );
        })
        .map(serializeOrganizationMember),
    });
  } catch (error) {
    console.error('Error fetching hiring team:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addHiringTeamMemberForJob = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res);
    if (!userId) return;

    const organizationId = await getOrganizationIdFromUserId(userId, res);
    if (!organizationId) return;

    const jobId = parseObjectId(req.params.jobId, 'job id', res);
    if (!jobId) return;

    const memberUserId = parseObjectId(req.body?.userId, 'user id', res);
    if (!memberUserId) return;

    const job = await getJobOr404(jobId, organizationId, res);
    if (!job) return;

    if (!(await canManageHiringTeam(userId, organizationId, job))) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, recruiters, or the job creator can manage hiring team',
      });
    }

    const organizationMember = await OrganizationTeamMemberModel.findOne({
      organizationId,
      userId: memberUserId,
    });

    if (!organizationMember) {
      return res.status(400).json({
        success: false,
        message: 'User must be a member of this organization before adding to a job',
      });
    }

    const role = getJobHiringTeamRoleFromOrganizationRole(organizationMember.role);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Admins already have full job access and do not need job-level assignment',
      });
    }

    const assignment = await JobHiringTeamMemberModel.findOneAndUpdate(
      { jobId, userId: memberUserId },
      {
        $set: { role },
        $setOnInsert: {
          organizationId,
          jobId,
          userId: memberUserId,
        },
      },
      { upsert: true, new: true },
    ).populate('userId', 'username email role');

    return res.status(200).json({
      success: true,
      message: 'Hiring team member added successfully',
      member: serializeAssignment(assignment),
    });
  } catch (error) {
    console.error('Error adding hiring team member:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeHiringTeamMemberForJob = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res);
    if (!userId) return;

    const organizationId = await getOrganizationIdFromUserId(userId, res);
    if (!organizationId) return;

    const jobId = parseObjectId(req.params.jobId, 'job id', res);
    if (!jobId) return;

    const memberUserId = parseObjectId(req.params.userId, 'user id', res);
    if (!memberUserId) return;

    const job = await getJobOr404(jobId, organizationId, res);
    if (!job) return;

    if (!(await canManageHiringTeam(userId, organizationId, job))) {
      return res.status(403).json({
        success: false,
        message: 'Only admins, recruiters, or the job creator can manage hiring team',
      });
    }

    const deleted = await JobHiringTeamMemberModel.findOneAndDelete({
      organizationId,
      jobId,
      userId: memberUserId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Hiring team member not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hiring team member removed successfully',
    });
  } catch (error) {
    console.error('Error removing hiring team member:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export {
  addHiringTeamMemberForJob,
  getHiringTeamForJob,
  removeHiringTeamMemberForJob,
};
