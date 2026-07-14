import mongoose from 'mongoose'

const trainerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    specialties: [{ type: String, trim: true }],
    shift: {
      type: String,
      enum: ['morning', 'evening', 'full_day', 'flexible'],
      default: 'flexible',
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    }],
    bio: { type: String, trim: true, default: '' },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  },
  { timestamps: true },
)

export const Trainer = mongoose.model('Trainer', trainerSchema)
