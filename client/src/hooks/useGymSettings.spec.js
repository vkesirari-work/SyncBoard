import { describe, expect, it } from 'vitest'
import { resolveGymSettings } from './useGymSettings'

describe('resolveGymSettings', () => {
  it('replaces legacy live settings with the approved public details', () => {
    expect(resolveGymSettings({
      gymName: 'Sirari Fitness',
      phone: '90000082',
      address: 'khatima',
    })).toMatchObject({
      gymName: 'Sirari Fitness',
      phone: '9012752982',
      address: 'Sirari Complex, Charubeta, Chanda Mod, Khatima',
    })
  })

  it('preserves real settings saved by the owner', () => {
    expect(resolveGymSettings({ address: 'Custom Gym Address', phone: '9999999999' })).toMatchObject({
      address: 'Custom Gym Address',
      phone: '9999999999',
    })
  })
})
