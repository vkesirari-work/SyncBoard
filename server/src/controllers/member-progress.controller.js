import mongoose from 'mongoose'
import { Member } from '../models/member.model.js'
import { MemberProgress } from '../models/member-progress.model.js'
import { emitDashboardUpdate } from '../realtime/socket.js'
import { Trainer } from '../models/trainer.model.js'

const numberFields = ['weightKg', 'heightCm', 'bodyFatPercent', 'chestCm', 'waistCm', 'hipsCm', 'bicepsCm', 'thighCm']

async function resolveMember(request, response) {
  let memberId = request.params.memberId
  if (memberId === 'me') {
    if (request.user.role !== 'member') {
      response.status(400).json({ message: 'The me route is only available to member accounts' })
      return null
    }
    memberId = String(request.user.memberProfile)
  }
  if (!mongoose.isValidObjectId(memberId)) {
    response.status(400).json({ message: 'Invalid member id' })
    return null
  }
  if (request.user.role === 'member' && String(request.user.memberProfile) !== memberId) {
    response.status(403).json({ message: 'You can only view your own progress' })
    return null
  }
  if (request.user.role === 'trainer') {
    const trainer = await Trainer.findById(request.user.trainerProfile).select('assignedMembers')
    if (!trainer?.assignedMembers.some((id) => String(id) === memberId)) {
      response.status(403).json({ message: 'This member is not assigned to you' })
      return null
    }
  }
  const member = await Member.findById(memberId).select('name phone email status plan').populate('plan', 'name')
  if (!member) {
    response.status(404).json({ message: 'Member not found' })
    return null
  }
  return member
}

async function progressFor(memberId) {
  return MemberProgress.findOneAndUpdate(
    { member: memberId },
    { $setOnInsert: { member: memberId } },
    { new: true, upsert: true, runValidators: true },
  )
}

function actorName(request) {
  return `${request.user.name} (${request.user.role})`
}

export async function getMemberProgress(request, response, next) {
  try {
    const member = await resolveMember(request, response)
    if (!member) return
    const progress = await MemberProgress.findOne({ member: member._id }) || new MemberProgress({ member: member._id })
    progress.measurements.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    progress.photos.sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))
    response.json({ member, progress, canEdit: request.user.role !== 'member' })
  } catch (error) { next(error) }
}

export async function addMeasurement(request, response, next) {
  try {
    const member = await resolveMember(request, response)
    if (!member) return
    const measurement = { recordedAt: request.body.recordedAt || new Date(), notes: request.body.notes || '', recordedBy: actorName(request) }
    numberFields.forEach((field) => {
      if (request.body[field] !== '' && request.body[field] !== undefined && request.body[field] !== null) measurement[field] = Number(request.body[field])
    })
    if (!numberFields.some((field) => measurement[field] !== undefined)) return response.status(400).json({ message: 'Add at least one body measurement' })
    const progress = await progressFor(member._id)
    progress.measurements.push(measurement)
    if (request.body.goal !== undefined) progress.goal = request.body.goal
    if (request.body.targetWeightKg !== undefined) progress.targetWeightKg = request.body.targetWeightKg || undefined
    if (request.body.targetBodyFatPercent !== undefined) progress.targetBodyFatPercent = request.body.targetBodyFatPercent || undefined
    await progress.save()
    emitDashboardUpdate(request, 'member-progress:updated', member)
    response.status(201).json({ progress })
  } catch (error) { next(error) }
}

export async function deleteMeasurement(request, response, next) {
  try {
    const member = await resolveMember(request, response)
    if (!member) return
    const progress = await MemberProgress.findOne({ member: member._id })
    const measurement = progress?.measurements.id(request.params.measurementId)
    if (!measurement) return response.status(404).json({ message: 'Measurement not found' })
    measurement.deleteOne()
    await progress.save()
    emitDashboardUpdate(request, 'member-progress:updated', member)
    response.status(204).end()
  } catch (error) { next(error) }
}

export async function saveWorkoutPlan(request, response, next) {
  try {
    const member = await resolveMember(request, response)
    if (!member) return
    const progress = await progressFor(member._id)
    progress.workoutPlan = {
      title: request.body.title || '',
      goal: request.body.goal || '',
      coachNotes: request.body.coachNotes || '',
      exercises: Array.isArray(request.body.exercises) ? request.body.exercises.slice(0, 60) : [],
      updatedAt: new Date(),
      updatedBy: actorName(request),
    }
    await progress.save()
    emitDashboardUpdate(request, 'member-progress:updated', member)
    response.json({ progress })
  } catch (error) { next(error) }
}

export async function addProgressPhoto(request, response, next) {
  try {
    const member = await resolveMember(request, response)
    if (!member) return
    const image = request.body.image || ''
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(image)) return response.status(400).json({ message: 'Choose a JPG, PNG, or WebP image' })
    if (image.length > 650_000) return response.status(413).json({ message: 'Compressed photo is too large. Choose a smaller image.' })
    const progress = await progressFor(member._id)
    if (progress.photos.length >= 12) return response.status(409).json({ message: 'Maximum 12 progress photos reached. Delete an older photo first.' })
    progress.photos.push({ image, label: request.body.label || 'Progress photo', takenAt: request.body.takenAt || new Date(), uploadedBy: actorName(request) })
    await progress.save()
    emitDashboardUpdate(request, 'member-progress:updated', member)
    response.status(201).json({ progress })
  } catch (error) { next(error) }
}

export async function deleteProgressPhoto(request, response, next) {
  try {
    const member = await resolveMember(request, response)
    if (!member) return
    const progress = await MemberProgress.findOne({ member: member._id })
    const photo = progress?.photos.id(request.params.photoId)
    if (!photo) return response.status(404).json({ message: 'Progress photo not found' })
    photo.deleteOne()
    await progress.save()
    emitDashboardUpdate(request, 'member-progress:updated', member)
    response.status(204).end()
  } catch (error) { next(error) }
}
