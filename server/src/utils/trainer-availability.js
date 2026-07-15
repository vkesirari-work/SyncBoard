import { TrainerLeave } from '../models/trainer-leave.model.js'

const shiftHours = {
  morning: [5, 12],
  evening: [16, 23],
  full_day: [5, 23],
}

export async function trainerAvailabilityError(trainer, scheduledAt, durationMinutes) {
  const start = new Date(scheduledAt)
  if (Number.isNaN(start.getTime())) return 'Select a valid session date and time'
  const end = new Date(start.getTime() + Number(durationMinutes) * 60000)
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  const startParts = Object.fromEntries(formatter.formatToParts(start).map((part) => [part.type, part.value]))
  const endParts = Object.fromEntries(formatter.formatToParts(end).map((part) => [part.type, part.value]))
  const weekday = startParts.weekday.toLowerCase()
  const dateKey = `${startParts.year}-${startParts.month}-${startParts.day}`
  const endDateKey = `${endParts.year}-${endParts.month}-${endParts.day}`
  if (trainer.workingDays?.length && !trainer.workingDays.includes(weekday)) return `${trainer.name} is not scheduled to work on ${weekday}`
  if (dateKey !== endDateKey) return 'Training sessions must start and finish on the same day'

  const hours = shiftHours[trainer.shift]
  if (hours) {
    const startHour = Number(startParts.hour) + Number(startParts.minute) / 60
    const endHour = Number(endParts.hour) + Number(endParts.minute) / 60
    if (startHour < hours[0] || endHour > hours[1]) return `${trainer.name} is unavailable outside the ${trainer.shift.replaceAll('_', ' ')} shift`
  }

  const dayStart = new Date(`${dateKey}T00:00:00.000+05:30`)
  const dayEnd = new Date(`${dateKey}T23:59:59.999+05:30`)
  const approvedLeave = await TrainerLeave.findOne({ trainer: trainer._id, status: 'approved', startDate: { $lte: dayEnd }, endDate: { $gte: dayStart } })
  if (approvedLeave) return `${trainer.name} is on approved leave for this date`
  return null
}
