import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type PlayerColor = 'red' | 'blue'

export interface Card {
  id: string
  title: string
  description: string
  deck: 'A' | 'B' | 'C' | 'D' | 'black'
  playerColor: PlayerColor | 'neutral'
  isSwapCard: boolean
}

interface GameState {
  currentPlayer: PlayerColor | null
  swapCount: { red: number; blue: number }
  blackUnlocked: boolean
  usedCardIds: Set<string>
  startingPlayer: PlayerColor | null
  selectedCard: Card | null
  isModalOpen: boolean
}

interface GameActions {
  startGame: (player: PlayerColor) => void
  drawFrom: (deck: 'A' | 'B' | 'C' | 'D' | 'black', playerColor: PlayerColor, availableCards: Card[]) => Card | null
  applyCardEffects: (card: Card) => void
  endTurn: () => void
  resetGame: () => void
  setSelectedCard: (card: Card | null) => void
  setIsModalOpen: (open: boolean) => void
}

const initialState: GameState = {
  currentPlayer: null,
  swapCount: { red: 0, blue: 0 },
  blackUnlocked: false,
  usedCardIds: new Set<string>(),
  startingPlayer: null,
  selectedCard: null,
  isModalOpen: false,
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startGame: (player: PlayerColor) => {
        set({
          currentPlayer: player,
          startingPlayer: player,
          swapCount: { red: 0, blue: 0 },
          blackUnlocked: false,
          usedCardIds: new Set<string>(),
          selectedCard: null,
          isModalOpen: false,
        })
      },

      drawFrom: (deck: 'A' | 'B' | 'C' | 'D' | 'black', playerColor: PlayerColor, availableCards: Card[]) => {
        const { usedCardIds } = get()
        
        // Filter cards by deck and player color, exclude used cards
        let filteredCards: Card[]
        if (deck === 'black') {
          // Black deck is neutral, available to both players
          filteredCards = availableCards.filter(
            (card) => card.deck === 'black' && !usedCardIds.has(card.id)
          )
        } else {
          filteredCards = availableCards.filter(
            (card) =>
              card.deck === deck &&
              (card.playerColor === playerColor || card.playerColor === 'neutral') &&
              !usedCardIds.has(card.id)
          )
        }

        if (filteredCards.length === 0) {
          return null
        }

        // Randomly select a card
        const randomIndex = Math.floor(Math.random() * filteredCards.length)
        const selectedCard = filteredCards[randomIndex]

        // Mark as used
        const newUsedCardIds = new Set(usedCardIds)
        newUsedCardIds.add(selectedCard.id)

        set({ usedCardIds: newUsedCardIds, selectedCard, isModalOpen: true })

        return selectedCard
      },

      applyCardEffects: (card: Card) => {
        if (card.isSwapCard) {
          const { currentPlayer, swapCount, blackUnlocked } = get()
          if (!currentPlayer) return

          const newSwapCount = { ...swapCount }
          newSwapCount[currentPlayer] += 1

          // Unlock black deck if current player has 3+ swaps
          const shouldUnlock = newSwapCount[currentPlayer] >= 3

          set({
            swapCount: newSwapCount,
            blackUnlocked: shouldUnlock || blackUnlocked,
          })
        }
      },

      endTurn: () => {
        const { currentPlayer } = get()
        if (currentPlayer) {
          set({ currentPlayer: currentPlayer === 'red' ? 'blue' : 'red' })
        }
      },

      resetGame: () => {
        set(initialState)
      },

      setSelectedCard: (card: Card | null) => {
        set({ selectedCard: card })
      },

      setIsModalOpen: (open: boolean) => {
        set({ isModalOpen: open })
      },
    }),
    {
      name: 'couples-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentPlayer: state.currentPlayer,
        swapCount: state.swapCount,
        blackUnlocked: state.blackUnlocked,
        usedCardIds: Array.from(state.usedCardIds),
        startingPlayer: state.startingPlayer,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert array back to Set
          state.usedCardIds = new Set(state.usedCardIds as unknown as string[])
        }
      },
    }
  )
)

