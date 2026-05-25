import express from 'express';
import {
    createCandidate,
    getCandidateById,
    getCandidates,
    updateCandidate,
} from '../controllers/CandidateController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireActiveOrganization } from '../middleware/organizationContext.js';

const router = express.Router();

const withOrg = [authenticate, requireActiveOrganization] as const;

router.post('/', ...withOrg, createCandidate);
router.get('/', ...withOrg, getCandidates);
router.get('/:id', ...withOrg, getCandidateById);
router.put('/:id', ...withOrg, updateCandidate);


export default router;
