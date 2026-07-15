import mongoose from 'mongoose'
import { connectDatabase } from '../src/config/database.js'
import { env } from '../src/config/env.js'
import { Attendance } from '../src/models/attendance.model.js'
import { Lead } from '../src/models/lead.model.js'
import { Member } from '../src/models/member.model.js'
import { Payment } from '../src/models/payment.model.js'
import { Plan } from '../src/models/plan.model.js'
import { Trainer } from '../src/models/trainer.model.js'
import { Notification } from '../src/models/notification.model.js'

if (!process.argv.includes('--confirm')) {
  console.error('Reset cancelled. Run with --confirm to delete dashboard data.')
  process.exit(1)
}

try {
  await connectDatabase(env.mongodbUri)

  const collections = [Attendance, Payment, Member, Lead, Plan, Trainer, Notification]
  const results = await Promise.all(collections.map((model) => model.deleteMany({})))
  const deleted = results.reduce((total, result) => total + result.deletedCount, 0)

  console.log(`Dashboard cleaned: ${deleted} records deleted. Login accounts were preserved.`)
} catch (error) {
  console.error(`Could not clean dashboard: ${error.message}`)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
