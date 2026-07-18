import { Router } from 'express'
import { changePassword, getCurrentUser, login, register } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { authRateLimit } from '../middleware/rate-limit.middleware.js'

export const authRouter = Router()

authRouter.post('/register', authRateLimit, register)
authRouter.post('/login', authRateLimit, login)
authRouter.get('/me', requireAuth, getCurrentUser)
authRouter.patch('/change-password', requireAuth, changePassword)
