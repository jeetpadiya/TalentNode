import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { requireOrganizationParam } from '../middleware/organizationContext.js'
import {
  createJobCategory,
  deleteJobCategory,
  listJobCategories,
  updateJobCategory,
} from '../controllers/jobCategoryController.js'

const router = express.Router({ mergeParams: true })

const withOrgMember = [authenticate, requireOrganizationParam()] as const;

router.get('/', ...withOrgMember, listJobCategories)
router.post('/', ...withOrgMember, createJobCategory)
router.put('/:id', ...withOrgMember, updateJobCategory)
router.delete('/:id', ...withOrgMember, deleteJobCategory)

export default router
