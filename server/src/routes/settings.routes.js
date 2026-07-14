import { Router } from 'express'
import { getPublicSettings, getSettings, updateSettings } from '../controllers/settings.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const settingsRouter = Router()

settingsRouter.get('/public', getPublicSettings)
settingsRouter.get('/', requireAuth, getSettings)
settingsRouter.patch('/', requireAuth, updateSettings)
