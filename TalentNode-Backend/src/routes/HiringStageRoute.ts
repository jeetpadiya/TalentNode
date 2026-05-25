import express from 'express';
import { createHiringStage, deleteHiringStage, getHiringStages, updateHiringStage ,saveHiringPipeline} from '../controllers/HiringStageController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireActiveOrganization } from '../middleware/organizationContext.js';

const router = express.Router();

const withOrg = [authenticate, requireActiveOrganization] as const;

router.post('/:jobId/hiring-stages', ...withOrg, createHiringStage);

router.get('/:jobId/hiring-stages', ...withOrg, getHiringStages);

router.put('/:jobId/hiring-stages/:stageId', ...withOrg, updateHiringStage);

router.delete('/:jobId/hiring-stages/:stageId', ...withOrg, deleteHiringStage);

router.put(
  '/:jobId/hiring-pipeline',
  ...withOrg,
  saveHiringPipeline
);

export default router;
