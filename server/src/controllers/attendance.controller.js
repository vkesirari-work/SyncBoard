import { Attendance } from '../models/attendance.model.js'

export async function listAttendance(request, response, next) {
  try {
    const filter = request.query.member ? { member: request.query.member } : {}
    const attendance = await Attendance.find(filter)
      .populate('member', 'name phone')
      .sort({ checkIn: -1 })

    response.json({ attendance })
  } catch (error) {
    next(error)
  }
}

export async function checkIn(request, response, next) {
  try {
    const openVisit = await Attendance.findOne({ member: request.body.member, checkOut: null })
    if (openVisit) {
      return response.status(409).json({ message: 'Member is already checked in' })
    }

    const attendance = await Attendance.create(request.body)
    await attendance.populate('member', 'name phone')
    request.app.get('io')?.emit('attendance:check-in', attendance)
    response.status(201).json({ attendance })
  } catch (error) {
    next(error)
  }
}

export async function checkOut(request, response, next) {
  try {
    const attendance = await Attendance.findOneAndUpdate(
      { _id: request.params.id, checkOut: null },
      { checkOut: new Date() },
      { new: true, runValidators: true },
    ).populate('member', 'name phone')

    if (!attendance) {
      return response.status(404).json({ message: 'Active attendance record not found' })
    }

    request.app.get('io')?.emit('attendance:check-out', attendance)
    response.json({ attendance })
  } catch (error) {
    next(error)
  }
}
