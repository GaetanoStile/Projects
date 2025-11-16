import { useGameStore } from '@/state/store'

export default function Hud() {
  const { currentPlayer, swapCount, blackUnlocked, settings } = useGameStore()

  if (!currentPlayer) {
    return null
  }

  return (
    <div className="parchment-bg rounded-lg p-4 md:p-6 glow-warm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Current Player Chip */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-body text-[#2d0a0e] uppercase tracking-wider font-semibold">Current Turn:</span>
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

        {/* Swap Counts */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs font-body text-[#2d0a0e] uppercase tracking-wider mb-1 font-semibold">Red Swaps</div>
            <div className="text-2xl font-display text-[#8b6914] font-bold">{swapCount.red}</div>
          </div>
          <div className="w-px h-8 bg-gold/30" />
          <div className="text-center">
            <div className="text-xs font-body text-[#2d0a0e] uppercase tracking-wider mb-1 font-semibold">Blue Swaps</div>
            <div className="text-2xl font-display text-[#8b6914] font-bold">{swapCount.blue}</div>
          </div>
        </div>

        {/* Black Deck Status */}
        <div className="flex items-center gap-2">
          {blackUnlocked ? (
            <>
              <span className="text-gold text-2xl">🔓</span>
              <span className="text-sm font-body text-[#2d0a0e] font-semibold">Black Deck Unlocked</span>
            </>
          ) : (
            <>
              <span className="text-gold/50 text-2xl">🔒</span>
              <span className="text-sm font-body text-[#2d0a0e] font-semibold">Locked (Need 3 swaps)</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

