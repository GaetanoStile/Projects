import { useGameStore } from '@/state/store'

export default function Hud() {
  const { currentPlayer, swapInventory, settings } = useGameStore()

  if (!currentPlayer) {
    return null
  }

  // Per-player black deck access: based on cards currently held
  const blackAccessible = swapInventory[currentPlayer] >= 2

  // currentPlayer draws from decks = Performer; the other player is Blindfolded (Caller)
  const performerName =
    currentPlayer === 'red' ? settings.playerRedName : settings.playerBlueName
  const blindfoldedName =
    currentPlayer === 'red' ? settings.playerBlueName : settings.playerRedName
  const blindfoldedColor = currentPlayer === 'red' ? 'blue' : 'red'
  const performerColor = currentPlayer

  return (
    <div className="space-y-4">
      {/* Prominent role banner — hard to miss */}
      <div
        className="rounded-xl border-2 border-gold/40 bg-black/50 backdrop-blur-md p-4 md:p-5"
        style={{ boxShadow: '0 0 24px rgba(212, 175, 55, 0.15)' }}
        role="status"
        aria-live="polite"
      >
        <p className="text-center text-xs font-body text-gold uppercase tracking-[0.2em] mb-3 font-semibold">
          Who does what right now
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className={`rounded-lg px-4 py-3 text-center ${
              blindfoldedColor === 'red'
                ? 'bg-gradient-to-r from-red-700 to-red-900'
                : 'bg-gradient-to-r from-blue-700 to-blue-900'
            }`}
          >
            <div className="text-xs font-body text-white/70 uppercase tracking-wider mb-1">
              Blindfolded (Caller)
            </div>
            <div className="font-display text-2xl md:text-3xl text-white font-bold">
              {blindfoldedName}
            </div>
            <div className="text-sm font-body text-white/80 mt-1">
              Calls deck A, B, C, or D
            </div>
          </div>
          <div
            className={`rounded-lg px-4 py-3 text-center border ${
              performerColor === 'red'
                ? 'bg-red-950/80 border-red-400/40'
                : 'bg-blue-950/80 border-blue-400/40'
            }`}
          >
            <div className="text-xs font-body text-white/70 uppercase tracking-wider mb-1">
              Performer (draws cards)
            </div>
            <div className="font-display text-2xl md:text-3xl text-white font-bold">
              {performerName}
            </div>
            <div className="text-sm font-body text-white/80 mt-1">
              Draws the card and follows it
            </div>
          </div>
        </div>
      </div>

      {/* Swap inventory + black deck */}
      <div className="parchment-bg rounded-lg p-4 md:p-6 glow-warm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs font-body text-gold uppercase tracking-wider mb-1 font-semibold">
                Red Swap Cards
              </div>
              <div className="text-2xl font-display text-[#8b6914] font-bold">
                {swapInventory.red}
              </div>
            </div>
            <div className="w-px h-8 bg-gold/30" />
            <div className="text-center">
              <div className="text-xs font-body text-gold uppercase tracking-wider mb-1 font-semibold">
                Blue Swap Cards
              </div>
              <div className="text-2xl font-display text-[#8b6914] font-bold">
                {swapInventory.blue}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {blackAccessible ? (
              <>
                <span className="text-gold text-2xl">🔓</span>
                <span className="text-sm font-body text-gold font-semibold">
                  Black Deck Available
                </span>
              </>
            ) : (
              <>
                <span className="text-gold/50 text-2xl">🔒</span>
                <span className="text-sm font-body text-gold font-semibold">
                  Need 2 swaps to unlock Black Deck
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
