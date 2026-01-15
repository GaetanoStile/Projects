import { useMemo } from 'react'
import { useGameStore } from '@/state/store'
import CardComponent from './Card'

export default function DeckGrid() {
  const { currentPlayer, blackUnlocked, usedCardIds, drawFrom, applyCardEffects, mergeDecksForPlayer } = useGameStore()

  const availableCards = useMemo(() => {
    if (!currentPlayer) return []
    return mergeDecksForPlayer(currentPlayer)
  }, [currentPlayer, mergeDecksForPlayer])

  const getRemainingCount = (deck: 'A' | 'B' | 'C' | 'D' | 'black', playerColor: 'red' | 'blue') => {
    if (deck === 'black') {
      // Black deck is neutral, available to both players
      return availableCards.filter(
        (card) => card.deck === 'black' && !usedCardIds.has(card.id)
      ).length
    }
    return availableCards.filter(
      (card) =>
        card.deck === deck &&
        (card.playerColor === playerColor || card.playerColor === 'neutral' || card.playerColor === 'any') &&
        !usedCardIds.has(card.id)
    ).length
  }

  const handleDeckClick = (deck: 'A' | 'B' | 'C' | 'D' | 'black') => {
    if (!currentPlayer) return
    
    // Guard: Don't allow drawing from black deck if locked
    if (deck === 'black' && !blackUnlocked) {
      return
    }

    const drawnCard = drawFrom(deck, currentPlayer, availableCards)
    if (drawnCard) {
      applyCardEffects(drawnCard)
    }
  }

  if (!currentPlayer) {
    return null
  }

  const decks = ['A', 'B', 'C', 'D'] as const
  
  // Check if all main decks are exhausted
  const allDecksExhausted = decks.every(deck => getRemainingCount(deck, currentPlayer) === 0)
  const blackDeckRemaining = blackUnlocked ? getRemainingCount('black', currentPlayer) : 0
  const allDecksEmpty = allDecksExhausted && blackDeckRemaining === 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 justify-items-center">
        {decks.map((deck) => {
          const remaining = getRemainingCount(deck, currentPlayer)
          const isDisabled = remaining === 0

          return (
            <CardComponent
              key={deck}
              letter={deck}
              onClick={() => handleDeckClick(deck)}
              disabled={isDisabled}
              remainingCount={remaining}
              playerColor={currentPlayer}
              deck={deck}
            />
          )
        })}

        {/* Black Deck - shown in center when unlocked */}
        {blackUnlocked && (
          <div className="col-span-2 md:col-span-4 flex justify-center">
            <div className="relative group">
              <CardComponent
                letter="★"
                onClick={() => handleDeckClick('black')}
                disabled={getRemainingCount('black', currentPlayer) === 0}
                remainingCount={getRemainingCount('black', currentPlayer)}
                isBlack={true}
                deck="black"
              />
              {getRemainingCount('black', currentPlayer) === 0 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-velvet text-gold text-xs px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Black deck is empty
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Deck Exhaustion Message */}
      {allDecksEmpty && (
        <div className="text-center py-6">
          <div className="parchment-bg rounded-lg p-6 glow-warm inline-block">
            <p className="text-lg md:text-xl font-display gold-text mb-2">
              All decks are empty!
            </p>
            <p className="text-sm md:text-base text-gold font-body">
              Switch players or end the game
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
