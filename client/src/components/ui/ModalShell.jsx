import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const modalStack = []
let backgroundState = null

function ModalShell({ children, onClose, className = '', labelledBy, isBusy = false }) {
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const isBusyRef = useRef(isBusy)

  onCloseRef.current = onClose
  isBusyRef.current = isBusy

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current

    const handleKeyDown = (event) => {
      if (modalStack.at(-1) !== dialog) return

      if (event.key === 'Escape') {
        if (!isBusyRef.current) onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialog) return
      const focusableElements = [...dialog.querySelectorAll(focusableSelector)]
        .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true')

      if (!focusableElements.length) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements.at(-1)
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    if (modalStack.length === 0) {
      const appRoot = document.getElementById('root')
      if (appRoot) {
        backgroundState = {
          appRoot,
          hadInert: appRoot.hasAttribute('inert'),
          ariaHidden: appRoot.getAttribute('aria-hidden'),
        }
        appRoot.setAttribute('inert', '')
        appRoot.setAttribute('aria-hidden', 'true')
      }
    }
    modalStack.push(dialog)
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleKeyDown)

    if (dialog && !dialog.contains(document.activeElement)) {
      const initialFocus = dialog.querySelector('[autofocus]') || dialog.querySelector(focusableSelector)
      ;(initialFocus || dialog).focus()
    }

    return () => {
      const stackIndex = modalStack.lastIndexOf(dialog)
      if (stackIndex >= 0) modalStack.splice(stackIndex, 1)
      if (modalStack.length === 0) {
        document.body.classList.remove('modal-open')
        if (backgroundState?.appRoot) {
          if (!backgroundState.hadInert) backgroundState.appRoot.removeAttribute('inert')
          if (backgroundState.ariaHidden == null) backgroundState.appRoot.removeAttribute('aria-hidden')
          else backgroundState.appRoot.setAttribute('aria-hidden', backgroundState.ariaHidden)
        }
        backgroundState = null
      }
      window.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus()
    }
  }, [])

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isBusy) onClose()
    }}>
      <section ref={dialogRef} className={`modal-card ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}>
        {children}
      </section>
    </div>,
    document.body,
  )
}

export default ModalShell
