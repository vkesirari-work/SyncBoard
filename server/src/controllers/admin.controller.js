import { Attendance } from '../models/attendance.model.js'
import { Lead } from '../models/lead.model.js'
import { Member } from '../models/member.model.js'
import { Payment } from '../models/payment.model.js'
import { Plan } from '../models/plan.model.js'
import { Trainer } from '../models/trainer.model.js'
import { Notification } from '../models/notification.model.js'

export async function resetDashboardData(request, response, next) {
  try {
    if (request.body.confirmation !== 'sirari') {
      return response.status(400).json({ message: 'Type sirari to confirm deletion' })
    }

    const collections = [Attendance, Payment, Member, Lead, Plan, Trainer, Notification]
    const results = await Promise.all(collections.map((model) => model.deleteMany({})))
    const deletedCount = results.reduce((total, result) => total + result.deletedCount, 0)

    request.app.get('io')?.emit('dashboard:reset')
    response.json({ message: 'Dashboard data cleared successfully', deletedCount })
  } catch (error) {
    next(error)
  }
}
