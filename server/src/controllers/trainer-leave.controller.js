import { Trainer } from '../models/trainer.model.js'
import { TrainerLeave } from '../models/trainer-leave.model.js'
import { TrainingSession } from '../models/training-session.model.js'

export async function listTrainerLeaves(request, response, next) {
  try {
    const filter = request.user.role === 'trainer' ? { trainer: request.user.trainerProfile } : {}
    if (request.query.status && request.query.status !== 'all') filter.status = request.query.status
    const leaves = await TrainerLeave.find(filter).populate('trainer', 'name phone email shift').sort({ startDate: -1 })
    response.json({ leaves })
  } catch (error) { next(error) }
}

export async function createTrainerLeave(request, response, next) {
  try {
    const trainerId = request.user.role === 'trainer' ? request.user.trainerProfile : request.body.trainer
    const { startDate, endDate, reason } = request.body
    if (!trainerId || !startDate || !endDate || !reason?.trim()) return response.status(400).json({ message: 'Trainer, start date, end date, and reason are required' })
    const start = new Date(`${startDate}T00:00:00.000+05:30`)
    const end = new Date(`${endDate}T23:59:59.999+05:30`)
    if (end < start) return response.status(400).json({ message: 'End date cannot be before start date' })
    const trainer = await Trainer.findById(trainerId)
    if (!trainer) return response.status(400).json({ message: 'Select a valid trainer' })
    const overlap = await TrainerLeave.findOne({ trainer: trainerId, status: { $in: ['pending', 'approved'] }, startDate: { $lte: end }, endDate: { $gte: start } })
    if (overlap) return response.status(409).json({ message: 'A pending or approved leave already covers these dates' })
    const status = request.user.role === 'trainer' ? 'pending' : ['pending', 'approved'].includes(request.body.status) ? request.body.status : 'approved'
    if (status === 'approved') {
      const sessionCount = await TrainingSession.countDocuments({ trainer: trainerId, status: 'scheduled', scheduledAt: { $gte: start, $lte: end } })
      if (sessionCount) return response.status(409).json({ message: `${sessionCount} scheduled session${sessionCount === 1 ? '' : 's'} must be rescheduled or cancelled before approving this leave` })
    }
    const leave = await TrainerLeave.create({ trainer: trainerId, startDate: start, endDate: end, reason: reason.trim(), status, adminNote: request.body.adminNote || '' })
    await leave.populate('trainer', 'name phone email shift')
    request.app.get('io')?.emit('trainer-leave:created', leave)
    response.status(201).json({ leave })
  } catch (error) { next(error) }
}

export async function reviewTrainerLeave(request, response, next) {
  try {
    const leave = await TrainerLeave.findById(request.params.id)
    if (!leave) return response.status(404).json({ message: 'Leave request not found' })
    if (!['approved', 'rejected', 'pending'].includes(request.body.status)) return response.status(400).json({ message: 'Select a valid leave status' })
    if (request.body.status === 'approved') {
      const sessionCount = await TrainingSession.countDocuments({ trainer: leave.trainer, status: 'scheduled', scheduledAt: { $gte: leave.startDate, $lte: leave.endDate } })
      if (sessionCount) return response.status(409).json({ message: `${sessionCount} scheduled session${sessionCount === 1 ? '' : 's'} must be rescheduled or cancelled before approving this leave` })
    }
    leave.status = request.body.status
    leave.adminNote = request.body.adminNote ?? leave.adminNote
    await leave.save(); await leave.populate('trainer', 'name phone email shift')
    request.app.get('io')?.emit('trainer-leave:updated', leave)
    response.json({ leave })
  } catch (error) { next(error) }
}

export async function deleteTrainerLeave(request, response, next) {
  try {
    const leave = await TrainerLeave.findById(request.params.id)
    if (!leave) return response.status(404).json({ message: 'Leave request not found' })
    if (request.user.role === 'trainer') {
      if (!leave.trainer.equals(request.user.trainerProfile)) return response.status(403).json({ message: 'This leave request is not yours' })
      if (leave.status !== 'pending') return response.status(409).json({ message: 'Only pending leave requests can be cancelled' })
    }
    await leave.deleteOne()
    request.app.get('io')?.emit('trainer-leave:deleted', { id: leave.id })
    response.status(204).end()
  } catch (error) { next(error) }
}
