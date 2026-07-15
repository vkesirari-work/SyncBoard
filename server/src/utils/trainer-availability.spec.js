import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../models/trainer-leave.model.js', () => ({ TrainerLeave: { findOne: vi.fn() } }))
const { TrainerLeave } = await import('../models/trainer-leave.model.js')
const { trainerAvailabilityError } = await import('./trainer-availability.js')

const trainer = { _id: 'trainer-1', name: 'Aman', shift: 'morning', workingDays: ['monday'] }

describe('trainerAvailabilityError', () => {
  beforeEach(() => TrainerLeave.findOne.mockResolvedValue(null))
  it('accepts a session inside the working day and shift', async () => {
    expect(await trainerAvailabilityError(trainer, '2026-07-13T04:30:00.000Z', 60)).toBeNull()
  })
  it('rejects a non-working day and out-of-shift booking', async () => {
    expect(await trainerAvailabilityError(trainer, '2026-07-14T04:30:00.000Z', 60)).toMatch(/not scheduled to work on tuesday/i)
    expect(await trainerAvailabilityError({ ...trainer, workingDays: [] }, '2026-07-13T12:30:00.000Z', 60)).toMatch(/outside the morning shift/i)
  })
  it('blocks approved leave and invalid dates', async () => {
    TrainerLeave.findOne.mockResolvedValue({ _id: 'leave-1' })
    expect(await trainerAvailabilityError(trainer, '2026-07-13T04:30:00.000Z', 60)).toMatch(/approved leave/i)
    expect(await trainerAvailabilityError(trainer, 'invalid', 60)).toMatch(/valid session date/i)
  })
})
