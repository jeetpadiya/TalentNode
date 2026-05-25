import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import JobCategoryModel from '../models/JobCategoryModel.js'
import { requireOrganizationOnRequest } from './helpers/controllerUtils.js'

const DEFAULT_CATEGORIES = [
  'Sales & Marketing',
  'Design & User Experience',
  'Product Management',
  'Customer & Community',
  'Content & Copywriting',
  'Software Development',
  'Devops & Sysadmin',
  'Operations & Finance',
  'Quality Assurance',
  'HR & Recruiting',
  'Security'
];

const listJobCategories = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    let categories = await JobCategoryModel.find({ organizationId }).sort({ order: 1, createdAt: 1 })

    if (categories.length === 0) {
      const defaultDocs = DEFAULT_CATEGORIES.map((name, index) => ({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        name,
        order: index,
      }));
      categories = await JobCategoryModel.insertMany(defaultDocs);
    }

    return res.status(200).json({ categories })
  } catch (error) {
    console.error('listJobCategories error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const createJobCategory = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const body = req.body ?? {}

    const payload = {
      organizationId: new mongoose.Types.ObjectId(organizationId),
      name: typeof body.name === 'string' ? body.name.trim() : '',
      order: typeof body.order === 'number' ? body.order : 0,
    }

    if (!payload.name) {
      return res.status(400).json({ message: 'name is required' })
    }

    const created = await JobCategoryModel.create(payload)
    return res.status(201).json({ category: created })
  } catch (error) {
    console.error('createJobCategory error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateJobCategory = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const categoryId = req.params.id

    if (!categoryId) {
      return res.status(400).json({ message: 'id is required' })
    }

    const body = req.body ?? {}
    const updates: Partial<{ name: string; order: number }> = {}

    if (typeof body.name === 'string') updates.name = body.name.trim()
    if (typeof body.order === 'number') updates.order = body.order

    if (!updates.name && updates.order === undefined) {
      return res.status(400).json({ message: 'No valid fields to update' })
    }

    const updated = await JobCategoryModel.findOneAndUpdate(
      { _id: categoryId, organizationId },
      { $set: updates },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ message: 'Category not found' })
    }

    return res.status(200).json({ category: updated })
  } catch (error) {
    console.error('updateJobCategory error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteJobCategory = async (req: Request, res: Response) => {
  try {
    const organizationId = requireOrganizationOnRequest(req, res)
    if (!organizationId) return

    const categoryId = req.params.id

    if (!categoryId) {
      return res.status(400).json({ message: 'id is required' })
    }

    const deleted = await JobCategoryModel.findOneAndDelete({ _id: categoryId, organizationId })

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' })
    }

    return res.status(200).json({ message: 'Category deleted' })
  } catch (error) {
    console.error('deleteJobCategory error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export {
  listJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
}
