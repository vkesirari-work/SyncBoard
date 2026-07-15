import { Member } from '../models/member.model.js'
import { Attendance } from '../models/attendance.model.js'
import { Payment } from '../models/payment.model.js'
import { Trainer } from '../models/trainer.model.js'

async function trainerMemberIds(user) {
  const trainer = await Trainer.findById(user.trainerProfile).select('assignedMembers')
  return trainer?.assignedMembers || []
}

export async function listMembers(request, response, next) {
  try {
    const filter = request.query.status ? { status: request.query.status } : {}
    if (request.user.role === 'trainer') filter._id = { $in: await trainerMemberIds(request.user) }
    const members = await Member.find(filter).populate('plan').sort({ createdAt: -1 })
    response.json({ members })
  } catch (error) {
    next(error)
  }
}

export async function getMember(request, response, next) {
  try {
    if (request.user.role === 'trainer') {
      const assignedIds = await trainerMemberIds(request.user)
      if (!assignedIds.some((id) => id.equals(request.params.id))) return response.status(403).json({ message: 'This member is not assigned to you' })
    }
    const member = await Member.findById(request.params.id).populate('plan')
    if (!member) return response.status(404).json({ message: 'Member not found' })
    response.json({ member })
  } catch (error) {
    next(error)
  }
}

export async function createMember(request, response, next) {
  try {
    const member = await Member.create(request.body)
    await member.populate('plan')
    request.app.get('io')?.emit('member:created', member)
    response.status(201).json({ member })
  } catch (error) {
    next(error)
  }
}

export async function updateMember(request, response, next) {
  try {
    let updates = request.body
    if (request.user.role === 'trainer') {
      const assignedIds = await trainerMemberIds(request.user)
      if (!assignedIds.some((id) => id.equals(request.params.id))) return response.status(403).json({ message: 'This member is not assigned to you' })
      updates = { trainerNotes: request.body.trainerNotes || '', progressUpdatedAt: new Date() }
    }
    const member = await Member.findByIdAndUpdate(request.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('plan')

    if (!member) return response.status(404).json({ message: 'Member not found' })
    request.app.get('io')?.emit('member:updated', member)
    response.json({ member })
  } catch (error) {
    next(error)
  }
}

export async function deleteMember(request, response, next) {
  try {
    const [paymentCount, attendanceCount] = await Promise.all([
      Payment.countDocuments({ member: request.params.id }),
      Attendance.countDocuments({ member: request.params.id }),
    ])

    if (paymentCount || attendanceCount) {
      return response.status(409).json({
        message: 'Member has payment or attendance history and cannot be deleted. Mark the member expired instead.',
      })
    }

    const member = await Member.findByIdAndDelete(request.params.id)
    if (!member) return response.status(404).json({ message: 'Member not found' })
    request.app.get('io')?.emit('member:deleted', { id: member.id })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}
