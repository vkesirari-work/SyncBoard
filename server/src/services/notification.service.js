import { Lead } from '../models/lead.model.js'
import { Member } from '../models/member.model.js'
import { Notification } from '../models/notification.model.js'
import { Payment } from '../models/payment.model.js'

const DAY = 86_400_000
const dayKey = (value) => new Date(value).toISOString().slice(0, 10)
let lastSyncAt = 0
let lastActiveCount = 0

export async function syncNotifications(force = false) {
  if (!force && Date.now() - lastSyncAt < 60_000) return lastActiveCount
  const now = new Date()
  const renewalLimit = new Date(now.getTime() + 30 * DAY)
  const [members, payments, leads] = await Promise.all([
    Member.find({ membershipEnd: { $lte: renewalLimit }, status: { $ne: 'paused' } }).select('name phone membershipEnd status').lean(),
    Payment.find({ status: 'pending' }).populate('member', 'name phone').select('member amount paidAt status').lean(),
    Lead.find({ status: { $in: ['new', 'contacted'] } }).select('name phone status updatedAt').lean(),
  ])

  const reminders = []
  for (const member of members) {
    const days = Math.ceil((new Date(member.membershipEnd).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / DAY)
    reminders.push({
      key: `renewal:${member._id}:${dayKey(member.membershipEnd)}`, type: 'renewal', sourceId: member._id,
      title: days < 0 ? 'Membership expired' : days === 0 ? 'Membership expires today' : 'Membership renewal due',
      message: `${member.name} · ${member.phone} · ${days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`}`,
      priority: days <= 7 ? 'high' : 'medium', priorityRank: days <= 7 ? 3 : 2, dueAt: member.membershipEnd,
      link: `/dashboard/renewals?search=${encodeURIComponent(member.phone)}`,
    })
  }

  for (const payment of payments) {
    const age = Math.floor((now - new Date(payment.paidAt)) / DAY)
    reminders.push({
      key: `payment:${payment._id}`, type: 'payment', sourceId: payment._id, title: 'Pending payment',
      message: `${payment.member?.name || 'Member'} · ₹${payment.amount.toLocaleString('en-IN')} pending`,
      priority: age >= 7 ? 'high' : 'medium', priorityRank: age >= 7 ? 3 : 2, dueAt: new Date(new Date(payment.paidAt).getTime() + 3 * DAY),
      link: `/dashboard/payments?search=${encodeURIComponent(payment.member?.phone || '')}`,
    })
  }

  for (const lead of leads) {
    const dueAt = new Date(new Date(lead.updatedAt).getTime() + 2 * DAY)
    reminders.push({
      key: `lead:${lead._id}:${dayKey(lead.updatedAt)}`, type: 'lead', sourceId: lead._id,
      title: lead.status === 'new' ? 'New lead follow-up' : 'Lead follow-up due',
      message: `${lead.name} · ${lead.phone} · ${lead.status}`,
      priority: dueAt <= now ? 'high' : 'medium', priorityRank: dueAt <= now ? 3 : 2, dueAt,
      link: `/dashboard/leads?search=${encodeURIComponent(lead.phone)}`,
    })
  }

  if (reminders.length) {
    await Notification.bulkWrite(reminders.map((reminder) => ({
      updateOne: {
        filter: { key: reminder.key },
        update: { $set: { ...reminder, generated: true, resolvedAt: null } },
        upsert: true,
      },
    })), { ordered: false })
  }

  const activeKeys = reminders.map((reminder) => reminder.key)
  await Notification.updateMany(
    { generated: true, resolvedAt: null, ...(activeKeys.length ? { key: { $nin: activeKeys } } : {}) },
    { $set: { resolvedAt: now } },
  )
  lastSyncAt = Date.now()
  lastActiveCount = reminders.length
  return lastActiveCount
}
