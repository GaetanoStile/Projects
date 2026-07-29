import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/state/store'
import { useSessionStore } from '@/state/sessionStore'
import { useAuthStore } from '@/state/authStore'
import DeckGrid from '@/components/DeckGrid'
import CardModal from '@/components/CardModal'
import HowToPlayModal from '@/components/HowToPlayModal'
import Hud from '@/components/Hud'
import gameplayBackground from '@/assets/gameplay-background.png'
import { playButtonClickSoundFromEvent } from '@/lib/sound'
import { useGameplayMusic } from '@/hooks/useGameplayMusic'
import { useFavorites } from '@/hooks/useFavorites'

type SaveStatus = 'idle' | 'saving' | 'saved'

export default function Game() {
  const navigate = useNavigate()
  const {
    currentPlayer,
    selectedCard,
    isModalOpen,
    setIsModalOpen,
    resetGame,
    useSwapCard,
    swapInventory,
    settings,
    setSettings,
  } = useGameStore()

  const { saveCurrentSession, markSessionComplete, isSaving } = useSessionStore()
  const { isAuthenticated } = useAuthStore()

  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const savedDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useGameplayMusic(settings.musicEnabled)
  useFavorites()

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/')
    }
  }, [currentPlayer, navigate])

  const showSaved = () => {
    setSaveStatus('saved')
    if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
    savedDisplayTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
  }

  useEffect(() => {
    return () => {
      if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
    }
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleUseSwapCard = async () => {
    useSwapCard()
    if (isAuthenticated) {
      setSaveStatus('saving')
      await saveCurrentSession()
      showSaved()
    }
  }

  const handleEndGame = async () => {
    if (confirm('Are you sure you want to end the game?')) {
      if (isAuthenticated) {
        await markSessionComplete()
      }
      resetGame()
      navigate('/')
    }
  }

  if (!currentPlayer) {
    return null
  }

  const savedLabel =
    saveStatus === 'saving' || isSaving
      ? 'Saving…'
      : saveStatus === 'saved'
      ? 'Saved'
      : null

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${gameplayBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onPointerDownCapture={playButtonClickSoundFromEvent}
    >
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <label
            className="absolute top-0 left-0 flex items-center gap-2 cursor-pointer text-gold/90 font-body text-sm select-none"
            style={{ minHeight: '44px' }}
          >
            <input
              type="checkbox"
              checked={settings.musicEnabled}
              onChange={(e) => setSettings({ musicEnabled: e.target.checked })}
              className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
            />
            <span className="hidden sm:inline">Music</span>
          </label>

          {/* Save indicator */}
          {isAuthenticated && savedLabel && (
            <span
              className="absolute top-0 left-16 text-xs text-gold/50 font-body flex items-center"
              style={{ minHeight: '44px' }}
            >
              {savedLabel}
            </span>
          )}

          <button
            onClick={() => setShowHowToPlay(true)}
            className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center text-gold/50 hover:text-gold hover:bg-gold/10 transition-colors rounded-full font-display text-lg"
            title="How to Play"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            ?
          </button>
          <h1 className="text-4xl md:text-6xl font-display gold-text mb-4">
            Couples Game
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-body">
            {(currentPlayer === 'red' ? settings.playerBlueName : settings.playerRedName)} is
            blindfolded — call a deck
          </p>
        </div>

        {/* HUD */}
        <div className="mb-8 md:mb-12">
          <Hud />
        </div>

        {/* Card Table Surface */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 md:p-12 mb-8">
          <DeckGrid />
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center flex-wrap">
            {currentPlayer && swapInventory[currentPlayer] >= 1 && (
              <button
                onClick={handleUseSwapCard}
                className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-body rounded-lg hover:from-gold/90 hover:to-gold/70 transition-all font-semibold"
                style={{
                  minWidth: '160px',
                  minHeight: '44px',
                }}
              >
                Use Swap Card ({swapInventory[currentPlayer]})
              </button>
            )}
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

      {/* How To Play Modal */}
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </div>
  )
}
