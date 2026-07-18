import mongoose from 'mongoose'

const gymSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'primary', unique: true, immutable: true },
    gymName: { type: String, trim: true, default: 'Sirari Fitness' },
    tagline: { type: String, trim: true, default: 'Stronger starts here. Opening 2027.' },
    phone: { type: String, trim: true, default: '+91 90127 52982' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    address: { type: String, trim: true, default: 'Sirari Complex, Charubeta, Chanda Mod, Khatima' },
    openingHours: { type: String, trim: true, default: 'Monday–Saturday · 4:00 AM–11:00 PM · Sunday closed' },
    gstNumber: { type: String, trim: true, uppercase: true, default: '' },
    logoUrl: { type: String, trim: true, default: '' },
    instagramUrl: { type: String, trim: true, default: 'https://www.instagram.com/lifebyvke/' },
    receiptFooter: { type: String, trim: true, default: 'Thank you for choosing Sirari Fitness.' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export const GymSettings = mongoose.model('GymSettings', gymSettingsSchema)
