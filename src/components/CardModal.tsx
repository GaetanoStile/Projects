import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Card } from '@/state/store'
import { useGameStore } from '@/state/store'
import { useAuthStore } from '@/state/authStore'
import cardFrontImage from '@/assets/card-front.png'

interface CardModalProps {
  card: Card | null
  isOpen: boolean
  onClose: () => void
}

export default function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const optionsPanelRef = useRef<HTMLDivElement>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  
  const { 
    removeCardFromSession, 
    setCardEnabled, 
    toggleFavorite,
    cloudCards
  } = useGameStore()
  const { mode, isAdmin } = useAuthStore()

  // Reset options panel when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowOptions(false)
      setFeedbackMessage(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('scroll-lock')
      
      // Focus trap: focus the close button when modal opens
      closeButtonRef.current?.focus()
      
      // ESC key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (showOptions) {
            setShowOptions(false)
          } else {
            onClose()
          }
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
  }, [isOpen, onClose, showOptions])

  // Focus trap: keep focus within modal or options panel
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const container = showOptions && optionsPanelRef.current ? optionsPanelRef.current : modalRef.current
    const focusableElements = container.querySelectorAll(
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

    container.addEventListener('keydown', handleTab)
    return () => container.removeEventListener('keydown', handleTab)
  }, [isOpen, showOptions])

  const handleRemoveFromSession = () => {
    if (!card) return
    removeCardFromSession(card.id)
    setFeedbackMessage('Removed for this session')
    setShowOptions(false)
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const handleDisableGlobally = async () => {
    if (!card) return

    // Check permissions
    const isGlobalCard = mode === 'cloud' && cloudCards.global.some(c => c.id === card.id)

    if (mode === 'cloud' && isGlobalCard && !isAdmin) {
      // Non-admin trying to disable global card - fallback to session removal
      setFeedbackMessage('Global disable requires admin. Removed for this session instead.')
      handleRemoveFromSession()
      return
    }

    if (!confirm('This will permanently disable this card. Continue?')) {
      return
    }

    await setCardEnabled(card.id, false)
    setFeedbackMessage('Card disabled globally')
    setShowOptions(false)
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const handleToggleFavorite = async () => {
    if (!card) return
    await toggleFavorite(card.id)
    setShowOptions(false)
  }

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
            {(() => {
              // Use card front image for all decks except black
              const isBlackDeck = card.deck === 'black'
              return (
                <motion.div
                  ref={modalRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="card-modal-title"
                  aria-describedby="card-modal-description"
                  className={`rounded-2xl max-w-md w-full relative pointer-events-auto ${
                    isBlackDeck ? 'parchment-bg glow-warm p-8 md:p-12' : ''
                  }`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    // Non-black decks: card front as background that stretches with content
                    ...(!isBlackDeck ? {
                      backgroundImage: `url(${cardFrontImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    } : {}),
                  }}
                >

                  {/* Ornate corners (black deck only) */}
                  {isBlackDeck && (
                    <>
                      <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-gold/60 rounded-tl-lg" />
                      <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-gold/60 rounded-tr-lg" />
                      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-gold/60 rounded-bl-lg" />
                      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-gold/60 rounded-br-lg" />
                    </>
                  )}

                  {/* Close button */}
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center transition-colors rounded-full z-10 ${
                      isBlackDeck
                        ? 'text-gold hover:text-crimson hover:bg-gold/10'
                        : 'text-stone-700 hover:text-black hover:bg-black/10'
                    }`}
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

                  {/* Options button */}
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className={`absolute top-4 right-16 w-10 h-10 flex items-center justify-center transition-colors rounded-full z-10 ${
                      isBlackDeck
                        ? 'text-gold/70 hover:text-gold hover:bg-gold/10'
                        : 'text-stone-600 hover:text-black hover:bg-black/10'
                    }`}
                    style={{ minWidth: '44px', minHeight: '44px' }}
                    aria-label="Card options"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>

                  {/* Feedback message */}
                  {feedbackMessage && (
                    <motion.div
                      className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gold/90 text-velvet px-4 py-2 rounded-lg text-sm font-body z-10"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {feedbackMessage}
                    </motion.div>
                  )}

                  {/* Options Panel */}
                  <AnimatePresence>
                    {showOptions && (
                      <motion.div
                        ref={optionsPanelRef}
                        className="absolute top-16 right-4 parchment-bg rounded-lg p-4 border-2 border-gold/30 shadow-lg z-20 min-w-[200px]"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-2">
                          <button
                            onClick={handleRemoveFromSession}
                            className="w-full text-left px-3 py-2 text-gold font-body hover:bg-gold/10 rounded transition-colors"
                          >
                            Remove for this session
                          </button>
                          <button
                            onClick={handleDisableGlobally}
                            className="w-full text-left px-3 py-2 text-gold font-body hover:bg-gold/10 rounded transition-colors"
                          >
                            Disable globally
                          </button>
                          <button
                            onClick={handleToggleFavorite}
                            className="w-full text-left px-3 py-2 text-gold font-body hover:bg-gold/10 rounded transition-colors flex items-center gap-2"
                          >
                            {card.isFavorite ? (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                Unfavorite
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                Favorite ⭐
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Content -- normal flow for both; background-image stretches for non-black */}
                  <div
                    className={`text-center space-y-4 relative z-[1] flex flex-col items-center justify-center ${
                      isBlackDeck ? '' : 'p-8 md:p-10'
                    }`}
                    style={!isBlackDeck ? { minHeight: '480px' } : undefined}
                  >
                    {card.imageDataUrl && (
                      <div className="mb-4">
                        <img
                          src={card.imageDataUrl}
                          alt={card.title}
                          className={`w-full max-h-48 object-contain rounded-lg mx-auto ${
                            isBlackDeck ? 'border border-gold/30' : 'border border-stone-400/30'
                          }`}
                        />
                      </div>
                    )}
                    
                    {card.isSwapCard && (
                      <div className={`text-sm font-body uppercase tracking-wider ${
                        isBlackDeck ? 'text-gold' : 'text-stone-700'
                      }`}>
                        {isBlackDeck ? '✨ Swap Card ✨' : '⚔ Swap Card ⚔'}
                      </div>
                    )}
                    
                    <h2
                      id="card-modal-title"
                      className={`text-2xl md:text-3xl font-display ${
                        isBlackDeck ? 'gold-text' : 'text-stone-900'
                      }`}
                    >
                      {card.title}
                    </h2>
                    
                    <p
                      id="card-modal-description"
                      className={`text-base md:text-lg font-body leading-relaxed ${
                        isBlackDeck ? 'text-gold' : 'text-stone-800'
                      }`}
                    >
                      {card.description}
                    </p>
                  </div>
                </motion.div>
              )
            })()}
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
