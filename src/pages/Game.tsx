import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/state/store'
import DeckGrid from '@/components/DeckGrid'
import CardModal from '@/components/CardModal'
import Hud from '@/components/Hud'
import Candle from '@/components/Candle'

export default function Game() {
  const navigate = useNavigate()
  const { currentPlayer, selectedCard, isModalOpen, setIsModalOpen, resetGame, useSwapCard, activeSwapCard, endTurn } = useGameStore()

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/')
    }
  }, [currentPlayer, navigate])

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleUseSwapCard = () => {
    useSwapCard()
  }

  const handleEndTurn = () => {
    endTurn()
  }

  const handleEndGame = () => {
    if (confirm('Are you sure you want to end the game?')) {
      resetGame()
      navigate('/')
    }
  }

  if (!currentPlayer) {
    return null
  }

  return (
    <div className="candlelit-bg min-h-screen relative overflow-hidden">
      {/* Background Candles */}
      <div className="absolute top-10 left-5 md:left-10 opacity-30">
        <Candle size={40} />
      </div>
      <div className="absolute top-20 right-5 md:right-10 opacity-30">
        <Candle size={35} />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-30">
        <Candle size={38} />
      </div>
      <div className="absolute bottom-10 right-1/4 opacity-30">
        <Candle size={42} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-display gold-text mb-4">
            Couples Game
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-body">
            {currentPlayer === 'red' ? 'Red player' : 'Blue player'} - Choose a deck
          </p>
        </div>

        {/* HUD */}
        <div className="mb-8 md:mb-12">
          <Hud />
        </div>

        {/* Velvet Table Surface */}
        <div className="velvet-table rounded-2xl p-8 md:p-12 mb-8">
          <DeckGrid />
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center flex-wrap">
            {currentPlayer && activeSwapCard[currentPlayer] && (
              <button
                onClick={handleUseSwapCard}
                className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-body rounded-lg hover:from-gold/90 hover:to-gold/70 transition-all font-semibold"
                style={{
                  minWidth: '160px',
                  minHeight: '44px',
                }}
              >
                Use Swap Card
              </button>
            )}
            <button
              onClick={handleEndTurn}
              className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-body rounded-lg hover:from-gold/90 hover:to-gold/70 transition-all font-semibold"
              style={{
                minWidth: '160px',
                minHeight: '44px',
              }}
            >
              End Turn
            </button>
            <button
              onClick={handleEndGame}
              className="px-6 py-3 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors"
              style={{
                minWidth: '120px',
                minHeight: '44px',
              }}
            >
              End Game
            </button>
          </div>
        </div>
      </div>

      {/* Card Modal */}
      <CardModal card={selectedCard} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}

