import { env } from '../config/env.js'
import { GymSettings } from '../models/gym-settings.model.js'

const defaults = {
  gymName: 'Sirari Fitness',
  tagline: 'Train harder. Live stronger.',
  phone: '+91 90000 00000',
  email: '',
  address: 'Main Market Road',
  openingHours: 'Daily · 5:00 AM—11:00 PM',
  gstNumber: '',
  logoUrl: '',
  instagramUrl: '',
  receiptFooter: 'Thank you for choosing Sirari Fitness.',
}

const allowedFields = Object.keys(defaults)

async function readSettings() {
  const settings = await GymSettings.findOne({ key: 'primary' }).lean()
  return Object.fromEntries(allowedFields.map((field) => [field, settings?.[field] ?? defaults[field]]))
}

export async function getPublicSettings(_request, response, next) {
  try { response.json({ settings: await readSettings() }) } catch (error) { next(error) }
}

export async function getSettings(_request, response, next) {
  try {
    response.json({
      settings: await readSettings(),
      paymentsConfigured: Boolean(env.razorpayKeyId && env.razorpayKeySecret),
      paymentMode: env.razorpayKeyId.startsWith('rzp_live_') ? 'live' : 'test',
    })
  } catch (error) { next(error) }
}

export async function updateSettings(request, response, next) {
  try {
    const updates = Object.fromEntries(allowedFields
      .filter((field) => request.body[field] !== undefined)
      .map((field) => [field, typeof request.body[field] === 'string' ? request.body[field].trim() : request.body[field]]))
    if (!updates.gymName || !updates.phone || !updates.address) {
      return response.status(400).json({ message: 'Gym name, phone and address are required' })
    }
    const settings = await GymSettings.findOneAndUpdate(
      { key: 'primary' },
      { ...updates, updatedBy: request.user.id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
    request.app.get('io')?.emit('settings:updated', settings)
    response.json({ settings })
  } catch (error) { next(error) }
}
