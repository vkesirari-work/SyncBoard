import mongoose from 'mongoose'

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    durationMonths: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Plan = mongoose.model('Plan', planSchema)
