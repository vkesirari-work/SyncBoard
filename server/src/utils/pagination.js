export function parsePagination(query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit))
  return { page, limit, skip: (page - 1) * limit }
}

export function wantsPagination(query = {}) {
  return query.page !== undefined || query.limit !== undefined
}

export function paginationMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
}

export function escapedSearch(value, maxLength = 80) {
  const normalized = String(value || '').trim().slice(0, maxLength)
  return normalized ? new RegExp(normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null
}
