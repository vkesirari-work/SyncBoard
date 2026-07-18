import { Outlet } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './AppLayout.css'

gsap.registerPlugin(useGSAP)

function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const shellRef = useRef(null)
  const pageRef = useRef(null)
  const { pathname } = useLocation()

  useGSAP(() => {
    if (import.meta.env.MODE === 'test') return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduceMotion) return

    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

    timeline
      .fromTo('.page-wrap > *', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.58 })
      .fromTo(
        '.page-header > *, .stats-grid > *, .dashboard-grid > *',
        { autoAlpha: 0, y: 18, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.52, stagger: 0.055 },
        '-=0.35',
      )
  }, { scope: pageRef, dependencies: [pathname], revertOnUpdate: true })

  function moveAmbientLight(event) {
    if (!shellRef.current || event.pointerType === 'touch') return
    const bounds = shellRef.current.getBoundingClientRect()
    shellRef.current.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`)
    shellRef.current.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`)
  }

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
    <div ref={shellRef} className="app-shell motion-ready bg-slate-950 antialiased selection:bg-emerald-300 selection:text-slate-950" onPointerMove={moveAmbientLight}>
      <a className="skip-link" href="#dashboard-content">Skip to main content</a>
      <div className="dashboard-ambient" aria-hidden="true"><span /><span /><span /></div>
      <Sidebar isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} />
      <button
        aria-label="Close navigation"
        className={`sidebar-scrim ${isNavigationOpen ? 'visible' : ''}`}
        type="button"
        onClick={() => setIsNavigationOpen(false)}
      />
      <main className="app-main" id="dashboard-content">
        <Topbar onOpenNavigation={() => setIsNavigationOpen(true)} />
        <div ref={pageRef} className="page-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
