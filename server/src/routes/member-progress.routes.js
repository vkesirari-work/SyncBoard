import { Router } from 'express'
import { addMeasurement, addProgressPhoto, deleteMeasurement, deleteProgressPhoto, getMemberProgress, saveWorkoutPlan } from '../controllers/member-progress.controller.js'
import { requireAnyPermission, requireAuth } from '../middleware/auth.middleware.js'

export const memberProgressRouter = Router()

memberProgressRouter.use(requireAuth)
memberProgressRouter.get('/:memberId', requireAnyPermission(['members'], 'trainer', 'member'), getMemberProgress)
memberProgressRouter.post('/:memberId/measurements', requireAnyPermission(['members'], 'trainer'), addMeasurement)
memberProgressRouter.delete('/:memberId/measurements/:measurementId', requireAnyPermission(['members'], 'trainer'), deleteMeasurement)
memberProgressRouter.put('/:memberId/workout-plan', requireAnyPermission(['members'], 'trainer'), saveWorkoutPlan)
memberProgressRouter.post('/:memberId/photos', requireAnyPermission(['members'], 'trainer'), addProgressPhoto)
memberProgressRouter.delete('/:memberId/photos/:photoId', requireAnyPermission(['members'], 'trainer'), deleteProgressPhoto)
