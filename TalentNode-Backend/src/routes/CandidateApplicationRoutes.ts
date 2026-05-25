import express from 'express';
import { createComment, getApplicationComments, editApplicationComment,DeleteApplicationComment } from '../controllers/applicationCommentsController.js';
import {CreatePrivateNote,GetPrivateNoteById} from '../controllers/applicationPrivateNoteController.js'
import {
  createReviewRequest,
  getReviewRequests,
} from '../controllers/applicationReviewController.js'
import { authenticate } from '../middleware/authenticate.js';
import { requireActiveOrganization } from '../middleware/organizationContext.js';
import { requireHiringTeamAccess } from '../middleware/organizationAuthorization.js';

const router = express.Router();

const hiringPipeline = [
  authenticate,
  requireActiveOrganization,
  requireHiringTeamAccess,
] as const;

router.post(
  '/:jobId/applications/:applicationId/comments',
  ...hiringPipeline,
  createComment,
);
router.get(
  '/:jobId/applications/:applicationId/comments',
  ...hiringPipeline,
  getApplicationComments,
);
router.put(
  '/:jobId/applications/:applicationId/comments/:commentId',
  ...hiringPipeline,
  editApplicationComment,
);
router.delete(
  '/:jobId/applications/:applicationId/comments/:commentId',
  ...hiringPipeline,
  DeleteApplicationComment,
);

router.get(
  '/:jobId/applications/:applicationId/private-note',
  ...hiringPipeline,
  GetPrivateNoteById,
);
router.post(
  '/:jobId/applications/:applicationId/private-note',
  ...hiringPipeline,
  CreatePrivateNote,
);

router.get(
  '/:jobId/applications/:applicationId/review-requests',
  ...hiringPipeline,
  getReviewRequests,
);
router.post(
  '/:jobId/applications/:applicationId/review-requests',
  ...hiringPipeline,
  createReviewRequest,
);


export default router;
