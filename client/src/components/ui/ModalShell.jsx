import { useEffect } from 'react'
import { createPortal } from 'react-dom'

function ModalShell({ children, onClose, className = '', labelledBy, isBusy = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !isBusy) onClose()
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isBusy, onClose])

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isBusy) onClose()
    }}>
      <section className={`modal-card ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </section>
    </div>,
    document.body,
  )
}

export default ModalShell
