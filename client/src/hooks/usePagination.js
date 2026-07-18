import { useEffect, useMemo, useState } from 'react'

export function usePagination(items, { pageSize = 20, resetKey = '' } = {}) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => { setPage(1) }, [resetKey])
  useEffect(() => { setPage((current) => Math.min(current, pageCount)) }, [pageCount])

  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize])
  const from = items.length ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(page * pageSize, items.length)

  return { page, pageCount, pageItems, pageSize, setPage, from, to, total: items.length }
}

export function useServerPagination(total, { pageSize = 20, resetKey = '' } = {}) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => { setPage(1) }, [resetKey])
  useEffect(() => { setPage((current) => Math.min(current, pageCount)) }, [pageCount])

  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(page * pageSize, total)
  return { page, pageCount, pageSize, setPage, from, to, total }
}
