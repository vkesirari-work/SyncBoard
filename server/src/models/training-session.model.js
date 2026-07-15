import mongoose from 'mongoose'

const trainingSessionSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, min: 15, max: 180, default: 60 },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no_show'], default: 'scheduled', index: true },
    focus: { type: String, trim: true, maxlength: 120, default: '' },
    adminNotes: { type: String, trim: true, maxlength: 1000, default: '' },
    trainerNotes: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true },
)

trainingSessionSchema.index({ trainer: 1, scheduledAt: 1 })
trainingSessionSchema.index({ member: 1, scheduledAt: 1 })

export const TrainingSession = mongoose.model('TrainingSession', trainingSessionSchema)
