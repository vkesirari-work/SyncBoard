import { Attendance } from '../models/attendance.model.js'
import { Lead } from '../models/lead.model.js'
import { Member } from '../models/member.model.js'
import { Payment } from '../models/payment.model.js'

const DAY = 86_400_000

function dateOnly(value) {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function bucketConfig(from, to) {
  const days = Math.max(1, Math.ceil((to - from) / DAY))
  if (days <= 31) return { mode: 'day', step: 1 }
  if (days <= 180) return { mode: 'week', step: 7 }
  return { mode: 'month', step: 1 }
}

function bucketStart(value, mode) {
  const date = dateOnly(value)
  if (mode === 'week') {
    const day = date.getDay() || 7
    date.setDate(date.getDate() - day + 1)
  }
  if (mode === 'month') date.setDate(1)
  return date
}

function bucketKey(value, mode) {
  const date = bucketStart(value, mode)
  return mode === 'month'
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    : date.toISOString().slice(0, 10)
}

function bucketLabel(value, mode) {
  const date = bucketStart(value, mode)
  if (mode === 'month') return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
  if (mode === 'week') return `Wk ${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function buildBuckets(from, to, mode) {
  const buckets = []
  const cursor = bucketStart(from, mode)
  while (cursor <= to) {
    buckets.push({ key: bucketKey(cursor, mode), label: bucketLabel(cursor, mode), revenue: 0, checkIns: 0, members: 0, leads: 0 })
    if (mode === 'month') cursor.setMonth(cursor.getMonth() + 1)
    else cursor.setDate(cursor.getDate() + (mode === 'week' ? 7 : 1))
  }
  return buckets
}

export async function getAnalytics(request, response, next) {
  try {
    const today = dateOnly(new Date())
    const defaultFrom = new Date(today.getTime() - 29 * DAY)
    const from = request.query.from ? dateOnly(request.query.from) : defaultFrom
    const to = request.query.to ? dateOnly(request.query.to) : today
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return response.status(400).json({ message: 'Select a valid date range' })
    if ((to - from) / DAY > 730) return response.status(400).json({ message: 'Analytics range cannot exceed 2 years' })
    const toExclusive = new Date(to.getTime() + DAY)
    const { mode } = bucketConfig(from, to)

    const [payments, attendance, members, leads, activeMembers] = await Promise.all([
      Payment.find({ paidAt: { $gte: from, $lt: toExclusive } }).populate('plan', 'name').select('amount method status paidAt plan').lean(),
      Attendance.find({ checkIn: { $gte: from, $lt: toExclusive } }).select('checkIn checkOut').lean(),
      Member.find({ joinedAt: { $gte: from, $lt: toExclusive } }).populate('plan', 'name').select('joinedAt status plan').lean(),
      Lead.find({ createdAt: { $gte: from, $lt: toExclusive } }).select('createdAt status').lean(),
      Member.countDocuments({ status: 'active' }),
    ])

    const series = buildBuckets(from, to, mode)
    const seriesMap = new Map(series.map((bucket) => [bucket.key, bucket]))
    const paymentMethods = {}
    const planRevenue = {}
    let revenue = 0
    let paidTransactions = 0
    let pendingAmount = 0

    payments.forEach((payment) => {
      if (payment.status === 'pending') pendingAmount += payment.amount
      if (payment.status !== 'paid') return
      revenue += payment.amount
      paidTransactions += 1
      const bucket = seriesMap.get(bucketKey(payment.paidAt, mode))
      if (bucket) bucket.revenue += payment.amount
      paymentMethods[payment.method] = (paymentMethods[payment.method] || 0) + payment.amount
      const planName = payment.plan?.name || 'No plan'
      planRevenue[planName] = (planRevenue[planName] || 0) + payment.amount
    })
    attendance.forEach((visit) => { const bucket = seriesMap.get(bucketKey(visit.checkIn, mode)); if (bucket) bucket.checkIns += 1 })
    members.forEach((member) => { const bucket = seriesMap.get(bucketKey(member.joinedAt, mode)); if (bucket) bucket.members += 1 })
    leads.forEach((lead) => { const bucket = seriesMap.get(bucketKey(lead.createdAt, mode)); if (bucket) bucket.leads += 1 })

    const completedVisits = attendance.filter((visit) => visit.checkOut)
    const averageVisitMinutes = completedVisits.length
      ? Math.round(completedVisits.reduce((sum, visit) => sum + (new Date(visit.checkOut) - new Date(visit.checkIn)) / 60_000, 0) / completedVisits.length)
      : 0

    response.json({
      range: { from: from.toISOString(), to: to.toISOString(), bucket: mode },
      summary: { revenue, paidTransactions, pendingAmount, checkIns: attendance.length, newMembers: members.length, activeMembers, leads: leads.length, convertedLeads: leads.filter((lead) => lead.status === 'converted').length, averageVisitMinutes },
      series,
      paymentMethods: Object.entries(paymentMethods).map(([method, amount]) => ({ method, amount })).sort((a, b) => b.amount - a.amount),
      planRevenue: Object.entries(planRevenue).map(([plan, amount]) => ({ plan, amount })).sort((a, b) => b.amount - a.amount).slice(0, 6),
    })
  } catch (error) { next(error) }
}
