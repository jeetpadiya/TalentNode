import express from 'express';

import {
  getPublicJobs,
  getPublicJobById,
  submitPublicApplication,
} from '../controllers/publicController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// GET /api/public/organizations/:slug/jobs
router.get('/organizations/:slug/jobs', getPublicJobs);

// GET /api/public/jobs/:jobId
router.get('/jobs/:jobId', getPublicJobById);

// POST /api/public/jobs/:jobId/apply
router.post('/jobs/:jobId/apply', upload.single('resume'), submitPublicApplication);

export default router;

