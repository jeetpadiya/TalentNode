import express from 'express'
import { authenticate } from '../middleware/authenticate.js'

import {
  getUserPreferences,
  updateUserPreferences,
} from '../controllers/userPreferencesController.js'


const router = express.Router()

router.get('/preferences', authenticate, getUserPreferences)
router.put('/preferences', authenticate, updateUserPreferences)

export default router

