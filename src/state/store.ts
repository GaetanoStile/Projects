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
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // If localStorage is corrupted, reset to initial state
          console.warn('Failed to rehydrate game state from localStorage, resetting:', error)
          return initialState
        }
        
        if (state) {
          try {
            // Validate and convert array back to Set
            if (Array.isArray(state.usedCardIds)) {
              state.usedCardIds = new Set(state.usedCardIds.filter((id: unknown) => typeof id === 'string'))
            } else {
              state.usedCardIds = new Set<string>()
            }
            
            // Validate currentPlayer
            if (state.currentPlayer !== 'red' && state.currentPlayer !== 'blue') {
              state.currentPlayer = null
            }
            
            // Validate swapCount structure
            if (!state.swapCount || typeof state.swapCount !== 'object') {
              state.swapCount = { red: 0, blue: 0 }
            } else {
              state.swapCount = {
                red: typeof state.swapCount.red === 'number' ? state.swapCount.red : 0,
                blue: typeof state.swapCount.blue === 'number' ? state.swapCount.blue : 0,
              }
            }
            
            // Validate blackUnlocked
            if (typeof state.blackUnlocked !== 'boolean') {
              state.blackUnlocked = false
            }
            
            // Validate startingPlayer
            if (state.startingPlayer !== 'red' && state.startingPlayer !== 'blue') {
              state.startingPlayer = null
            }
          } catch (err) {
            console.warn('Error validating rehydrated state, resetting:', err)
            return initialState
          }
        }
      },
    }
  )
)

