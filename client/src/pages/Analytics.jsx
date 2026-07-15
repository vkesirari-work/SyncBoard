import { BarChart3, CalendarDays, Download, IndianRupee, Radio, RefreshCw, Target, TrendingUp, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import './Analytics.css'

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const dateInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

function presetRange(days) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days + 1)
  return { from: dateInput(from), to: dateInput(to) }
}

function LineChart({ data, valueKey, color = '#059669', formatter = (value) => value }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const max = Math.max(...data.map((item) => item[valueKey]), 1)
  const coordinates = data.map((item, index) => ({ item, x: data.length === 1 ? 500 : (index / (data.length - 1)) * 1000, y: 205 - (item[valueKey] / max) * 180 }))
  const points = coordinates.map(({ x, y }) => `${x},${y}`).join(' ')
  const active = activeIndex === null ? null : coordinates[activeIndex]
  return <div className="analytics-line-chart" onMouseLeave={() => setActiveIndex(null)}><div className="chart-max">{formatter(max)}</div>{active && <div className={`chart-tooltip ${active.x < 80 ? 'edge-left' : active.x > 920 ? 'edge-right' : ''}`} style={{ left: `${active.x / 10}%`, top: `${active.y / 2.2}%` }}><span>{active.item.label}</span><strong>{formatter(active.item[valueKey])}</strong></div>}<svg viewBox="0 0 1000 220" preserveAspectRatio="none" role="img" aria-label={`${valueKey} trend`}><defs><linearGradient id={`fill-${valueKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".24" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs><polygon points={`0,220 ${points} 1000,220`} fill={`url(#fill-${valueKey})`} /><polyline points={points} fill="none" stroke={color} strokeWidth="7" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />{active && <line x1={active.x} x2={active.x} y1="18" y2="215" stroke={color} strokeWidth="2" strokeDasharray="8 8" opacity=".35" />}{coordinates.map(({ item, x, y }, index) => <g key={item.key} className="chart-point" onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} tabIndex="0" role="button" aria-label={`${item.label}: ${formatter(item[valueKey])}`}><circle cx={x} cy={y} r="22" fill="transparent" /><circle cx={x} cy={y} r={activeIndex === index ? 9 : 5} fill="#fff" stroke={color} strokeWidth={activeIndex === index ? 6 : 4} vectorEffect="non-scaling-stroke" /></g>)}</svg><div className="chart-labels">{data.map((item, index) => <span key={item.key} style={{ display: index % Math.ceil(data.length / 7) === 0 || index === data.length - 1 ? 'block' : 'none' }}>{item.label}</span>)}</div></div>
}

function Analytics() {
  const [range, setRange] = useState(() => presetRange(30))
  const [preset, setPreset] = useState('30')
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/admin/analytics', { params: range }); setAnalytics(data); setError('') }
    catch (requestError) { setError(requestError.response?.data?.message || 'Could not load analytics.') }
    finally { setLoading(false) }
  }, [range])

  useEffect(() => { loadAnalytics() }, [loadAnalytics])

  function choosePreset(days) { setPreset(String(days)); setRange(presetRange(days)) }
  function updateDate(event) { setPreset('custom'); setRange((current) => ({ ...current, [event.target.name]: event.target.value })) }

  function exportCsv() {
    if (!analytics) return
    const rows = [['Period', 'Revenue', 'Check-ins', 'New members', 'New leads'], ...analytics.series.map((item) => [item.label, item.revenue, item.checkIns, item.members, item.leads])]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = `sirari-analytics-${range.from}-to-${range.to}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const summaryCards = useMemo(() => analytics ? [
    { label: 'Paid revenue', value: currency.format(analytics.summary.revenue), icon: IndianRupee, hint: `${analytics.summary.paidTransactions} transactions` },
    { label: 'Check-ins', value: analytics.summary.checkIns, icon: Radio, hint: `${analytics.summary.averageVisitMinutes} min avg visit` },
    { label: 'New members', value: analytics.summary.newMembers, icon: Users, hint: `${analytics.summary.activeMembers} active total` },
    { label: 'Lead conversion', value: analytics.summary.leads ? `${Math.round(analytics.summary.convertedLeads / analytics.summary.leads * 100)}%` : '0%', icon: Target, hint: `${analytics.summary.convertedLeads} of ${analytics.summary.leads} leads` },
  ] : [], [analytics])

  const maxMethod = Math.max(...(analytics?.paymentMethods || []).map((item) => item.amount), 1)
  return <section className="page-stack analytics-page">
    <div className="page-header"><div className="page-title-row"><div className="page-title-icon"><BarChart3 size={22} /></div><div><p className="eyebrow">Business intelligence</p><h1>Analytics & reports</h1><p className="page-description">Track revenue, attendance, growth and lead performance.</p></div></div><button className="primary-button" type="button" disabled={!analytics} onClick={exportCsv}><Download size={17} /> Export CSV</button></div>
    <section className="panel analytics-filters"><div className="analytics-presets">{[7, 30, 90, 365].map((days) => <button className={preset === String(days) ? 'active' : ''} type="button" key={days} onClick={() => choosePreset(days)}>{days === 365 ? '1 year' : `${days} days`}</button>)}</div><div className="analytics-date-range"><CalendarDays size={17} /><label>From<input name="from" type="date" value={range.from} max={range.to} onChange={updateDate} /></label><span>to</span><label>To<input name="to" type="date" value={range.to} min={range.from} max={dateInput(new Date())} onChange={updateDate} /></label><button className="icon-button" type="button" title="Refresh" onClick={loadAnalytics}><RefreshCw size={17} /></button></div></section>
    {error && <p className="dashboard-notice error" role="alert">{error}</p>}
    <div className="analytics-summary">{summaryCards.map((card) => <article className={`analytics-stat ${loading ? 'is-loading' : ''}`} key={card.label}><div><card.icon size={19} /></div><span>{card.label}</span><strong>{loading ? '—' : card.value}</strong><small>{card.hint}</small></article>)}</div>
    {analytics && <><div className="analytics-chart-grid"><section className="panel analytics-chart-card wide"><div className="section-title"><div><p className="eyebrow">Cash flow</p><h2>Revenue trend</h2></div><strong>{currency.format(analytics.summary.revenue)}</strong></div><LineChart data={analytics.series} valueKey="revenue" formatter={(value) => currency.format(value)} /></section><section className="panel analytics-chart-card"><div className="section-title"><div><p className="eyebrow">Gym traffic</p><h2>Check-ins</h2></div></div><LineChart data={analytics.series} valueKey="checkIns" color="#2563eb" /></section></div>
    <div className="analytics-bottom-grid"><section className="panel analytics-chart-card"><div className="section-title"><div><p className="eyebrow">Acquisition</p><h2>Member growth</h2></div><TrendingUp size={20} /></div><LineChart data={analytics.series} valueKey="members" color="#7c3aed" /></section><section className="panel analytics-breakdown"><div className="section-title"><div><p className="eyebrow">Collection channels</p><h2>Payment methods</h2></div></div><div className="breakdown-list">{analytics.paymentMethods.map((item) => <div key={item.method}><span className="breakdown-label"><strong>{item.method.replaceAll('_', ' ')}</strong><b>{currency.format(item.amount)}</b></span><span className="breakdown-track"><i style={{ width: `${item.amount / maxMethod * 100}%` }} /></span></div>)}{!analytics.paymentMethods.length && <p className="empty-state">No paid transactions in this range.</p>}</div></section><section className="panel analytics-breakdown"><div className="section-title"><div><p className="eyebrow">Revenue mix</p><h2>Top plans</h2></div></div><div className="plan-revenue-list">{analytics.planRevenue.map((item, index) => <div key={item.plan}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.plan}</strong><b>{currency.format(item.amount)}</b></div>)}{!analytics.planRevenue.length && <p className="empty-state">No plan revenue in this range.</p>}</div></section></div></>}
    {loading && !analytics && <p className="empty-state">Building analytics report…</p>}
  </section>
}

export default Analytics
