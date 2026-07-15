import { Router } from 'express'
import { createTrainingSession, deleteTrainingSession, listTrainingSessions, updateTrainingSession } from '../controllers/training-session.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

export const trainingSessionRouter = Router()

trainingSessionRouter.use(requireAuth)
trainingSessionRouter.get('/', requireRole('admin', 'user', 'trainer', 'member'), listTrainingSessions)
trainingSessionRouter.post('/', requireRole('admin', 'user'), createTrainingSession)
trainingSessionRouter.patch('/:id', requireRole('admin', 'user', 'trainer'), updateTrainingSession)
trainingSessionRouter.delete('/:id', requireRole('admin', 'user'), deleteTrainingSession)
