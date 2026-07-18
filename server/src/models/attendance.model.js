import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    checkIn: { type: Date, default: Date.now, index: true },
    checkOut: Date,
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true },
)

attendanceSchema.index({ member: 1, checkIn: -1 })
attendanceSchema.index(
  { member: 1 },
  { unique: true, partialFilterExpression: { checkOut: null }, name: 'one_open_visit_per_member' },
)

export const Attendance = mongoose.model('Attendance', attendanceSchema)
