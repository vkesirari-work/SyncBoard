import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export const defaultGymSettings = {
  gymName: 'Sirari Fitness', tagline: 'Stronger starts here. Opening 2027.', phone: '9012752982',
  email: '', address: 'Sirari Complex, Charubeta, Chanda Mod, Khatima', openingHours: 'Monday–Saturday · 4:00 AM–11:00 PM · Sunday closed', gstNumber: '',
  logoUrl: '', instagramUrl: 'https://www.instagram.com/lifebyvke/', receiptFooter: 'Thank you for choosing Sirari Fitness.',
}

const legacySettings = {
  phone: new Set(['+91 90000 00000', '90000082', '+91 90127 52982']),
  address: new Set(['Main Market Road', 'khatima']),
  tagline: new Set(['Train harder. Live stronger.']),
  openingHours: new Set(['Daily · 5:00 AM—11:00 PM']),
}

export function resolveGymSettings(settings = {}) {
  return Object.fromEntries(Object.entries(defaultGymSettings).map(([field, fallback]) => {
    const savedValue = settings[field]
    return [field, savedValue == null || legacySettings[field]?.has(savedValue) ? fallback : savedValue]
  }))
}

export function useGymSettings() {
  const [settings, setSettings] = useState(defaultGymSettings)

  useEffect(() => {
    let active = true
    const load = () => api.get('/settings/public').then(({ data }) => { if (active) setSettings(resolveGymSettings(data.settings)) }).catch(() => {})
    load()
    window.addEventListener('gym-settings:updated', load)
    return () => { active = false; window.removeEventListener('gym-settings:updated', load) }
  }, [])

  return settings
}
