import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

function Pagination({ pagination, label = 'records' }) {
  const { page, pageCount, pageSize, setPage, from, to, total } = pagination
  if (total <= pageSize) return null

  return (
    <nav className="pagination" aria-label={`${label} pagination`}>
      <p><strong>{from}–{to}</strong> of {total} {label}</p>
      <div>
        <button type="button" aria-label={`Previous ${label} page`} disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={16} /></button>
        <span>Page <strong>{page}</strong> / {pageCount}</span>
        <button type="button" aria-label={`Next ${label} page`} disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><ChevronRight size={16} /></button>
      </div>
    </nav>
  )
}

export default Pagination
