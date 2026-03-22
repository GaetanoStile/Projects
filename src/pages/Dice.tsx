import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGameStore } from '@/state/store'
import { playDiceRollSound } from '@/lib/sound'

/** Served from [public/dice-background.png](/dice-background.png) so the asset is always resolvable (Vite public root). */
const DICE_PAGE_BG = '/dice-background.png'

export default function Dice() {
  const navigate = useNavigate()
  const { startGame, settings } = useGameStore()
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [canStart, setCanStart] = useState(false)

  const rollDice = () => {
    if (isRolling) return

    playDiceRollSound()
    setIsRolling(true)
    setResult(null)
    setCanStart(false)

    // Simulate dice roll
    const rollDuration = 2000

    const rollInterval = setInterval(() => {
      setResult(Math.floor(Math.random() * 6) + 1)
    }, 100)

    setTimeout(() => {
      clearInterval(rollInterval)
      const finalResult = Math.floor(Math.random() * 6) + 1
      setResult(finalResult)
      setIsRolling(false)
      setCanStart(true)
    }, rollDuration)
  }

  const handleStartGame = () => {
    if (!result || !canStart) return

    // Even = blue (male) goes first, Odd = red (female) goes first
    const startingPlayer = result % 2 === 0 ? 'blue' : 'red'
    startGame(startingPlayer)
    navigate('/game')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${DICE_PAGE_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="text-center z-10 px-4">
        <p
          className="text-lg md:text-xl text-white/95 font-body mb-12 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
        >
          Highest roller goes first
        </p>

        {/* Dice */}
        <motion.div
          className="mb-12"
          animate={
            isRolling
              ? {
                  rotateX: [0, 360, 720],
                  rotateY: [0, 360, 720],
                  rotateZ: [0, 180, 360],
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{
            duration: 0.6,
            repeat: isRolling ? Infinity : 0,
            ease: 'easeInOut',
          }}
          style={{
            willChange: isRolling ? 'transform' : 'auto',
          }}
        >
          <div
            className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-parchment to-gold/30 rounded-xl flex items-center justify-center glow-warm"
            style={{
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            {result ? (
              <span className="text-6xl md:text-8xl font-display text-velvet">
                {result}
              </span>
            ) : (
              <span className="text-4xl text-gold/50">?</span>
            )}
          </div>
        </motion.div>

        {/* Roll Button */}
        {!canStart && (
          <motion.button
            onClick={rollDice}
            disabled={isRolling}
            className="px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-xl rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={!isRolling ? { scale: 1.05 } : {}}
            whileTap={!isRolling ? { scale: 0.95 } : {}}
            style={{
              minWidth: '200px',
              minHeight: '56px',
            }}
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </motion.button>
        )}

        {/* Result and Start Button */}
        {result && canStart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-2xl md:text-3xl font-display gold-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              {result % 2 === 0 
                ? `${settings.playerBlueName} goes first!` 
                : `${settings.playerRedName} goes first!`}
            </div>
            <motion.button
              onClick={handleStartGame}
              className="px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-xl rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                minWidth: '200px',
                minHeight: '56px',
              }}
            >
              Start Game
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

