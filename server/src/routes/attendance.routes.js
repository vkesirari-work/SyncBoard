import { Router } from 'express'
import {
  checkIn,
  checkOut,
  deleteAttendance,
  listAttendance,
  updateAttendance,
} from '../controllers/attendance.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const attendanceRouter = Router()

attendanceRouter.use(requireAuth)
attendanceRouter.get('/', listAttendance)
attendanceRouter.post('/check-in', checkIn)
attendanceRouter.patch('/:id/check-out', checkOut)
attendanceRouter.patch('/:id', updateAttendance)
attendanceRouter.delete('/:id', deleteAttendance)
