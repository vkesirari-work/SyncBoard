import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { staffPermissions } from '../config/permissions.js'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['admin', 'user', 'staff', 'trainer', 'member'], default: 'admin' },
    ownerSlot: { type: String, enum: ['primary'], unique: true, sparse: true, immutable: true, select: false },
    permissions: [{ type: String, enum: staffPermissions }],
    isActive: { type: Boolean, default: true, index: true },
    tokenVersion: { type: Number, default: 0, min: 0, select: false },
    trainerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', unique: true, sparse: true },
    memberProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', unique: true, sparse: true },
  },
  { timestamps: true },
)

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
    if (!this.isNew) this.tokenVersion = (this.tokenVersion || 0) + 1
  }
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model('User', userSchema)
