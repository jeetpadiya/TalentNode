import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import UserModel from "../models/UserModel.js";
import {
  resolveOrganizationMemberRole,
} from "../authorization/organizationAccess.js";
import type { OrganizationAuthContext } from "../authorization/types.js";

const unauthorized = (res: Response) =>
  res.status(401).json({ success: false, message: "Unauthorized" });

const forbidden = (res: Response, message = "Forbidden") =>
  res.status(403).json({ success: false, message });

export type OrganizationContextResult =
  | { ok: true; context: OrganizationAuthContext }
  | { ok: false; status: number; message: string };

/** Resolves active org + workforce role without sending a response. */
export const resolveActiveOrganizationContext = async (
  userId: string,
): Promise<OrganizationContextResult> => {
  const user = await UserModel.findById(userId).select("organizationId");
  if (!user?.organizationId) {
    return {
      ok: false,
      status: 400,
      message: "Organization is required",
    };
  }

  const organizationId = String(user.organizationId);
  const role = await resolveOrganizationMemberRole(userId, organizationId);

  if (!role) {
    return {
      ok: false,
      status: 403,
      message: "Forbidden: not a member of this organization",
    };
  }

  return { ok: true, context: { organizationId, role } };
};

/**
 * Organization context: resolves the user's active organization (User.organizationId)
 * and their workforce role from team membership. Sets `req.organization`.
 */
export const requireActiveOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return unauthorized(res);

    const result = await resolveActiveOrganizationContext(userId);
    if (!result.ok) {
      return res
        .status(result.status)
        .json({ success: false, message: result.message });
    }

    req.organization = result.context;
    return next();
  } catch {
    return unauthorized(res);
  }
};

/**
 * Organization context from a route param (e.g. `:organizationId`).
 * Verifies membership in that org, not only the user's active org.
 */
export const requireOrganizationParam = (
  paramName = "organizationId",
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return unauthorized(res);

      const raw = req.params[paramName];
      const organizationId = Array.isArray(raw) ? raw[0] : raw;

      if (!organizationId || !mongoose.isValidObjectId(organizationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid organization",
        });
      }

      const role = await resolveOrganizationMemberRole(userId, organizationId);

      if (!role) {
        return forbidden(res, "Forbidden: not a member of this organization");
      }

      req.organization = { organizationId: String(organizationId), role };
      return next();
    } catch {
      return unauthorized(res);
    }
  };
};
