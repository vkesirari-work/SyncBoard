import { env } from '../config/env.js'
import { GymSettings } from '../models/gym-settings.model.js'

const defaults = {
  gymName: 'Sirari Fitness',
  tagline: 'Stronger starts here. Opening 2027.',
  phone: '+91 90127 52982',
  email: '',
  address: 'Sirari Complex, Charubeta, Chanda Mod, Khatima',
  openingHours: 'Monday–Saturday · 4:00 AM–11:00 PM · Sunday closed',
  gstNumber: '',
  logoUrl: '',
  instagramUrl: 'https://www.instagram.com/lifebyvke/',
  receiptFooter: 'Thank you for choosing Sirari Fitness.',
}

const allowedFields = Object.keys(defaults)

async function readSettings() {
  const settings = await GymSettings.findOne({ key: 'primary' }).lean()
  const legacyPlaceholders = {
    tagline: ['Train harder. Live stronger.'],
    phone: ['+91 90000 00000'],
    address: ['Main Market Road'],
    openingHours: ['Daily · 5:00 AM—11:00 PM'],
    instagramUrl: [''],
  }
  return Object.fromEntries(allowedFields.map((field) => {
    const savedValue = settings?.[field]
    return [field, savedValue == null || legacyPlaceholders[field]?.includes(savedValue) ? defaults[field] : savedValue]
  }))
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
