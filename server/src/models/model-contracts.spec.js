import { describe, expect, it } from 'vitest'
import { Attendance } from './attendance.model.js'
import { AuditLog } from './audit-log.model.js'
import { GymSettings } from './gym-settings.model.js'
import { Lead } from './lead.model.js'
import { MemberProgress } from './member-progress.model.js'
import { Member } from './member.model.js'
import { Notification } from './notification.model.js'
import { Payment } from './payment.model.js'
import { Plan } from './plan.model.js'
import { TrainerLeave } from './trainer-leave.model.js'
import { Trainer } from './trainer.model.js'
import { TrainingSession } from './training-session.model.js'
import { User } from './user.model.js'

describe('MongoDB model contracts', () => {
  it('enforces required membership and financial fields', () => {
    expect(new Member({ name: 'Member' }).validateSync()).toHaveProperty('errors.phone')
    expect(new Plan({ name: 'Bad', durationMonths: 0, price: -1 }).validateSync()).toMatchObject({ errors: { durationMonths: expect.anything(), price: expect.anything() } })
    expect(new Payment({ amount: -1 }).validateSync()).toMatchObject({ errors: { member: expect.anything(), amount: expect.anything() } })
    expect(new Attendance({}).validateSync()).toHaveProperty('errors.member')
  })
  it('enforces role, operational status, and scheduling enums', () => {
    expect(new User({ name: 'User', email: 'u@example.com', password: 'password', role: 'superuser' }).validateSync()).toHaveProperty('errors.role')
    expect(new Lead({ name: 'Lead', phone: '1', status: 'invalid' }).validateSync()).toHaveProperty('errors.status')
    expect(new Trainer({ name: 'Coach', phone: '1', shift: 'night' }).validateSync()).toHaveProperty('errors.shift')
    expect(new TrainingSession({ member: '507f1f77bcf86cd799439011', trainer: '507f1f77bcf86cd799439012', scheduledAt: new Date(), durationMinutes: 5 }).validateSync()).toHaveProperty('errors.durationMinutes')
    expect(new TrainerLeave({ trainer: '507f1f77bcf86cd799439012', startDate: new Date(), endDate: new Date(), reason: 'Leave', status: 'cancelled' }).validateSync()).toHaveProperty('errors.status')
  })
  it('protects notification, audit, settings, and progress document structure', () => {
    expect(new Notification({}).validateSync()).toMatchObject({ errors: { key: expect.anything(), type: expect.anything(), title: expect.anything(), message: expect.anything(), dueAt: expect.anything() } })
    expect(new AuditLog({}).validateSync()).toMatchObject({ errors: { method: expect.anything(), path: expect.anything(), statusCode: expect.anything() } })
    expect(new GymSettings().gymName).toBe('Sirari Fitness')
    expect(new MemberProgress({}).validateSync()).toHaveProperty('errors.member')
  })
})
