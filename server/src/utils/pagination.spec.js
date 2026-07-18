import { describe, expect, it } from 'vitest'
import { escapedSearch, paginationMeta, parsePagination, wantsPagination } from './pagination.js'

describe('pagination utilities', () => {
  it('normalizes unsafe page values and enforces a maximum limit', () => {
    expect(parsePagination({ page: '-4', limit: '999' })).toEqual({ page: 1, limit: 100, skip: 0 })
    expect(parsePagination({ page: '3', limit: '25' })).toEqual({ page: 3, limit: 25, skip: 50 })
    expect(paginationMeta(51, 3, 25)).toEqual({ page: 3, limit: 25, total: 51, pages: 3 })
    expect(wantsPagination({ page: '1' })).toBe(true)
    expect(wantsPagination({})).toBe(false)
  })

  it('escapes regular-expression syntax in user search', () => {
    const pattern = escapedSearch('Vikram.*')
    expect(pattern.test('Vikram.* Singh')).toBe(true)
    expect(pattern.test('Vikram Singh')).toBe(false)
  })
})
