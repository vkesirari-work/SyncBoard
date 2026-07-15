import mongoose from 'mongoose'

const trainerLeaveSchema = new mongoose.Schema(
  {
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true, index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    adminNote: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true },
)

trainerLeaveSchema.index({ trainer: 1, startDate: 1, endDate: 1 })

export const TrainerLeave = mongoose.model('TrainerLeave', trainerLeaveSchema)
