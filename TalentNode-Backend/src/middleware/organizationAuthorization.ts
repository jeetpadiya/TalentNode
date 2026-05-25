import type { NextFunction, Request, Response } from "express";
import { roleHasAny } from "../authorization/organizationAccess.js";
import type { OrganizationMemberRole } from "../authorization/types.js";
import { resolveActiveOrganizationContext } from "./organizationContext.js";

const unauthorized = (res: Response) =>
  res.status(401).json({ success: false, message: "Unauthorized" });

const forbidden = (res: Response) =>
  res
    .status(403)
    .json({ success: false, message: "Forbidden: insufficient role" });

/**
 * Authorization: requires the user to have one of the given organization roles.
 * Resolves active organization context first when not already on the request.
 */
export const requireOrganizationRoles = (
  ...allowedRoles: OrganizationMemberRole[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.organization) {
        const userId = req.user?.id;
        if (!userId) return unauthorized(res);

        const result = await resolveActiveOrganizationContext(userId);
        if (!result.ok) {
          return res
            .status(result.status)
            .json({ success: false, message: result.message });
        }
        req.organization = result.context;
      }

      const role = req.organization.role;
      if (!roleHasAny(role, allowedRoles)) {
        return forbidden(res);
      }

      return next();
    } catch {
      return unauthorized(res);
    }
  };
};

/** Authorization: organization admin only. */
export const requireOrganizationAdmin = requireOrganizationRoles("admin");

/** Authorization: admins and recruiters (create jobs, stages, etc.). */
export const requireRecruitingAccess = requireOrganizationRoles(
  "admin",
  "recruiter",
);

/** Hiring pipeline access: all workforce roles except candidates. */
export const requireHiringTeamAccess = requireOrganizationRoles(
  "admin",
  "recruiter",
  "hiring_manager",
  "interviewer",
);
