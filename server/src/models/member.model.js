import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: Date,
    address: { type: String, trim: true, default: '' },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    joinedAt: { type: Date, default: Date.now },
    membershipStart: Date,
    membershipEnd: Date,
    status: {
      type: String,
      enum: ['active', 'expiring', 'expired', 'paused'],
      default: 'active',
      index: true,
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
)

export const Member = mongoose.model('Member', memberSchema)
