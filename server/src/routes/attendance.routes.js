import { Router } from 'express'
import {
  checkIn,
  checkOut,
  deleteAttendance,
  listAttendance,
  updateAttendance,
} from '../controllers/attendance.controller.js'
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js'

export const attendanceRouter = Router()

attendanceRouter.use(requireAuth)
attendanceRouter.get('/', requirePermission('attendance'), listAttendance)
attendanceRouter.post('/check-in', requirePermission('attendance'), checkIn)
attendanceRouter.patch('/:id/check-out', requirePermission('attendance'), checkOut)
attendanceRouter.patch('/:id', requirePermission('attendance'), updateAttendance)
attendanceRouter.delete('/:id', requirePermission('attendance'), deleteAttendance)
