import { Trainer } from '../models/trainer.model.js'
import { User } from '../models/user.model.js'
import { TrainingSession } from '../models/training-session.model.js'
import { TrainerLeave } from '../models/trainer-leave.model.js'
import { emitDashboardUpdate } from '../realtime/socket.js'

function safeTrainer(trainer) {
  const result = trainer.toObject ? trainer.toObject() : { ...trainer }
  result.hasLogin = Boolean(result.userAccount)
  delete result.userAccount
  return result
}

export async function listTrainers(_request, response, next) {
  try {
    const trainers = await Trainer.find()
      .populate('assignedMembers', 'name phone status')
      .sort({ createdAt: -1 })
    response.json({ trainers: trainers.map(safeTrainer) })
  } catch (error) {
    next(error)
  }
}

export async function createTrainer(request, response, next) {
  try {
    const trainer = await Trainer.create(request.body)
    await trainer.populate('assignedMembers', 'name phone status')
    emitDashboardUpdate(request, 'trainer:created', trainer)
    response.status(201).json({ trainer: safeTrainer(trainer) })
  } catch (error) {
    next(error)
  }
}

export async function updateTrainer(request, response, next) {
  try {
    const trainer = await Trainer.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    }).populate('assignedMembers', 'name phone status')
    if (!trainer) return response.status(404).json({ message: 'Trainer not found' })
    emitDashboardUpdate(request, 'trainer:updated', trainer)
    response.json({ trainer: safeTrainer(trainer) })
  } catch (error) {
    next(error)
  }
}

export async function deleteTrainer(request, response, next) {
  try {
    const trainer = await Trainer.findById(request.params.id)
    if (!trainer) return response.status(404).json({ message: 'Trainer not found' })
    const [sessionCount, leaveCount] = await Promise.all([TrainingSession.countDocuments({ trainer: trainer._id }), TrainerLeave.countDocuments({ trainer: trainer._id })])
    if (trainer.assignedMembers.length || trainer.userAccount || sessionCount || leaveCount) {
      return response.status(409).json({
        message: 'Trainer has assigned members, session/leave history, or a login account and cannot be deleted. Mark the trainer inactive instead.',
      })
    }
    await trainer.deleteOne()
    emitDashboardUpdate(request, 'trainer:deleted', trainer)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}

export async function getMyTrainerProfile(request, response, next) {
  try {
    const trainer = await Trainer.findById(request.user.trainerProfile)
      .populate({ path: 'assignedMembers', select: 'name phone email status membershipEnd plan trainerNotes progressUpdatedAt', populate: { path: 'plan', select: 'name durationMonths' } })
    if (!trainer) return response.status(404).json({ message: 'Trainer profile not found' })
    response.json({ trainer: safeTrainer(trainer) })
  } catch (error) { next(error) }
}

export async function saveTrainerAccount(request, response, next) {
  try {
    const trainer = await Trainer.findById(request.params.id).select('+userAccount')
    if (!trainer) return response.status(404).json({ message: 'Trainer not found' })
    const email = (request.body.email || trainer.email || '').trim().toLowerCase()
    const password = request.body.password || ''
    if (!email) return response.status(400).json({ message: 'Trainer email is required for login' })
    if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })
    const hadAccount = Boolean(trainer.userAccount)
    let user = trainer.userAccount ? await User.findById(trainer.userAccount).select('+password +tokenVersion') : null
    const conflict = await User.findOne({ email, ...(user ? { _id: { $ne: user._id } } : {}) })
    if (conflict) return response.status(409).json({ message: 'This email is already used by another account' })
    if (user) {
      user.name = trainer.name
      user.email = email
      user.password = password
      user.role = 'trainer'
      user.trainerProfile = trainer._id
      await user.save()
    } else {
      user = await User.create({ name: trainer.name, email, password, role: 'trainer', trainerProfile: trainer._id })
      trainer.userAccount = user._id
    }
    trainer.email = email
    await trainer.save()
    response.json({ message: hadAccount ? 'Trainer login credentials saved' : 'Trainer login created', trainer: safeTrainer(trainer) })
  } catch (error) { next(error) }
}
