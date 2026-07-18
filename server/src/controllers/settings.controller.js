import { env } from '../config/env.js'
import { GymSettings } from '../models/gym-settings.model.js'
import { emitDashboardUpdate } from '../realtime/socket.js'

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

const legacyPlaceholders = {
  tagline: ['Train harder. Live stronger.'],
  phone: ['+91 90000 00000', '90000082'],
  address: ['Main Market Road', 'khatima'],
  openingHours: ['Daily · 5:00 AM—11:00 PM'],
  instagramUrl: [''],
}

export function resolveSettings(settings = {}) {
  return Object.fromEntries(allowedFields.map((field) => {
    const savedValue = settings[field]
    return [field, savedValue == null || legacyPlaceholders[field]?.includes(savedValue) ? defaults[field] : savedValue]
  }))
}

export function validateSettingsUpdate(current, updates) {
  const merged = { ...current, ...updates }
  if (!merged.gymName || !merged.phone || !merged.address) {
    const error = new Error('Gym name, phone and address are required')
    error.status = 400
    throw error
  }
  return merged
}

async function readSettings() {
  const settings = await GymSettings.findOne({ key: 'primary' }).lean()
  return resolveSettings(settings || {})
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
    validateSettingsUpdate(await readSettings(), updates)
    const settings = await GymSettings.findOneAndUpdate(
      { key: 'primary' },
      { ...updates, updatedBy: request.user.id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
    emitDashboardUpdate(request, 'settings:updated', settings)
    response.json({ settings })
  } catch (error) { next(error) }
}
