import { Member } from '../models/member.model.js'
import { Attendance } from '../models/attendance.model.js'
import { Payment } from '../models/payment.model.js'
import { Trainer } from '../models/trainer.model.js'
import { User } from '../models/user.model.js'
import { TrainingSession } from '../models/training-session.model.js'
import { MemberProgress } from '../models/member-progress.model.js'

function safeMember(member) {
  const result = member.toObject ? member.toObject() : { ...member }
  result.hasLogin = Boolean(result.userAccount)
  delete result.userAccount
  return result
}

async function trainerMemberIds(user) {
  const trainer = await Trainer.findById(user.trainerProfile).select('assignedMembers')
  return trainer?.assignedMembers || []
}

export async function listMembers(request, response, next) {
  try {
    const filter = request.query.status ? { status: request.query.status } : {}
    if (request.user.role === 'trainer') filter._id = { $in: await trainerMemberIds(request.user) }
    if (request.user.role === 'member') filter._id = request.user.memberProfile
    const members = await Member.find(filter).select('+userAccount').populate('plan').sort({ createdAt: -1 })
    response.json({ members: members.map(safeMember) })
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
    if (request.user.role === 'member' && String(request.user.memberProfile) !== request.params.id) return response.status(403).json({ message: 'You can only view your own profile' })
    const member = await Member.findById(request.params.id).select('+userAccount').populate('plan')
    if (!member) return response.status(404).json({ message: 'Member not found' })
    response.json({ member: safeMember(member) })
  } catch (error) {
    next(error)
  }
}

export async function createMember(request, response, next) {
  let member
  let createdUser
  try {
    const { enableLogin, loginPassword, ...memberFields } = request.body
    const email = (memberFields.email || '').trim().toLowerCase()
    if (enableLogin) {
      if (!email) return response.status(400).json({ message: 'Member email is required for login' })
      if ((loginPassword || '').length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })
      if (await User.exists({ email })) return response.status(409).json({ message: 'This email is already used by another account' })
    }
    member = await Member.create({ ...memberFields, email })
    if (enableLogin) {
      createdUser = await User.create({ name: member.name, email, password: loginPassword, role: 'member', memberProfile: member._id })
      member.userAccount = createdUser._id
      await member.save()
    }
    await member.populate('plan')
    request.app.get('io')?.emit('member:created', member)
    response.status(201).json({ member: safeMember(member) })
  } catch (error) {
    if (createdUser) await User.findByIdAndDelete(createdUser._id).catch(() => {})
    if (member) await Member.findByIdAndDelete(member._id).catch(() => {})
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
    if (request.user.role === 'member') return response.status(403).json({ message: 'Members cannot edit their own membership record' })
    const { enableLogin: _enableLogin, resetLogin: _resetLogin, loginPassword: _loginPassword, ...safeUpdates } = updates
    updates = safeUpdates
    const member = await Member.findByIdAndUpdate(request.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('+userAccount').populate('plan')

    if (!member) return response.status(404).json({ message: 'Member not found' })
    request.app.get('io')?.emit('member:updated', member)
    response.json({ member: safeMember(member) })
  } catch (error) {
    next(error)
  }
}

export async function deleteMember(request, response, next) {
  try {
    const linkedMember = await Member.findById(request.params.id).select('+userAccount')
    if (!linkedMember) return response.status(404).json({ message: 'Member not found' })
    const [paymentCount, attendanceCount, sessionCount, progressCount] = await Promise.all([
      Payment.countDocuments({ member: request.params.id }),
      Attendance.countDocuments({ member: request.params.id }),
      TrainingSession.countDocuments({ member: request.params.id }),
      MemberProgress.countDocuments({ member: request.params.id }),
    ])

    if (paymentCount || attendanceCount || sessionCount || progressCount || linkedMember.userAccount) {
      return response.status(409).json({
        message: 'Member has payment, attendance, session, progress, or login history and cannot be deleted. Mark the member expired instead.',
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

export async function saveMemberAccount(request, response, next) {
  let createdUser
  try {
    const member = await Member.findById(request.params.id).select('+userAccount')
    if (!member) return response.status(404).json({ message: 'Member not found' })
    const email = (request.body.email || member.email || '').trim().toLowerCase()
    const password = request.body.password || ''
    if (!email) return response.status(400).json({ message: 'Member email is required for login' })
    if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })
    const hadAccount = Boolean(member.userAccount)
    let user = member.userAccount ? await User.findById(member.userAccount).select('+password') : null
    const conflict = await User.findOne({ email, ...(user ? { _id: { $ne: user._id } } : {}) })
    if (conflict) return response.status(409).json({ message: 'This email is already used by another account' })
    if (user) {
      user.name = member.name
      user.email = email
      user.password = password
      user.role = 'member'
      user.memberProfile = member._id
      await user.save()
    } else {
      user = await User.create({ name: member.name, email, password, role: 'member', memberProfile: member._id })
      createdUser = user
      member.userAccount = user._id
    }
    member.email = email
    await member.save()
    response.json({ message: hadAccount ? 'Member login credentials saved' : 'Member login created', member: safeMember(member) })
  } catch (error) {
    if (createdUser) await User.findByIdAndDelete(createdUser._id).catch(() => {})
    next(error)
  }
}

export async function getMyMemberPortal(request, response, next) {
  try {
    const member = await Member.findById(request.user.memberProfile)
      .select('name phone email gender dateOfBirth address plan joinedAt membershipStart membershipEnd status trainerNotes progressUpdatedAt')
      .populate('plan', 'name description durationMonths price')
    if (!member) return response.status(404).json({ message: 'Member profile not found' })
    const [trainer, payments, attendance] = await Promise.all([
      Trainer.findOne({ assignedMembers: member._id, isActive: true }).select('name email phone specialties shift workingDays bio'),
      Payment.find({ member: member._id }).select('plan amount method status paidAt reference gateway gatewayPaymentId').populate('plan', 'name durationMonths').sort({ paidAt: -1 }),
      Attendance.find({ member: member._id }).select('checkIn checkOut').sort({ checkIn: -1 }).limit(100),
    ])
    response.json({ member, trainer, payments, attendance })
  } catch (error) { next(error) }
}
