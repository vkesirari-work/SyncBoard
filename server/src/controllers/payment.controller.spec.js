import { describe, expect, it } from 'vitest'
import { pickAllowedPaymentFields } from './payment.controller.js'

describe('manual payment field protection', () => {
  const allowed = new Set(['member', 'amount', 'method', 'status', 'notes'])

  it('keeps allowed manual fields', () => {
    expect(pickAllowedPaymentFields({ member: 'm1', amount: 999, method: 'cash' }, allowed)).toEqual({ member: 'm1', amount: 999, method: 'cash' })
  })

  it('rejects gateway-owned and unknown fields', () => {
    expect(() => pickAllowedPaymentFields({ amount: 1, gatewayPaymentId: 'spoofed' }, allowed)).toThrow(/gatewayPaymentId/)
    expect(() => pickAllowedPaymentFields({ amount: 1, createdAt: new Date() }, allowed)).toThrow(/createdAt/)
  })
})
