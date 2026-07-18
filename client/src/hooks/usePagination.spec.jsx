import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Pagination from '../components/ui/Pagination'
import { usePagination, useServerPagination } from './usePagination'

function PaginationHarness() {
  const items = Array.from({ length: 21 }, (_, index) => `Member ${index + 1}`)
  const pagination = usePagination(items)

  return <div>
    <ul>{pagination.pageItems.map((item) => <li key={item}>{item}</li>)}</ul>
    <Pagination pagination={pagination} label="members" />
  </div>
}

function ServerPaginationHarness() {
  const pagination = useServerPagination(45)
  return <Pagination pagination={pagination} label="payments" />
}

describe('usePagination', () => {
  it('limits large collections and moves between accessible pages', () => {
    render(<PaginationHarness />)

    expect(screen.getByText('Member 20')).toBeInTheDocument()
    expect(screen.queryByText('Member 21')).not.toBeInTheDocument()
    expect(screen.getByText(/1–20/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next members page' }))

    expect(screen.getByText('Member 21')).toBeInTheDocument()
    expect(screen.queryByText('Member 1')).not.toBeInTheDocument()
    expect(screen.getByText(/21–21/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next members page' })).toBeDisabled()
  })

  it('drives pagination from a server-provided total', () => {
    render(<ServerPaginationHarness />)
    expect(screen.getByText(/1–20/)).toBeInTheDocument()
    expect(screen.getByText(/Page/)).toHaveTextContent('Page 1 / 3')
  })
})
