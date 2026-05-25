import type { Request, Response } from 'express'
import UserPreferencesModel from '../models/UserPreferencesModel.js'


const DEFAULT_PREFERENCES = {
  newCandidateApplication: false,
  newCommentOrReview: false,
  newMessageFromCandidate: false,
}

const getUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const prefs = await UserPreferencesModel.findOne({ userId: req.user.id })

    if (!prefs) {
      return res.status(200).json(DEFAULT_PREFERENCES)
    }

    return res.status(200).json({
      newCandidateApplication: prefs.newCandidateApplication,
      newCommentOrReview: prefs.newCommentOrReview,
      newMessageFromCandidate: prefs.newMessageFromCandidate,
    })
  } catch (error) {
    console.error('getUserPreferences error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const body = req.body ?? {}

    const payload = {
      newCandidateApplication:
        typeof body.newCandidateApplication === 'boolean'
          ? body.newCandidateApplication
          : DEFAULT_PREFERENCES.newCandidateApplication,
      newCommentOrReview:
        typeof body.newCommentOrReview === 'boolean'
          ? body.newCommentOrReview
          : DEFAULT_PREFERENCES.newCommentOrReview,
      newMessageFromCandidate:
        typeof body.newMessageFromCandidate === 'boolean'
          ? body.newMessageFromCandidate
          : DEFAULT_PREFERENCES.newMessageFromCandidate,
    }

    const updated = await UserPreferencesModel.findOneAndUpdate(
      { userId: req.user.id },
      { $set: payload },
      { upsert: true, new: true },
    )

    return res.status(200).json({
      newCandidateApplication: updated?.newCandidateApplication ?? false,
      newCommentOrReview: updated?.newCommentOrReview ?? false,
      newMessageFromCandidate: updated?.newMessageFromCandidate ?? false,
    })
  } catch (error) {
    console.error('updateUserPreferences error:', error)
    return res.status(500).json({ message: 'Server error' })
  }
}

export { getUserPreferences, updateUserPreferences }

