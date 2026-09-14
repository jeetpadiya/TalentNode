import express from 'express';
import { getOrganizationAnalytics } from '../controllers/AnalyticsController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireOrganizationParam } from '../middleware/organizationContext.js';
import { requireOrganizationRoles } from '../middleware/organizationAuthorization.js';

const router = express.Router({ mergeParams: true });

// Protect with auth, organization context, and recruiting roles
const withOrgAuth = [
  authenticate,
  requireOrganizationParam('organizationId'),
  requireOrganizationRoles('admin', 'recruiter', 'hiring_manager'),
] as const;

// GET /api/organizations/:organizationId/analytics
router.get('/', ...withOrgAuth, getOrganizationAnalytics);

export default router;
