import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export const defaultGymSettings = {
  gymName: 'Sirari Fitness', tagline: 'Stronger starts here. Opening 2027.', phone: '+91 90127 52982',
  email: '', address: 'Sirari Complex, Charubeta, Chanda Mod, Khatima', openingHours: 'Monday–Saturday · 4:00 AM–11:00 PM · Sunday closed', gstNumber: '',
  logoUrl: '', instagramUrl: 'https://www.instagram.com/lifebyvke/', receiptFooter: 'Thank you for choosing Sirari Fitness.',
}

export function useGymSettings() {
  const [settings, setSettings] = useState(defaultGymSettings)

  useEffect(() => {
    let active = true
    const load = () => api.get('/settings/public').then(({ data }) => { if (active) setSettings({ ...defaultGymSettings, ...data.settings }) }).catch(() => {})
    load()
    window.addEventListener('gym-settings:updated', load)
    return () => { active = false; window.removeEventListener('gym-settings:updated', load) }
  }, [])

  return settings
}
