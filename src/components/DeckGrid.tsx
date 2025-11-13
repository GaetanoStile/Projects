import { useMemo } from 'react'
import { useGameStore, Card } from '@/state/store'
import CardComponent from './Card'
import cardsData from '@/data/cards.json'

export default function DeckGrid() {
  const { currentPlayer, blackUnlocked, usedCardIds, drawFrom, applyCardEffects } = useGameStore()

  const availableCards = useMemo(() => cardsData as Card[], [])

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
        (card.playerColor === playerColor || card.playerColor === 'neutral') &&
        !usedCardIds.has(card.id)
    ).length
  }

  const handleDeckClick = (deck: 'A' | 'B' | 'C' | 'D' | 'black') => {
    if (!currentPlayer) return

    const drawnCard = drawFrom(deck, currentPlayer, availableCards)
    if (drawnCard) {
      applyCardEffects(drawnCard)
    }
  }

  if (!currentPlayer) {
    return null
  }

  const decks = ['A', 'B', 'C', 'D'] as const

  return (
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
          />
        )
      })}

      {/* Black Deck - shown in center when unlocked */}
      {blackUnlocked && (
        <div className="col-span-2 md:col-span-4 flex justify-center">
          <CardComponent
            letter="★"
            onClick={() => handleDeckClick('black')}
            disabled={getRemainingCount('black', currentPlayer) === 0}
            remainingCount={getRemainingCount('black', currentPlayer)}
            isBlack={true}
          />
        </div>
      )}
    </div>
  )
}

