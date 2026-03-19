import { useGameStore } from '@/state/store'

export default function Hud() {
  const { currentPlayer, swapInventory, settings } = useGameStore()

  if (!currentPlayer) {
    return null
  }

  // Per-player black deck access: based on cards currently held
  const blackAccessible = swapInventory[currentPlayer] >= 2

  return (
    <div className="parchment-bg rounded-lg p-4 md:p-6 glow-warm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Current Player Chip */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-body text-gold uppercase tracking-wider font-semibold">Current Turn:</span>
          <div
            className={`px-4 py-2 rounded-full font-display text-lg ${
              currentPlayer === 'red'
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
            }`}
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            {currentPlayer === 'red' 
              ? `${settings.playerRedName} (Red)` 
              : `${settings.playerBlueName} (Blue)`}
          </div>
        </div>

        {/* Swap Card Inventory */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs font-body text-gold uppercase tracking-wider mb-1 font-semibold">Red Swap Cards</div>
            <div className="text-2xl font-display text-[#8b6914] font-bold">{swapInventory.red}</div>
          </div>
          <div className="w-px h-8 bg-gold/30" />
          <div className="text-center">
            <div className="text-xs font-body text-gold uppercase tracking-wider mb-1 font-semibold">Blue Swap Cards</div>
            <div className="text-2xl font-display text-[#8b6914] font-bold">{swapInventory.blue}</div>
          </div>
        </div>

        {/* Black Deck Status (per-player) */}
        <div className="flex items-center gap-2">
          {blackAccessible ? (
            <>
              <span className="text-gold text-2xl">🔓</span>
              <span className="text-sm font-body text-gold font-semibold">Black Deck Available</span>
            </>
          ) : (
            <>
              <span className="text-gold/50 text-2xl">🔒</span>
              <span className="text-sm font-body text-gold font-semibold">Need 2 swaps to unlock Black Deck</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

