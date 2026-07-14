import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    checkIn: { type: Date, default: Date.now, index: true },
    checkOut: Date,
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
)

attendanceSchema.index({ member: 1, checkIn: -1 })

export const Attendance = mongoose.model('Attendance', attendanceSchema)
