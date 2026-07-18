import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import './GlobalSearch.css'

function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return undefined
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      try {
        const { data } = await api.get('/admin/search', { params: { q: query.trim() }, signal: controller.signal })
        setResults(data.results)
        setIsOpen(true)
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') setResults([])
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }, 300)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query])

  function openResult(result) {
    navigate(`${result.path}?search=${encodeURIComponent(result.searchTerm || query.trim())}`)
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
