import { describe, expect, it } from 'vitest'
import { sanitizeAttendanceInput, validateAttendanceTimeline } from './attendance.controller.js'

describe('attendance input integrity', () => {
  it('drops unknown fields and never accepts checkout during check-in', () => {
    expect(sanitizeAttendanceInput({ member: 'm1', checkIn: '2026-07-18', checkOut: '2026-07-19', owner: true }, { checkInOnly: true })).toEqual({
      member: 'm1',
      checkIn: '2026-07-18',
    })
  })

  it('rejects future check-ins and checkout before check-in', () => {
    const now = new Date('2026-07-18T10:00:00.000Z')
    expect(() => validateAttendanceTimeline('2026-07-18T11:00:00.000Z', null, now)).toThrow(/future/)
    expect(() => validateAttendanceTimeline('2026-07-18T09:00:00.000Z', '2026-07-18T08:00:00.000Z', now)).toThrow(/after check-in/)
    expect(() => validateAttendanceTimeline('2026-07-18T09:00:00.000Z', '2026-07-18T10:00:00.000Z', now)).not.toThrow()
  })
})
