import { describe, expect, it } from 'vitest'
import { sanitizeLeadInput } from './lead.controller.js'

describe('lead input protection', () => {
  it('forces anonymous leads into the website/new pipeline and drops privileged fields', () => {
    expect(sanitizeLeadInput({
      name: 'Public Lead',
      phone: '9012752982',
      status: 'converted',
      source: 'forged-admin',
      createdAt: '2000-01-01',
    }, { isPublic: true })).toEqual({
      name: 'Public Lead',
      phone: '9012752982',
      source: 'website',
      status: 'new',
    })
  })

  it('allows the protected dashboard flow to set operational lead fields only', () => {
    expect(sanitizeLeadInput({ name: 'Admin Lead', phone: '1', source: 'walk-in', status: 'contacted', owner: true })).toEqual({
      name: 'Admin Lead',
      phone: '1',
      source: 'walk-in',
      status: 'contacted',
    })
  })
})
