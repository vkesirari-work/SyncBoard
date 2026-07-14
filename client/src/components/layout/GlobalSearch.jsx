import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ members: [], leads: [], payments: [], plans: [], trainers: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) return
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      try {
        const [members, leads, payments, plans, trainers] = await Promise.all([
          api.get('/members'), api.get('/leads'), api.get('/payments'), api.get('/plans'), api.get('/trainers'),
        ])
        setData({ members: members.data.members, leads: leads.data.leads, payments: payments.data.payments, plans: plans.data.plans, trainers: trainers.data.trainers })
        setIsOpen(true)
      } catch {
        setData({ members: [], leads: [], payments: [], plans: [], trainers: [] })
      } finally {
        setIsLoading(false)
      }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const results = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (search.length < 2) return []
    const matches = (values) => values.some((value) => value?.toString().toLowerCase().includes(search))
    return [
      ...data.members.filter((item) => matches([item.name, item.phone, item.email, item.plan?.name])).slice(0, 4).map((item) => ({ id: item._id, type: 'Member', title: item.name, detail: item.phone, path: '/dashboard/members' })),
      ...data.leads.filter((item) => matches([item.name, item.phone, item.email, item.fitnessGoal])).slice(0, 4).map((item) => ({ id: item._id, type: 'Lead', title: item.name, detail: item.phone, path: '/dashboard/leads' })),
      ...data.payments.filter((item) => matches([item.member?.name, item.member?.phone, item.reference, item.amount])).slice(0, 4).map((item) => ({ id: item._id, type: 'Payment', title: item.member?.name || 'Payment', detail: `₹${item.amount.toLocaleString('en-IN')} · ${item.status}`, path: '/dashboard/payments' })),
      ...data.plans.filter((item) => matches([item.name, item.price, item.durationMonths])).slice(0, 4).map((item) => ({ id: item._id, type: 'Plan', title: item.name, detail: `₹${item.price.toLocaleString('en-IN')}`, path: '/dashboard/plans' })),
      ...data.trainers.filter((item) => matches([item.name, item.phone, item.email, ...(item.specialties || [])])).slice(0, 4).map((item) => ({ id: item._id, type: 'Trainer', title: item.name, detail: item.specialties?.join(', ') || item.phone, path: '/dashboard/trainers' })),
    ].slice(0, 10)
  }, [data, query])

  function openResult(result) {
    navigate(`${result.path}?search=${encodeURIComponent(query.trim())}`)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="global-search">
      <div className="search-box">
        <Search size={18} />
        <input aria-label="Search all gym data" placeholder="Search members, leads, payments, plans, trainers" value={query} onChange={(event) => { setQuery(event.target.value); setIsOpen(event.target.value.trim().length >= 2) }} onFocus={() => query.trim().length >= 2 && setIsOpen(true)} />
        {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setIsOpen(false) }}><X size={16} /></button>}
      </div>
      {isOpen && (
        <div className="global-search-results">
          {isLoading && <p>Searching…</p>}
          {!isLoading && results.map((result) => <button type="button" key={`${result.type}-${result.id}`} onClick={() => openResult(result)}><span>{result.type}</span><div><strong>{result.title}</strong><small>{result.detail}</small></div></button>)}
          {!isLoading && results.length === 0 && <p>No matching records.</p>}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
