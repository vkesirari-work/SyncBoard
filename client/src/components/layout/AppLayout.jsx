import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './AppLayout.css'

function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  useEffect(() => {
    if (!isNavigationOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsNavigationOpen(false)
    }

    document.body.classList.add('navigation-open')
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.classList.remove('navigation-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isNavigationOpen])

  return (
    <div className="app-shell bg-slate-950 antialiased selection:bg-emerald-300 selection:text-slate-950">
      <a className="skip-link" href="#dashboard-content">Skip to main content</a>
      <Sidebar isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} />
      <button
        aria-label="Close navigation"
        className={`sidebar-scrim ${isNavigationOpen ? 'visible' : ''}`}
        type="button"
        onClick={() => setIsNavigationOpen(false)}
      />
      <main className="app-main" id="dashboard-content">
        <Topbar onOpenNavigation={() => setIsNavigationOpen(true)} />
        <div className="page-wrap motion-safe:animate-[page-in_.45s_cubic-bezier(.2,.8,.2,1)_both]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
