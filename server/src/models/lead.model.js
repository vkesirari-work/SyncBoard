import mongoose from 'mongoose'

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 24 },
    email: { type: String, lowercase: true, trim: true, maxlength: 160 },
    fitnessGoal: {
      type: String,
      enum: ['fat_loss', 'muscle_gain', 'general_fitness', 'personal_training'],
    },
    message: { type: String, trim: true, maxlength: 1000, default: '' },
    source: { type: String, trim: true, maxlength: 80, default: 'website' },
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
