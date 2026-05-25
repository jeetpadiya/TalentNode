import express from 'express';
import { getApplicationsByHiringStageForJob, moveApplicationToHiringStage } from '../controllers/JobCandidateAssignment.js';
import { getCandidatesForJob } from '../controllers/CandidateController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireActiveOrganization } from '../middleware/organizationContext.js';
import { requireOrganizationRoles } from '../middleware/organizationAuthorization.js';


const router = express.Router();

const withOrg = [authenticate, requireActiveOrganization] as const;

router.get('/:jobId/candidates', ...withOrg, getCandidatesForJob);
router.get('/:jobId/applications', ...withOrg, getApplicationsByHiringStageForJob);
router.patch(
  '/:jobId/applications/:applicationId/stage',
  ...withOrg,
  requireOrganizationRoles('admin', 'recruiter', 'hiring_manager'),
  moveApplicationToHiringStage,
);


export default router;
