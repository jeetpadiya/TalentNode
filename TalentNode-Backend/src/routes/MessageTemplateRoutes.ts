import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { requireOrganizationParam } from '../middleware/organizationContext.js'
import {
  createMessageTemplate,
  deleteMessageTemplate,
  listMessageTemplates,
  updateMessageTemplate,
} from '../controllers/messageTemplateController.js'

const router = express.Router({ mergeParams: true })

const withOrgMember = [authenticate, requireOrganizationParam()] as const;

router.get('/', ...withOrgMember, listMessageTemplates)
router.post('/', ...withOrgMember, createMessageTemplate)
router.put('/:id', ...withOrgMember, updateMessageTemplate)
router.delete('/:id', ...withOrgMember, deleteMessageTemplate)

export default router
