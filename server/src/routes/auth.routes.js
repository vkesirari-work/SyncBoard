import { Router } from 'express'
import { changePassword, getCurrentUser, login, register } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', requireAuth, getCurrentUser)
authRouter.patch('/change-password', requireAuth, changePassword)
