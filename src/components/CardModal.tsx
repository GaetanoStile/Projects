import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Card } from '@/state/store'

interface CardModalProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
}

export default function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('scroll-lock')
      
      // Focus trap: focus the close button when modal opens
      closeButtonRef.current?.focus()
      
      // ESC key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.body.classList.remove('scroll-lock')
        document.removeEventListener('keydown', handleEscape)
      }
    } else {
      document.body.classList.remove('scroll-lock')
    }
  }, [isOpen, onClose])

  // Focus trap: keep focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const modal = modalRef.current
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    modal.addEventListener('keydown', handleTab)
    return () => modal.removeEventListener('keydown', handleTab)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && card && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="card-modal-title"
              aria-describedby="card-modal-description"
              className="parchment-bg rounded-2xl p-8 md:p-12 max-w-md w-full relative pointer-events-auto glow-warm"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              style={{
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Ornate corners */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-gold/60 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-gold/60 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-gold/60 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-gold/60 rounded-br-lg" />

              {/* Close button */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gold hover:text-crimson transition-colors rounded-full hover:bg-gold/10"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Close modal"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Content */}
              <div className="text-center space-y-6">
                {card.isSwapCard && (
                  <div className="text-gold text-sm font-body uppercase tracking-wider">
                    ✨ Swap Card ✨
                  </div>
                )}
                
                <h2 id="card-modal-title" className="text-3xl md:text-4xl font-display gold-text">
                  {card.title}
                </h2>
                
                <p id="card-modal-description" className="text-lg md:text-xl text-velvet font-body leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

