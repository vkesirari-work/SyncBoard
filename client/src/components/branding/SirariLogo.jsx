import './SirariLogo.css'

function SirariLogo({ className = '', compact = false, size = 44, title = 'Sirari Fitness' }) {
  return (
    <span className={`sirari-brand ${compact ? 'is-compact' : ''} ${className}`.trim()}>
      <svg className="sirari-brand-mark" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={`${title} logo`}>
        <rect width="64" height="64" rx="19" fill="currentColor" />
        <path d="M15 24h34M15 40h34" stroke="var(--sirari-logo-ink, #17130f)" strokeWidth="4" strokeLinecap="round" />
        <path d="M18 20v8M13 21.5v5M46 36v8M51 37.5v5" stroke="var(--sirari-logo-ink, #17130f)" strokeWidth="4" strokeLinecap="round" />
        <path d="M40.5 20.5H28.8c-5.1 0-8.3 2.5-8.3 6.2 0 3.8 3 5.2 8.7 6.3l5.7 1.1c5.9 1.2 8.6 3 8.6 6.7 0 4.2-3.8 7.2-10.1 7.2H21" fill="none" stroke="var(--sirari-logo-ink, #17130f)" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {!compact && <span className="sirari-brand-type"><strong>SIRARI</strong><small>FITNESS · 2027</small></span>}
    </span>
  )
}

export default SirariLogo
