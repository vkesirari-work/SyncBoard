import { Member } from '../models/member.model.js'
import { Trainer } from '../models/trainer.model.js'
import { TrainingSession } from '../models/training-session.model.js'
import { trainerAvailabilityError } from '../utils/trainer-availability.js'
import { emitDashboardUpdate } from '../realtime/socket.js'

const populateSession = [
  { path: 'member', select: 'name phone email status membershipEnd' },
  { path: 'trainer', select: 'name phone email shift specialties isActive' },
]

async function scopedFilter(user) {
  if (user.role === 'trainer') return { trainer: user.trainerProfile }
  if (user.role === 'member') return { member: user.memberProfile }
  return {}
}

async function findConflict({ trainer, member, scheduledAt, durationMinutes, excludeId }) {
  const start = new Date(scheduledAt)
  const end = new Date(start.getTime() + durationMinutes * 60000)
  const common = {
    status: 'scheduled',
    scheduledAt: { $lt: end },
    $expr: { $gt: [{ $add: ['$scheduledAt', { $multiply: ['$durationMinutes', 60000] }] }, start] },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }
  const [trainerConflict, memberConflict] = await Promise.all([
    TrainingSession.findOne({ ...common, trainer }),
    TrainingSession.findOne({ ...common, member }),
  ])
  if (trainerConflict) return 'Trainer already has another session during this time'
  if (memberConflict) return 'Member already has another session during this time'
  return null
}

export async function listTrainingSessions(request, response, next) {
  try {
    const filter = await scopedFilter(request.user)
    if (request.query.status && request.query.status !== 'all') filter.status = request.query.status
    if (request.query.from || request.query.to) {
      filter.scheduledAt = {}
      if (request.query.from) filter.scheduledAt.$gte = new Date(request.query.from)
      if (request.query.to) filter.scheduledAt.$lte = new Date(request.query.to)
    }
    const sessions = await TrainingSession.find(filter)
      .select(['admin', 'user'].includes(request.user.role) ? '' : '-adminNotes')
      .populate(populateSession)
      .sort({ scheduledAt: 1 })
    response.json({ sessions })
  } catch (error) { next(error) }
}

export async function createTrainingSession(request, response, next) {
  try {
    const { member, trainer, scheduledAt, durationMinutes = 60 } = request.body
    if (!member || !trainer || !scheduledAt) return response.status(400).json({ message: 'Member, trainer, and session time are required' })
    const [memberRecord, trainerRecord] = await Promise.all([Member.findById(member), Trainer.findById(trainer)])
    if (!memberRecord) return response.status(400).json({ message: 'Select a valid member' })
    if (!trainerRecord?.isActive) return response.status(400).json({ message: 'Select an active trainer' })
    if (!trainerRecord.assignedMembers.some((id) => id.equals(memberRecord._id))) {
      return response.status(400).json({ message: 'Assign this member to the trainer before booking a session' })
    }
    const availabilityError = await trainerAvailabilityError(trainerRecord, scheduledAt, Number(durationMinutes))
    if (availabilityError) return response.status(409).json({ message: availabilityError })
    const conflict = await findConflict({ member, trainer, scheduledAt, durationMinutes: Number(durationMinutes) })
    if (conflict) return response.status(409).json({ message: conflict })
    const session = await TrainingSession.create({
      member,
      trainer,
      scheduledAt,
      durationMinutes: Number(durationMinutes),
      focus: request.body.focus || '',
      adminNotes: request.body.adminNotes || '',
      status: 'scheduled',
    })
    await session.populate(populateSession)
    emitDashboardUpdate(request, 'training-session:created', session)
    response.status(201).json({ session })
  } catch (error) { next(error) }
}

export async function updateTrainingSession(request, response, next) {
  try {
    const session = await TrainingSession.findById(request.params.id)
    if (!session) return response.status(404).json({ message: 'Training session not found' })
    if (request.user.role === 'trainer') {
      if (!session.trainer.equals(request.user.trainerProfile)) return response.status(403).json({ message: 'This session is not assigned to you' })
      const allowedStatuses = ['completed', 'no_show']
      if (request.body.status && !allowedStatuses.includes(request.body.status)) return response.status(403).json({ message: 'Trainer cannot cancel this session' })
      if (request.body.status && session.status !== 'scheduled') return response.status(409).json({ message: 'Only scheduled sessions can be completed or marked no show' })
      session.status = request.body.status || session.status
      session.trainerNotes = request.body.trainerNotes ?? session.trainerNotes
    } else {
      const updates = Object.fromEntries(Object.entries(request.body).filter(([key]) => ['member', 'trainer', 'scheduledAt', 'durationMinutes', 'status', 'focus', 'adminNotes', 'trainerNotes'].includes(key)))
      const nextTrainer = updates.trainer || session.trainer
      const nextMember = updates.member || session.member
      const nextTime = updates.scheduledAt || session.scheduledAt
      const nextDuration = Number(updates.durationMinutes || session.durationMinutes)
      if ((updates.status || session.status) === 'scheduled') {
        const [memberRecord, trainerRecord] = await Promise.all([Member.findById(nextMember), Trainer.findById(nextTrainer)])
        if (!memberRecord) return response.status(400).json({ message: 'Select a valid member' })
        if (!trainerRecord?.isActive) return response.status(400).json({ message: 'Select an active trainer' })
        if (!trainerRecord.assignedMembers.some((id) => id.equals(memberRecord._id))) return response.status(400).json({ message: 'Assign this member to the trainer before booking a session' })
        const availabilityError = await trainerAvailabilityError(trainerRecord, nextTime, nextDuration)
        if (availabilityError) return response.status(409).json({ message: availabilityError })
        const conflict = await findConflict({ trainer: nextTrainer, member: nextMember, scheduledAt: nextTime, durationMinutes: nextDuration, excludeId: session._id })
        if (conflict) return response.status(409).json({ message: conflict })
      }
      Object.assign(session, updates)
    }
    await session.save()
    await session.populate(populateSession)
    emitDashboardUpdate(request, 'training-session:updated', session)
    response.json({ session })
  } catch (error) { next(error) }
}

export async function deleteTrainingSession(request, response, next) {
  try {
    const session = await TrainingSession.findById(request.params.id)
    if (!session) return response.status(404).json({ message: 'Training session not found' })
    if (session.status === 'completed') return response.status(409).json({ message: 'Completed sessions are retained as history and cannot be deleted' })
    await session.deleteOne()
    emitDashboardUpdate(request, 'training-session:deleted', session)
    response.status(204).end()
  } catch (error) { next(error) }
}
