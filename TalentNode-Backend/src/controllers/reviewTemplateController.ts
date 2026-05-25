import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import ReviewTemplateModel from '../models/ReviewTemplateModel.js'
import { requireOrganizationOnRequest } from './helpers/controllerUtils.js'

const DEFAULT_REVIEW_TEMPLATE = {
  name: 'Initial Interview Template',
  template: `
## Candidate Review: [Candidate Name]

### General Impression (1-5):

### Strengths:

### Areas for Improvement:

### Specific Questions & Answers:
- Q1: 
- A1: 
- Q2: 
- A2: 

### Overall Recommendation:

### Next Steps:
`.trim(),
}

const listReviewTemplates = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    let templates = await ReviewTemplateModel.find({ organizationId }).sort({ createdAt: -1 })

    if (templates.length === 0) {
      const defaultCreated = await ReviewTemplateModel.create({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        name: DEFAULT_REVIEW_TEMPLATE.name,
        template: DEFAULT_REVIEW_TEMPLATE.template,
      })
      templates = [defaultCreated]
    }

    return res.status(200).json({ templates })
  } catch (error) {
    console.error('listReviewTemplates error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const createReviewTemplate = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const body = req.body ?? {}

    const payload = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: typeof body.name === 'string' ? body.name.trim() : '',
      template: typeof body.template === 'string' ? body.template : '',
    }

    if (!payload.name || !payload.template) {
      return res.status(400).json({ message: 'name and template are required' })
    }

    const created = await ReviewTemplateModel.create(payload)
    return res.status(201).json({ template: created })
  } catch (error) {
    console.error('createReviewTemplate error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateReviewTemplate = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const templateId = req.params.id

    if (!templateId) {
      return res.status(400).json({ message: 'id is required' })
    }

    const body = req.body ?? {}
    const updates: Partial<{ name: string; template: string }> = {}

    if (typeof body.name === 'string') updates.name = body.name.trim()
    if (typeof body.template === 'string') updates.template = body.template

    if (!updates.name && !updates.template) {
      return res.status(400).json({ message: 'No valid fields to update' })
    }

    const updated = await ReviewTemplateModel.findOneAndUpdate(
      { _id: templateId, organizationId },
      { $set: updates },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ message: 'Template not found' })
    }

    return res.status(200).json({ template: updated })
  } catch (error) {
    console.error('updateReviewTemplate error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteReviewTemplate = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const templateId = req.params.id

    if (!templateId) {
      return res.status(400).json({ message: 'id is required' })
    }

    const deleted = await ReviewTemplateModel.findOneAndDelete({ _id: templateId, organizationId })

    if (!deleted) {
      return res.status(404).json({ message: 'Template not found' })
    }

    return res.status(200).json({ message: 'Template deleted' })
  } catch (error) {
    console.error('deleteReviewTemplate error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export {
  listReviewTemplates,
  createReviewTemplate,
  updateReviewTemplate,
  deleteReviewTemplate,
}
