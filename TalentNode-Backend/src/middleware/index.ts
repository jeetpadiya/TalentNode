/**
 * Request pipeline layers:
 * 1. authenticate — JWT identity (req.user)
 * 2. requireActiveOrganization | requireOrganizationParam — org scope (req.organization)
 * 3. requireOrganizationRoles / requireRecruitingAccess / … — permission checks
 *
 * Pure role logic lives in `src/authorization/`.
 */
export { authenticate, authenticateToken } from "./authenticate.js";
export {
  requireActiveOrganization,
  requireOrganizationParam,
  resolveActiveOrganizationContext,
} from "./organizationContext.js";
export {
  requireHiringTeamAccess,
  requireOrganizationAdmin,
  requireOrganizationRoles,
  requireRecruitingAccess,
} from "./organizationAuthorization.js";
