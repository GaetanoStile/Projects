import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HowToPlayContent from '@/components/HowToPlayContent'

interface HowToPlayModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('scroll-lock')
      closeButtonRef.current?.focus()

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="How To Play"
              className="parchment-bg rounded-2xl max-w-lg w-full relative pointer-events-auto max-h-[85vh] overflow-y-auto p-6 md:p-10"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
            >
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gold hover:text-crimson hover:bg-gold/10 transition-colors rounded-full z-10"
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label="Close"
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
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <HowToPlayContent />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
