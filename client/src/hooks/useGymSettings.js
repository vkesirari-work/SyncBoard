import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export const defaultGymSettings = {
  gymName: 'Sirari Fitness', tagline: 'Train harder. Live stronger.', phone: '+91 90000 00000',
  email: '', address: 'Main Market Road', openingHours: 'Daily · 5:00 AM—11:00 PM', gstNumber: '',
  logoUrl: '', instagramUrl: '', receiptFooter: 'Thank you for choosing Sirari Fitness.',
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
