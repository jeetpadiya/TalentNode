import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import MessageTemplateModel from '../models/MessageTemplateModel.js'
import { requireOrganizationOnRequest } from './helpers/controllerUtils.js'

const listMessageTemplates = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const templates = await MessageTemplateModel.find({ organizationId }).sort({ createdAt: -1 })
    return res.status(200).json({ templates })
  } catch (error) {
    console.error('listMessageTemplates error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const createMessageTemplate = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const body = req.body ?? {}

    const payload = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      title: typeof body.title === 'string' ? body.title.trim() : '',
      subject: typeof body.subject === 'string' ? body.subject.trim() : '',
      body: typeof body.body === 'string' ? body.body : '',
    }

    if (!payload.title || !payload.subject || !payload.body) {
      return res.status(400).json({ message: 'title, subject, and body are required' })
    }

    const created = await MessageTemplateModel.create(payload)
    return res.status(201).json({ template: created })
  } catch (error) {
    console.error('createMessageTemplate error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateMessageTemplate = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const templateId = req.params.id

    if (!templateId) {
      return res.status(400).json({ message: 'id is required' })
    }

    const body = req.body ?? {}

    const updates: Partial<{ title: string; subject: string; body: string }> = {}
    if (typeof body.title === 'string') updates.title = body.title.trim()
    if (typeof body.subject === 'string') updates.subject = body.subject.trim()
    if (typeof body.body === 'string') updates.body = body.body

    if (!updates.title && !updates.subject && !updates.body) {
      return res.status(400).json({ message: 'No valid fields to update' })
    }

    const updated = await MessageTemplateModel.findOneAndUpdate(
      { _id: templateId, organizationId },
      { $set: updates },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ message: 'Template not found' })
    }

    return res.status(200).json({ template: updated })
  } catch (error) {
    console.error('updateMessageTemplate error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteMessageTemplate = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const templateId = req.params.id

    if (!templateId) {
      return res.status(400).json({ message: 'id is required' })
    }

    const deleted = await MessageTemplateModel.findOneAndDelete({ _id: templateId, organizationId })

    if (!deleted) {
      return res.status(404).json({ message: 'Template not found' })
    }

    return res.status(200).json({ message: 'Template deleted' })
  } catch (error) {
    console.error('deleteMessageTemplate error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export {
  listMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate,
}
