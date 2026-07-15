import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { staffPermissions } from '../config/permissions.js'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['admin', 'user', 'staff', 'trainer', 'member'], default: 'admin' },
    permissions: [{ type: String, enum: staffPermissions }],
    isActive: { type: Boolean, default: true, index: true },
    trainerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', unique: true, sparse: true },
    memberProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', unique: true, sparse: true },
  },
  { timestamps: true },
)

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model('User', userSchema)
