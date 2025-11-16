import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import cardsData from '@/data/cards.json'

export type DeckLetter = 'A' | 'B' | 'C' | 'D' | 'black'
export type PlayerColor = 'red' | 'blue' | 'any'

export interface Card {
  id: string
  title: string
  description: string
  deck: DeckLetter
  playerColor: PlayerColor | 'neutral'
  isSwapCard?: boolean
  isCustom?: boolean
  imageDataUrl?: string
}

export interface Settings {
  playerRedName: string
  playerBlueName: string
  includeCustomRed: boolean
  includeCustomBlue: boolean
}

interface GameState {
  currentPlayer: 'red' | 'blue' | null
  swapCount: { red: number; blue: number }
  activeSwapCard: { red: boolean; blue: boolean }
  blackUnlocked: boolean
  usedCardIds: Set<string>
  startingPlayer: 'red' | 'blue' | null
  selectedCard: Card | null
  isModalOpen: boolean
  settings: Settings
  customCards: Card[]
}

interface GameActions {
  startGame: (player: 'red' | 'blue') => void
  drawFrom: (deck: DeckLetter, playerColor: 'red' | 'blue', availableCards: Card[]) => Card | null
  applyCardEffects: (card: Card) => void
  useSwapCard: () => void
  endTurn: () => void
  resetGame: () => void
  setSelectedCard: (card: Card | null) => void
  setIsModalOpen: (open: boolean) => void
  setSettings: (settings: Partial<Settings>) => void
  addCustomCard: (card: Card) => void
  deleteCustomCard: (id: string) => void
  clearCustomCards: () => void
  mergeDecksForPlayer: (player: 'red' | 'blue') => Card[]
}

const defaultSettings: Settings = {
  playerRedName: 'Natalie',
  playerBlueName: 'Jordan',
  includeCustomRed: true,
  includeCustomBlue: true,
}

// Load settings from localStorage with migration
const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem('cg.settings.v2')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        playerRedName: parsed.playerRedName || defaultSettings.playerRedName,
        playerBlueName: parsed.playerBlueName || defaultSettings.playerBlueName,
        includeCustomRed: parsed.includeCustomRed !== undefined ? parsed.includeCustomRed : defaultSettings.includeCustomRed,
        includeCustomBlue: parsed.includeCustomBlue !== undefined ? parsed.includeCustomBlue : defaultSettings.includeCustomBlue,
      }
    }
  } catch (err) {
    console.warn('Failed to load settings, using defaults:', err)
  }
  return defaultSettings
}

// Load custom cards from localStorage
const loadCustomCards = (): Card[] => {
  try {
    const stored = localStorage.getItem('cg.custom.v2')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed.filter((card): card is Card => 
          card && 
          typeof card.id === 'string' &&
          typeof card.title === 'string' &&
          typeof card.description === 'string' &&
          ['A', 'B', 'C', 'D', 'black'].includes(card.deck) &&
          (card.playerColor === 'red' || card.playerColor === 'blue' || card.playerColor === 'any' || card.playerColor === 'neutral')
        )
      }
    }
  } catch (err) {
    console.warn('Failed to load custom cards, using empty array:', err)
  }
  return []
}

const initialState: GameState = {
  currentPlayer: null,
  swapCount: { red: 0, blue: 0 },
  activeSwapCard: { red: false, blue: false },
  blackUnlocked: false,
  usedCardIds: new Set<string>(),
  startingPlayer: null,
  selectedCard: null,
  isModalOpen: false,
  settings: loadSettings(),
  customCards: loadCustomCards(),
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startGame: (player: 'red' | 'blue') => {
        set({
          currentPlayer: player,
          startingPlayer: player,
          swapCount: { red: 0, blue: 0 },
          activeSwapCard: { red: false, blue: false },
          blackUnlocked: false,
          usedCardIds: new Set<string>(),
          selectedCard: null,
          isModalOpen: false,
        })
      },

      drawFrom: (deck: DeckLetter, playerColor: 'red' | 'blue', availableCards: Card[]) => {
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
              (card.playerColor === playerColor || card.playerColor === 'neutral' || card.playerColor === 'any') &&
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
          const { currentPlayer, activeSwapCard } = get()
          if (!currentPlayer) return

          // Mark that the current player has an active swap card (not yet used)
          const newActiveSwapCard = { ...activeSwapCard }
          newActiveSwapCard[currentPlayer] = true

          set({
            activeSwapCard: newActiveSwapCard,
          })
        }
      },

      useSwapCard: () => {
        const { currentPlayer, swapCount, activeSwapCard, blackUnlocked } = get()
        if (!currentPlayer || !activeSwapCard[currentPlayer]) return

        // Consume the swap card: increment count and clear active status
        const newSwapCount = { ...swapCount }
        newSwapCount[currentPlayer] += 1

        const newActiveSwapCard = { ...activeSwapCard }
        newActiveSwapCard[currentPlayer] = false

        // Unlock black deck if current player has 3+ swaps
        const shouldUnlock = newSwapCount[currentPlayer] >= 3

        // End the turn after using swap card
        set({
          currentPlayer: currentPlayer === 'red' ? 'blue' : 'red',
          swapCount: newSwapCount,
          activeSwapCard: newActiveSwapCard,
          blackUnlocked: shouldUnlock || blackUnlocked,
          isModalOpen: false,
        })
      },

      endTurn: () => {
        const { currentPlayer } = get()
        if (currentPlayer) {
          // Clear active swap card when turn ends
          const { activeSwapCard } = get()
          const newActiveSwapCard = { ...activeSwapCard }
          newActiveSwapCard[currentPlayer] = false
          
          set({ 
            currentPlayer: currentPlayer === 'red' ? 'blue' : 'red',
            activeSwapCard: newActiveSwapCard,
          })
        }
      },

      resetGame: () => {
        set({
          currentPlayer: null,
          swapCount: { red: 0, blue: 0 },
          activeSwapCard: { red: false, blue: false },
          blackUnlocked: false,
          usedCardIds: new Set<string>(),
          startingPlayer: null,
          selectedCard: null,
          isModalOpen: false,
        })
      },

      setSelectedCard: (card: Card | null) => {
        set({ selectedCard: card })
      },

      setIsModalOpen: (open: boolean) => {
        set({ isModalOpen: open })
      },

      setSettings: (partialSettings: Partial<Settings>) => {
        const { settings } = get()
        const newSettings = { ...settings, ...partialSettings }
        set({ settings: newSettings })
        // Persist to localStorage
        try {
          localStorage.setItem('cg.settings.v2', JSON.stringify(newSettings))
        } catch (err) {
          console.warn('Failed to save settings:', err)
        }
      },

      addCustomCard: (card: Card) => {
        const { customCards } = get()
        const newCustomCards = [...customCards, card]
        set({ customCards: newCustomCards })
        // Persist to localStorage
        try {
          localStorage.setItem('cg.custom.v2', JSON.stringify(newCustomCards))
        } catch (err) {
          console.warn('Failed to save custom cards:', err)
        }
      },

      deleteCustomCard: (id: string) => {
        const { customCards } = get()
        const newCustomCards = customCards.filter(card => card.id !== id)
        set({ customCards: newCustomCards })
        // Persist to localStorage
        try {
          localStorage.setItem('cg.custom.v2', JSON.stringify(newCustomCards))
        } catch (err) {
          console.warn('Failed to save custom cards:', err)
        }
      },

      clearCustomCards: () => {
        set({ customCards: [] })
        try {
          localStorage.setItem('cg.custom.v2', JSON.stringify([]))
        } catch (err) {
          console.warn('Failed to clear custom cards:', err)
        }
      },

      mergeDecksForPlayer: (player: 'red' | 'blue') => {
        const { settings, customCards } = get()
        const baseCards = cardsData as Card[]
        
        // Start with base cards
        let mergedCards = [...baseCards]
        
        // Add custom cards if enabled for this player
        if ((player === 'red' && settings.includeCustomRed) || (player === 'blue' && settings.includeCustomBlue)) {
          const playerCustomCards = customCards.filter(card => {
            // Custom cards can be player-specific or 'any'
            return card.playerColor === player || card.playerColor === 'any'
          })
          mergedCards = [...mergedCards, ...playerCustomCards]
        }
        
        return mergedCards
      },
    }),
    {
      name: 'couples-game-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentPlayer: state.currentPlayer,
        swapCount: state.swapCount,
        activeSwapCard: state.activeSwapCard,
        blackUnlocked: state.blackUnlocked,
        usedCardIds: Array.from(state.usedCardIds),
        startingPlayer: state.startingPlayer,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // If localStorage is corrupted, reset to initial state
          console.warn('Failed to rehydrate game state from localStorage, resetting:', error)
          return {
            ...initialState,
            settings: loadSettings(),
            customCards: loadCustomCards(),
          }
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
            
            // Validate activeSwapCard
            if (!state.activeSwapCard || typeof state.activeSwapCard !== 'object') {
              state.activeSwapCard = { red: false, blue: false }
            } else {
              state.activeSwapCard = {
                red: typeof state.activeSwapCard.red === 'boolean' ? state.activeSwapCard.red : false,
                blue: typeof state.activeSwapCard.blue === 'boolean' ? state.activeSwapCard.blue : false,
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

            // Load settings and custom cards from separate storage
            state.settings = loadSettings()
            state.customCards = loadCustomCards()
          } catch (err) {
            console.warn('Error validating rehydrated state, resetting:', err)
            return {
              ...initialState,
              settings: loadSettings(),
              customCards: loadCustomCards(),
            }
          }
        }
      },
    }
  )
)
