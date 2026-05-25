import OrganizationModel from "../models/OrganizationModel.js";
import OrganizationTeamMemberModel from "../models/OrganizationTeamMemberModel.js";
import JobHiringTeamMemberModel from "../models/JobHiringTeamMemberModel.js";
import type { OrganizationMemberRole } from "./types.js";

export const ORGANIZATION_MEMBER_ROLES: OrganizationMemberRole[] = [
  "admin",
  "recruiter",
  "hiring_manager",
  "interviewer",
];

export const isOrganizationMemberRole = (
  value: string,
): value is OrganizationMemberRole =>
  ORGANIZATION_MEMBER_ROLES.includes(value as OrganizationMemberRole);

/**
 * Resolves the user's role in an organization from team membership (or org ownership).
 * Does not use User.role — that field tracks account/invite state, not request authorization.
 */
export const resolveOrganizationMemberRole = async (
  userId: string,
  organizationId: string,
): Promise<OrganizationMemberRole | null> => {
  const membership = await OrganizationTeamMemberModel.findOne({
    userId,
    organizationId,
  }).select("role");

  if (membership?.role && isOrganizationMemberRole(membership.role)) {
    return membership.role;
  }

  const ownsOrganization = await OrganizationModel.exists({
    _id: organizationId,
    createdBy: userId,
  });

  return ownsOrganization ? "admin" : null;
};

export const isOrganizationMember = async (
  userId: string,
  organizationId: string,
): Promise<boolean> =>
  (await resolveOrganizationMemberRole(userId, organizationId)) !== null;

export const isOrganizationAdmin = async (
  userId: string,
  organizationId: string,
): Promise<boolean> =>
  (await resolveOrganizationMemberRole(userId, organizationId)) === "admin";

export const roleHasAny = (
  role: OrganizationMemberRole,
  allowed: OrganizationMemberRole[],
): boolean => allowed.includes(role);

export const canManageRecruitingData = (role: OrganizationMemberRole): boolean =>
  role === "admin" || role === "recruiter";

export const getAccessibleJobFilterForUser = async (
  userId: string,
  organizationId: string,
) => {
  const role = await resolveOrganizationMemberRole(userId, organizationId);

  if (role === "admin" || role === "recruiter") {
    return { organizationId };
  }

  if (role === "hiring_manager" || role === "interviewer") {
    const assignments = await JobHiringTeamMemberModel.find({
      organizationId,
      userId,
      role,
    }).select("jobId");

    const assignedJobIds = assignments.map((assignment) => assignment.jobId);

    return {
      organizationId,
      $or: [
        { _id: { $in: assignedJobIds } },
        { hiringManagerId: userId },
        { createdBy: userId },
      ],
    };
  }

  return {
    organizationId,
    _id: { $in: [] },
  };
};
