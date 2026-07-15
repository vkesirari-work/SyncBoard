import { Router } from 'express'
import { getPublicSettings, getSettings, updateSettings } from '../controllers/settings.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const settingsRouter = Router()

settingsRouter.get('/public', getPublicSettings)
settingsRouter.get('/', requireAuth, requireRole('admin', 'user'), getSettings)
settingsRouter.patch('/', requireAuth, requireRole('admin', 'user'), updateSettings)
