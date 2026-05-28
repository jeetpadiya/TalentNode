import express from "express";
import {
  createOrganization,
  getOrganizationById,
  getOrganizations,
  updateOrganization,
} from "../controllers/OrganizationController.js";

import { authenticate } from "../middleware/authenticate.js";
import { requireActiveOrganization } from "../middleware/organizationContext.js";
import { requireOrganizationAdmin } from "../middleware/organizationAuthorization.js";
import {
  acceptOrganizationInvite,
  deactivateTeamMember,
  getOrganizationInviteByToken,
  getTeamMembersForOrganization,
  inviteTeamMemberToOrganization,
  revokeOrganizationInvite,
} from "../controllers/OrganizationTeamController.js";

const router = express.Router();

router.post("/", authenticate, createOrganization);
router.get("/", authenticate, getOrganizations);
router.get("/invites/:token", getOrganizationInviteByToken);
router.post("/invites/:token/accept", authenticate, acceptOrganizationInvite);
// Organization-wise team members (scoped to current user's organization)
router.get(
  "/team",
  authenticate,
  requireActiveOrganization,
  requireOrganizationAdmin,
  getTeamMembersForOrganization,
);
router.delete(
  "/team/:userId",
  authenticate,
  requireActiveOrganization,
  requireOrganizationAdmin,
  deactivateTeamMember,
);
router.post(
  "/team/invites",
  authenticate,
  requireActiveOrganization,
  requireOrganizationAdmin,
  inviteTeamMemberToOrganization,
);
router.post(
  "/team/invites/:inviteId/revoke",
  authenticate,
  requireActiveOrganization,
  requireOrganizationAdmin,
  revokeOrganizationInvite,
);

router.get("/:id", authenticate, getOrganizationById);
router.put("/:id", authenticate, requireActiveOrganization, requireOrganizationAdmin, updateOrganization);


export default router;
