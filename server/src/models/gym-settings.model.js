import mongoose from 'mongoose'

const gymSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'primary', unique: true, immutable: true },
    gymName: { type: String, trim: true, default: 'Sirari Fitness' },
    tagline: { type: String, trim: true, default: 'Train harder. Live stronger.' },
    phone: { type: String, trim: true, default: '+91 90000 00000' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    address: { type: String, trim: true, default: 'Main Market Road' },
    openingHours: { type: String, trim: true, default: 'Daily · 5:00 AM—11:00 PM' },
    gstNumber: { type: String, trim: true, uppercase: true, default: '' },
    logoUrl: { type: String, trim: true, default: '' },
    instagramUrl: { type: String, trim: true, default: '' },
    receiptFooter: { type: String, trim: true, default: 'Thank you for choosing Sirari Fitness.' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export const GymSettings = mongoose.model('GymSettings', gymSettingsSchema)
