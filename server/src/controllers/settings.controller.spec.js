import { describe, expect, it } from 'vitest'
import { resolveSettings, validateSettingsUpdate } from './settings.controller.js'

describe('gym settings compatibility and partial updates', () => {
  it('replaces known legacy placeholders with the approved business details', () => {
    expect(resolveSettings({ phone: '90000082', address: 'khatima' })).toMatchObject({
      phone: '+91 90127 52982',
      address: 'Sirari Complex, Charubeta, Chanda Mod, Khatima',
    })
  })

  it('accepts a partial update when required values already exist', () => {
    expect(validateSettingsUpdate(
      { gymName: 'Sirari Fitness', phone: '9012752982', address: 'Khatima' },
      { tagline: 'Opening soon' },
    )).toMatchObject({ tagline: 'Opening soon', gymName: 'Sirari Fitness' })
  })

  it('rejects a partial update that would clear a required value', () => {
    expect(() => validateSettingsUpdate(
      { gymName: 'Sirari Fitness', phone: '9012752982', address: 'Khatima' },
      { phone: '' },
    )).toThrow(/required/)
  })
})
