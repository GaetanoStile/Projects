import { motion } from 'framer-motion'
import { useState } from 'react'
import type { DeckLetter, PlayerColor } from '@/state/store'

// Import red deck card back images
import redDeckA from '@/assets/card-backs/red-deck-a.png'
import redDeckB from '@/assets/card-backs/red-deck-b.png'
import redDeckC from '@/assets/card-backs/red-deck-c.png'
import redDeckD from '@/assets/card-backs/red-deck-d.png'

// Mapping for red deck card backs
const redDeckBacks: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: redDeckA,
  B: redDeckB,
  C: redDeckC,
  D: redDeckD,
}

interface CardProps {
  letter: string
  onClick?: () => void
  disabled?: boolean
  remainingCount?: number
  isBlack?: boolean
  playerColor?: PlayerColor | 'neutral' | 'any'
  deck?: DeckLetter
}

export default function Card({ 
  letter, 
  onClick, 
  disabled = false, 
  remainingCount, 
  isBlack = false,
  playerColor,
  deck
}: CardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    if (disabled || !onClick) return
    setIsFlipped(true)
    setTimeout(() => {
      onClick()
      setIsFlipped(false)
    }, 450)
  }

  // Determine if we should use a custom PNG card back
  const useCustomCardBack = 
    playerColor === 'red' && 
    deck && 
    (deck === 'A' || deck === 'B' || deck === 'C' || deck === 'D') &&
    redDeckBacks[deck]

  // Get the card back image if applicable
  const cardBackImage = useCustomCardBack ? redDeckBacks[deck as 'A' | 'B' | 'C' | 'D'] : null

  return (
    <motion.div
      className="card-perspective cursor-pointer"
      onClick={handleClick}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      style={{
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        willChange: isFlipped ? 'transform' : 'auto',
      }}
    >
      <motion.div
        className="relative w-24 h-32 md:w-32 md:h-44"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.43,
          ease: [0.2, 0.8, 0.2, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Card Back (showing by default) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {useCustomCardBack && cardBackImage ? (
            // Custom PNG card back for red decks A-D
            <div className="w-full h-full rounded-lg relative overflow-hidden">
              <img
                src={cardBackImage}
                alt={`${deck} deck card back`}
                className="w-full h-full object-cover"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              />
              {/* Remaining count overlay */}
              {remainingCount !== undefined && remainingCount > 0 && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-gold text-xs font-body px-2 py-1 rounded">
                  {remainingCount}
                </div>
              )}
            </div>
          ) : (
            // Default card back (for blue decks, black deck, or fallback)
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-parchment to-gold/20 flex items-center justify-center relative">
              <div className="text-2xl text-gold">✨</div>
              {/* Remaining count */}
              {remainingCount !== undefined && remainingCount > 0 && (
                <div className="absolute bottom-2 right-2 text-xs text-gold/80 font-body">
                  {remainingCount}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Front (revealed when flipped) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div
            className={`w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden ${
              isBlack ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-navy to-crimson'
            }`}
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.1)',
            }}
          >
            {/* Ornate frame effect */}
            <div className="absolute inset-2 border-2 border-gold rounded" style={{ borderStyle: 'double' }} />
            <div className="absolute inset-4 border border-gold/50 rounded" />
            
            {/* Letter */}
            <span
              className="text-6xl md:text-7xl font-display gold-text relative z-10"
              style={{
                textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
              }}
            >
              {letter}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
