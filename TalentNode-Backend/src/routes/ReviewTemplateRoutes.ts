import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { requireOrganizationParam } from '../middleware/organizationContext.js'
import {
  createReviewTemplate,
  deleteReviewTemplate,
  listReviewTemplates,
  updateReviewTemplate,
} from '../controllers/reviewTemplateController.js'

const router = express.Router({ mergeParams: true })

const withOrgMember = [authenticate, requireOrganizationParam()] as const;

router.get('/', ...withOrgMember, listReviewTemplates)
router.post('/', ...withOrgMember, createReviewTemplate)
router.put('/:id', ...withOrgMember, updateReviewTemplate)
router.delete('/:id', ...withOrgMember, deleteReviewTemplate)

export default router
