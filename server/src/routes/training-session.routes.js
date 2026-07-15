import { Router } from 'express'
import { createTrainingSession, deleteTrainingSession, listTrainingSessions, updateTrainingSession } from '../controllers/training-session.controller.js'
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js'

export const trainingSessionRouter = Router()

trainingSessionRouter.use(requireAuth)
trainingSessionRouter.get('/', requirePermission('sessions', 'trainer', 'member'), listTrainingSessions)
trainingSessionRouter.post('/', requirePermission('sessions'), createTrainingSession)
trainingSessionRouter.patch('/:id', requirePermission('sessions', 'trainer'), updateTrainingSession)
trainingSessionRouter.delete('/:id', requirePermission('sessions'), deleteTrainingSession)
