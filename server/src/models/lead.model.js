import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    fitnessGoal: {
      type: String,
      enum: ['fat_loss', 'muscle_gain', 'general_fitness', 'personal_training'],
    },
    message: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: 'website' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'closed'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true },
)

export const Lead = mongoose.model('Lead', leadSchema)
