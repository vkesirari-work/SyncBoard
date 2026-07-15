import { Router } from 'express'
import { getPublicSettings, getSettings, updateSettings } from '../controllers/settings.controller.js'
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js'

export const settingsRouter = Router()

settingsRouter.get('/public', getPublicSettings)
settingsRouter.get('/', requireAuth, requirePermission('settings'), getSettings)
settingsRouter.patch('/', requireAuth, requirePermission('settings'), updateSettings)
