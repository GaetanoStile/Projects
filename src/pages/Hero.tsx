import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Candle from '@/components/Candle'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <div className="candlelit-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Candles */}
      <div className="absolute top-20 left-10 md:left-20">
        <Candle size={50} />
      </div>
      <div className="absolute top-32 right-10 md:right-20">
        <Candle size={45} />
      </div>
      <div className="absolute bottom-40 left-1/4">
        <Candle size={40} />
      </div>
      <div className="absolute bottom-32 right-1/4">
        <Candle size={48} />
      </div>

      {/* Content */}
      <motion.div
        className="text-center z-10 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl md:text-8xl font-display gold-text mb-6">
          Couples Game
        </h1>
        <p className="text-xl md:text-2xl text-gold/80 font-body mb-12 max-w-2xl mx-auto">
          A romantic card game for two
        </p>

        <motion.button
          onClick={() => navigate('/settings')}
          className="px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-xl rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            minWidth: '200px',
            minHeight: '56px',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
          }}
        >
          Start Game
        </motion.button>
      </motion.div>

      {/* Rose petals effect (optional decorative elements) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 opacity-30">
          <div className="text-gold/30 text-2xl animate-float">🌹</div>
        </div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 opacity-30">
          <div className="text-gold/30 text-2xl animate-float" style={{ animationDelay: '1s' }}>🌹</div>
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-4 h-4 opacity-30">
          <div className="text-gold/30 text-2xl animate-float" style={{ animationDelay: '2s' }}>🌹</div>
        </div>
      </div>
    </div>
  )
}

