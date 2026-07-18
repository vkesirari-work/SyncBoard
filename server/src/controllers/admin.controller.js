import { Attendance } from '../models/attendance.model.js'
import { Lead } from '../models/lead.model.js'
import { Member } from '../models/member.model.js'
import { MemberProgress } from '../models/member-progress.model.js'
import { Payment } from '../models/payment.model.js'
import { Plan } from '../models/plan.model.js'
import { Trainer } from '../models/trainer.model.js'
import { Notification } from '../models/notification.model.js'
import { emitDashboardUpdate } from '../realtime/socket.js'
import { TrainingSession } from '../models/training-session.model.js'
import { User } from '../models/user.model.js'
import { TrainerLeave } from '../models/trainer-leave.model.js'

function escapedRegex(value) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}

function canSearch(request, permission) {
  return ['admin', 'user'].includes(request.user.role) || request.user.permissions?.includes(permission)
}

export async function searchDashboard(request, response, next) {
  try {
    const query = String(request.query.q || '').trim().slice(0, 80)
    if (query.length < 2) return response.json({ results: [] })
    const pattern = escapedRegex(query)
    const memberMatches = await Member.find({ $or: [{ name: pattern }, { phone: pattern }, { email: pattern }] }).select('name phone email').limit(6)
    const memberIds = memberMatches.map((member) => member._id)
    const numericAmount = /^\d+(?:\.\d+)?$/.test(query) ? Number(query) : null

    const [members, leads, payments, plans, trainers] = await Promise.all([
      canSearch(request, 'members') ? Promise.resolve(memberMatches.slice(0, 4)) : [],
      canSearch(request, 'leads') ? Lead.find({ $or: [{ name: pattern }, { phone: pattern }, { email: pattern }, { fitnessGoal: pattern }] }).select('name phone').limit(4) : [],
      canSearch(request, 'payments') ? Payment.find({ $or: [
        { reference: pattern },
        { member: { $in: memberIds } },
        ...(numericAmount == null ? [] : [{ amount: numericAmount }]),
      ] }).select('member amount status reference').populate('member', 'name phone').sort({ paidAt: -1 }).limit(4) : [],
      canSearch(request, 'plans') ? Plan.find({ $or: [{ name: pattern }, ...(numericAmount == null ? [] : [{ price: numericAmount }, { durationMonths: numericAmount }])] }).select('name price').limit(4) : [],
      canSearch(request, 'trainers') ? Trainer.find({ $or: [{ name: pattern }, { phone: pattern }, { email: pattern }, { specialties: pattern }] }).select('name phone specialties').limit(4) : [],
    ])

    const results = [
      ...members.map((item) => ({ id: item.id, type: 'Member', title: item.name, detail: item.phone, searchTerm: item.phone, path: '/dashboard/members' })),
      ...leads.map((item) => ({ id: item.id, type: 'Lead', title: item.name, detail: item.phone, searchTerm: item.phone, path: '/dashboard/leads' })),
      ...payments.map((item) => ({ id: item.id, type: 'Payment', title: item.member?.name || 'Payment', detail: `₹${item.amount.toLocaleString('en-IN')} · ${item.status}`, searchTerm: item.reference || item.member?.phone || item.member?.name, path: '/dashboard/payments' })),
      ...plans.map((item) => ({ id: item.id, type: 'Plan', title: item.name, detail: `₹${item.price.toLocaleString('en-IN')}`, searchTerm: item.name, path: '/dashboard/plans' })),
      ...trainers.map((item) => ({ id: item.id, type: 'Trainer', title: item.name, detail: item.specialties?.join(', ') || item.phone, searchTerm: item.phone, path: '/dashboard/trainers' })),
    ].slice(0, 10)

    response.json({ results })
  } catch (error) {
    next(error)
  }
}

export async function getDashboardOverview(request, response, next) {
  try {
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const renewalLimit = new Date(now)
    renewalLimit.setDate(renewalLimit.getDate() + 30)

    const [activeMembers, todayCheckIns, revenueRows, renewalsDue, leads, payments] = await Promise.all([
      Member.countDocuments({ status: 'active' }),
      Attendance.countDocuments({ checkIn: { $gte: today } }),
      Payment.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: monthStart } } },
        { $group: { _id: null, amount: { $sum: '$amount' } } },
      ]),
      Member.countDocuments({ status: { $in: ['active', 'expiring'] }, membershipEnd: { $gte: today, $lte: renewalLimit } }),
      Lead.find().select('name phone fitnessGoal status createdAt').sort({ createdAt: -1 }).limit(6),
      Payment.find().select('member amount method status paidAt').populate('member', 'name phone').sort({ paidAt: -1 }).limit(6),
    ])

    response.json({
      stats: { activeMembers, todayCheckIns, monthlyRevenue: revenueRows[0]?.amount || 0, renewalsDue },
      leads,
      payments,
    })
  } catch (error) {
    next(error)
  }
}

export async function resetDashboardData(request, response, next) {
  try {
    if (request.body.confirmation !== 'sirari') {
      return response.status(400).json({ message: 'Type sirari to confirm deletion' })
    }

    const collections = [Attendance, Payment, TrainingSession, TrainerLeave, MemberProgress, Member, Lead, Plan, Trainer, Notification]
    const results = await Promise.all([...collections.map((model) => model.deleteMany({})), User.deleteMany({ role: { $in: ['trainer', 'member'] } })])
    const deletedCount = results.reduce((total, result) => total + result.deletedCount, 0)

    emitDashboardUpdate(request, 'dashboard:reset')
    response.json({ message: 'Dashboard data cleared successfully', deletedCount })
  } catch (error) {
    next(error)
  }
}
