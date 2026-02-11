import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import cardsData from '@/data/cards.json'
import { useAuthStore } from './authStore'

export type DeckLetter = 'A' | 'B' | 'C' | 'D' | 'black'
export type PlayerColor = 'red' | 'blue' | 'any'
export type SessionMode = 'romantic' | 'balanced' | 'spicy' | 'wild'
export type Intensity = 'soft' | 'medium' | 'hot' | 'wild'

// Controlled tags list
export const AVAILABLE_TAGS = [
  'kissing',
  'massage',
  'teasing',
  'oral',
  'toys',
  'domination',
  'submission',
  'romantic',
  'roleplay'
] as const

export type Tag = typeof AVAILABLE_TAGS[number]

// Session mode rules
const MODE_RULES: Record<SessionMode, { allowedIntensity?: Intensity[], excludedTags?: Tag[] }> = {
  romantic: {
    allowedIntensity: ['soft', 'medium'],
    excludedTags: ['domination', 'submission', 'toys']
  },
  balanced: {
    allowedIntensity: ['soft', 'medium', 'hot']
  },
  spicy: {
    allowedIntensity: ['medium', 'hot']
  },
  wild: {
    allowedIntensity: ['hot', 'wild']
  }
}

export interface Card {
  id: string
  title: string
  description: string
  deck: DeckLetter
  playerColor: PlayerColor | 'neutral'
  isSwapCard?: boolean
  isCustom?: boolean
  imageDataUrl?: string
  isEnabled?: boolean // defaults to true if undefined
  isFavorite?: boolean // defaults to false if undefined
  intensity?: Intensity // defaults to 'medium' if undefined
  tags?: Tag[] // defaults to [] if undefined
}

export interface Settings {
  playerRedName: string
  playerBlueName: string
  includeCustomRed: boolean
  includeCustomBlue: boolean
  sessionMode: SessionMode // defaults to 'balanced'
}

export interface Preset {
  id: string
  name: string
  sessionMode: SessionMode
  includeCustomRed: boolean
  includeCustomBlue: boolean
  disabledCardIds: string[]
  preferredTags?: Tag[]
  excludedTags?: Tag[]
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
  customCards: Card[] // Local mode custom cards
  cloudCards: { global: Card[]; user: Card[] } // Cloud mode cards
  deckShuffles: Record<DeckLetter, string[]>
  cardOverrides: Record<string, Partial<Card>> // Stores edits and enabled state for base cards (local mode)
  sessionDisabledCardIds: Set<string> // NOT persisted, resets on game reset/end
  presets: Preset[] // Persisted in localStorage
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
  reshuffleAllDecks: () => void
  setCloudCards: (global: Card[], user: Card[]) => void
  syncCloudCards: () => Promise<void>
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>
  setCardEnabled: (id: string, enabled: boolean) => Promise<void>
  resetToDefaultDeck: () => void
  removeCardFromSession: (id: string) => void
  toggleFavorite: (id: string) => Promise<void>
  setSessionMode: (mode: SessionMode) => void
  savePreset: (preset: Omit<Preset, 'id'>) => void
  loadPreset: (presetId: string) => void
  deletePreset: (presetId: string) => void
}

const defaultSettings: Settings = {
  playerRedName: 'Natalie',
  playerBlueName: 'Jordan',
  includeCustomRed: true,
  includeCustomBlue: true,
  sessionMode: 'balanced',
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
        sessionMode: parsed.sessionMode || defaultSettings.sessionMode,
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

// Load card overrides from localStorage
const loadCardOverrides = (): Record<string, Partial<Card>> => {
  try {
    const stored = localStorage.getItem('cg.cardOverrides.v3')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to load card overrides, using empty object:', err)
  }
  return {}
}

// Load presets from localStorage
const loadPresets = (): Preset[] => {
  try {
    const stored = localStorage.getItem('cg.presets.v1')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed.filter((preset): preset is Preset =>
          preset &&
          typeof preset.id === 'string' &&
          typeof preset.name === 'string' &&
          ['romantic', 'balanced', 'spicy', 'wild'].includes(preset.sessionMode) &&
          typeof preset.includeCustomRed === 'boolean' &&
          typeof preset.includeCustomBlue === 'boolean' &&
          Array.isArray(preset.disabledCardIds)
        )
      }
    }
  } catch (err) {
    console.warn('Failed to load presets, using empty array:', err)
  }
  return []
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Shuffle a deck and return array of card IDs
const shuffleDeck = (cards: Card[]): string[] => {
  return shuffleArray(cards).map(card => card.id)
}

// Initialize deck shuffles for all decks
const initializeDeckShuffles = (availableCards: Card[]): Record<DeckLetter, string[]> => {
  const shuffles: Record<DeckLetter, string[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
    black: [],
  }

  // Shuffle each deck separately
  const decks: DeckLetter[] = ['A', 'B', 'C', 'D', 'black']
  decks.forEach(deck => {
    const deckCards = availableCards.filter(card => card.deck === deck)
    shuffles[deck] = shuffleDeck(deckCards)
  })

  return shuffles
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
  cloudCards: { global: [], user: [] },
  deckShuffles: {
    A: [],
    B: [],
    C: [],
    D: [],
    black: [],
  },
  cardOverrides: loadCardOverrides(),
  sessionDisabledCardIds: new Set<string>(),
  presets: loadPresets(),
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startGame: (player: 'red' | 'blue') => {
        const { mergeDecksForPlayer } = get()
        
        // Get merged cards for both players to ensure all available cards are included
        const redCards = mergeDecksForPlayer('red')
        const blueCards = mergeDecksForPlayer('blue')
        
        // Combine all unique cards (base + custom for both players)
        const allCards = [...redCards, ...blueCards]
        const uniqueCards = Array.from(
          new Map(allCards.map(card => [card.id, card])).values()
        )
        
        // Initialize deck shuffles
        const deckShuffles = initializeDeckShuffles(uniqueCards)
        
        set({
          currentPlayer: player,
          startingPlayer: player,
          swapCount: { red: 0, blue: 0 },
          activeSwapCard: { red: false, blue: false },
          blackUnlocked: false,
          usedCardIds: new Set<string>(),
          selectedCard: null,
          isModalOpen: false,
          deckShuffles,
          sessionDisabledCardIds: new Set<string>(), // Clear session-disabled cards on game start
        })
      },

      drawFrom: (deck: DeckLetter, playerColor: 'red' | 'blue', availableCards: Card[]) => {
        const { usedCardIds, deckShuffles } = get()
        
        // Get shuffled order for this deck
        const shuffledOrder = deckShuffles[deck] || []
        
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

        // Use shuffled order: find first card in shuffled order that is available and unused
        let selectedCard: Card | null = null
        for (const cardId of shuffledOrder) {
          const card = filteredCards.find(c => c.id === cardId)
          if (card && !usedCardIds.has(cardId)) {
            selectedCard = card
            break
          }
        }

        // Fallback to random if shuffled order doesn't have available cards
        if (!selectedCard) {
          const randomIndex = Math.floor(Math.random() * filteredCards.length)
          selectedCard = filteredCards[randomIndex]
        }

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

        // Reshuffle all decks
        const { reshuffleAllDecks } = get()
        reshuffleAllDecks()

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
          deckShuffles: {
            A: [],
            B: [],
            C: [],
            D: [],
            black: [],
          },
          sessionDisabledCardIds: new Set<string>(), // Clear session-disabled cards on reset
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
        const { settings, customCards, cloudCards, cardOverrides, sessionDisabledCardIds } = get()
        const authState = useAuthStore.getState()
        const mode = authState.mode
        
        let baseCards: Card[] = []
        let userCustomCards: Card[] = []
        
        // Helper to apply overrides to a card
        const applyOverrides = (card: Card): Card => {
          const override = cardOverrides[card.id]
          if (override) {
            return { ...card, ...override }
          }
          return card
        }
        
        // Determine mode: cloud or local
        if (mode === 'cloud' && cloudCards.global.length > 0) {
          // Cloud mode: use global cards as base
          baseCards = [...cloudCards.global]
          
          // Add user custom cards if enabled
          if ((player === 'red' && settings.includeCustomRed) || (player === 'blue' && settings.includeCustomBlue)) {
            userCustomCards = cloudCards.user.filter(card => {
              return card.playerColor === player || card.playerColor === 'any'
            })
          }
        } else {
          // Local mode: use cards.json as base, apply overrides
          baseCards = (cardsData as Card[]).map(applyOverrides)
          
          // Add local custom cards if enabled
          if ((player === 'red' && settings.includeCustomRed) || (player === 'blue' && settings.includeCustomBlue)) {
            userCustomCards = customCards.filter(card => {
              return card.playerColor === player || card.playerColor === 'any'
            })
          }
        }
        
        // Combine all cards
        const allCards = [...baseCards, ...userCustomCards]
        
        // Filter out disabled cards (isEnabled === false)
        // If isEnabled is undefined, treat as true (enabled)
        const enabledCards = allCards.filter(card => card.isEnabled !== false)
        
        // Filter out session-disabled cards
        const sessionEnabledCards = enabledCards.filter(card => !sessionDisabledCardIds.has(card.id))
        
        // Apply session mode filtering
        const sessionMode = settings.sessionMode || 'balanced'
        const modeRules = MODE_RULES[sessionMode]
        
        const modeFilteredCards = sessionEnabledCards.filter(card => {
          // Black deck ignores mode filtering
          if (card.deck === 'black') {
            return true
          }
          
          // Check intensity - only filter if the card has an explicit intensity set
          // Cards without intensity are always included (they come from base cards.json)
          if (card.intensity && modeRules.allowedIntensity && !modeRules.allowedIntensity.includes(card.intensity)) {
            return false
          }
          
          // Check excluded tags
          const cardTags = card.tags || []
          if (modeRules.excludedTags) {
            const hasExcludedTag = cardTags.some(tag => modeRules.excludedTags!.includes(tag))
            if (hasExcludedTag) {
              return false
            }
          }
          
          return true
        })
        
        return modeFilteredCards
      },

      reshuffleAllDecks: () => {
        const { usedCardIds, mergeDecksForPlayer } = get()
        
        // Get merged cards for both players
        const redCards = mergeDecksForPlayer('red')
        const blueCards = mergeDecksForPlayer('blue')
        
        // Combine all unique cards
        const allCards = [...redCards, ...blueCards]
        const uniqueCards = Array.from(
          new Map(allCards.map(card => [card.id, card])).values()
        )
        
        // Create new shuffles, but only include unused cards
        const newShuffles: Record<DeckLetter, string[]> = {
          A: [],
          B: [],
          C: [],
          D: [],
          black: [],
        }

        const decks: DeckLetter[] = ['A', 'B', 'C', 'D', 'black']
        decks.forEach(deck => {
          // Get unused cards for this deck
          const unusedDeckCards = uniqueCards.filter(
            card => card.deck === deck && !usedCardIds.has(card.id)
          )
          // Shuffle only unused cards
          newShuffles[deck] = shuffleDeck(unusedDeckCards)
        })

        set({ deckShuffles: newShuffles })
      },

      setCloudCards: (global: Card[], user: Card[]) => {
        set({ cloudCards: { global, user } })
      },

      syncCloudCards: async () => {
        const authStore = useAuthStore.getState()
        
        if (authStore.mode !== 'cloud' || !authStore.user) {
          return
        }

        const { getSupabaseClient } = await import('@/lib/supabase/client')
        const { fetchGlobalCards, fetchUserCards } = await import('@/lib/supabase/cards')
        
        const { client } = getSupabaseClient()
        if (!client) return

        try {
          const [globalCards, userCards] = await Promise.all([
            fetchGlobalCards(client),
            fetchUserCards(client, authStore.user.id),
          ])

          get().setCloudCards(globalCards, userCards)
        } catch (error) {
          console.error('Error syncing cloud cards:', error)
        }
      },

      updateCard: async (id: string, updates: Partial<Card>) => {
        const { customCards, cardOverrides, cloudCards } = get()
        const authStore = useAuthStore.getState()
        const mode = authStore.mode

        // Check if it's a custom card (local or cloud user card)
        const isCustomCard = customCards.some(c => c.id === id) || 
                            (mode === 'cloud' && cloudCards.user.some(c => c.id === id))
        
        // Check if it's a global card
        const isGlobalCard = mode === 'cloud' && cloudCards.global.some(c => c.id === id)

        if (mode === 'cloud' && authStore.user) {
          // Cloud mode: update Supabase
          const { getSupabaseClient } = await import('@/lib/supabase/client')
          const { updateCard: updateCloudCard, updateGlobalCard } = await import('@/lib/supabase/cards')
          const { client } = getSupabaseClient()

          if (client) {
            try {
              if (isCustomCard) {
                // Update user's custom card
                await updateCloudCard(client, id, updates)
                await get().syncCloudCards()
              } else if (isGlobalCard && authStore.isAdmin) {
                // Admin can update global cards
                await updateGlobalCard(client, id, updates)
                await get().syncCloudCards()
              } else if (isGlobalCard && !authStore.isAdmin) {
                // Non-admin trying to edit global card - not allowed
                console.warn('Only admins can edit global cards')
                return
              }
            } catch (error) {
              console.error('Error updating card in cloud:', error)
            }
          }
        } else {
          // Local mode: update cardOverrides or customCards
          if (isCustomCard) {
            // Update in customCards array
            const updatedCustomCards = customCards.map(card => 
              card.id === id ? { ...card, ...updates } : card
            )
            set({ customCards: updatedCustomCards })
            try {
              localStorage.setItem('cg.custom.v2', JSON.stringify(updatedCustomCards))
            } catch (err) {
              console.warn('Failed to save custom cards:', err)
            }
          } else {
            // Update in cardOverrides for base cards
            const newOverrides = { ...cardOverrides }
            if (newOverrides[id]) {
              newOverrides[id] = { ...newOverrides[id], ...updates }
            } else {
              newOverrides[id] = updates
            }
            set({ cardOverrides: newOverrides })
            try {
              localStorage.setItem('cg.cardOverrides.v3', JSON.stringify(newOverrides))
            } catch (err) {
              console.warn('Failed to save card overrides:', err)
            }
          }
        }

        // Trigger re-shuffle if game is active
        const { currentPlayer } = get()
        if (currentPlayer) {
          get().reshuffleAllDecks()
        }
      },

      setCardEnabled: async (id: string, enabled: boolean) => {
        await get().updateCard(id, { isEnabled: enabled })
      },

      resetToDefaultDeck: () => {
        const authStore = useAuthStore.getState()
        if (authStore.mode === 'cloud') {
          console.warn('resetToDefaultDeck is only available in local mode')
          return
        }

        // Clear card overrides
        set({ cardOverrides: {} })
        try {
          localStorage.removeItem('cg.cardOverrides.v3')
        } catch (err) {
          console.warn('Failed to clear card overrides:', err)
        }

        // Trigger re-shuffle if game is active
        const { currentPlayer } = get()
        if (currentPlayer) {
          get().reshuffleAllDecks()
        }
      },

      removeCardFromSession: (id: string) => {
        const { sessionDisabledCardIds } = get()
        const newSessionDisabled = new Set(sessionDisabledCardIds)
        newSessionDisabled.add(id)
        set({ sessionDisabledCardIds: newSessionDisabled })
      },

      toggleFavorite: async (id: string) => {
        const { customCards, cardOverrides, cloudCards } = get()
        const authStore = useAuthStore.getState()
        const mode = authStore.mode

        // Find current favorite state
        let currentFavorite = false
        const isCustomCard = customCards.some(c => c.id === id) || 
                            (mode === 'cloud' && cloudCards.user.some(c => c.id === id))

        if (isCustomCard) {
          const card = customCards.find(c => c.id === id) || 
                      (mode === 'cloud' ? cloudCards.user.find(c => c.id === id) : null)
          currentFavorite = card?.isFavorite === true
        } else {
          const baseCard = mode === 'cloud' 
            ? cloudCards.global.find(c => c.id === id)
            : (cardsData as Card[]).find(c => c.id === id)
          const override = cardOverrides[id]
          currentFavorite = override?.isFavorite !== undefined 
            ? override.isFavorite === true 
            : (baseCard?.isFavorite === true)
        }

        // Toggle favorite
        await get().updateCard(id, { isFavorite: !currentFavorite })
      },

      setSessionMode: (mode: SessionMode) => {
        get().setSettings({ sessionMode: mode })
      },

      savePreset: (preset: Omit<Preset, 'id'>) => {
        const { presets } = get()
        const newPreset: Preset = {
          ...preset,
          id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        const updatedPresets = [...presets, newPreset]
        set({ presets: updatedPresets })
        try {
          localStorage.setItem('cg.presets.v1', JSON.stringify(updatedPresets))
        } catch (err) {
          console.warn('Failed to save presets:', err)
        }
      },

      loadPreset: (presetId: string) => {
        const { presets } = get()
        const preset = presets.find(p => p.id === presetId)
        if (!preset) {
          console.warn('Preset not found:', presetId)
          return
        }

        // Update settings
        get().setSettings({
          sessionMode: preset.sessionMode,
          includeCustomRed: preset.includeCustomRed,
          includeCustomBlue: preset.includeCustomBlue,
        })

        // Apply disabled cards to overrides
        const { cardOverrides } = get()
        const newOverrides = { ...cardOverrides }
        
        // Set isEnabled: false for cards in preset.disabledCardIds
        preset.disabledCardIds.forEach(cardId => {
          if (newOverrides[cardId]) {
            newOverrides[cardId] = { ...newOverrides[cardId], isEnabled: false }
          } else {
            newOverrides[cardId] = { isEnabled: false }
          }
        })

        // Note: We don't restore enabled state for cards not in disabledCardIds
        // This is intentional - presets only set disabled cards, not re-enable everything

        set({ cardOverrides: newOverrides })
        try {
          localStorage.setItem('cg.cardOverrides.v3', JSON.stringify(newOverrides))
        } catch (err) {
          console.warn('Failed to save card overrides:', err)
        }

        // Trigger re-shuffle if game is active
        const { currentPlayer } = get()
        if (currentPlayer) {
          get().reshuffleAllDecks()
        }
      },

      deletePreset: (presetId: string) => {
        const { presets } = get()
        const updatedPresets = presets.filter(p => p.id !== presetId)
        set({ presets: updatedPresets })
        try {
          localStorage.setItem('cg.presets.v1', JSON.stringify(updatedPresets))
        } catch (err) {
          console.warn('Failed to save presets:', err)
        }
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
        cardOverrides: state.cardOverrides,
        // Do not persist shuffledDecks, sessionDisabledCardIds, or presets here
        // presets are persisted separately in localStorage
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          // If localStorage is corrupted, reset to initial state
          console.warn('Failed to rehydrate game state from localStorage, resetting:', error)
          return {
            ...initialState,
            settings: loadSettings(),
            customCards: loadCustomCards(),
            presets: loadPresets(),
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

            // Validate deckShuffles
            if (!state.deckShuffles || typeof state.deckShuffles !== 'object') {
              state.deckShuffles = {
                A: [],
                B: [],
                C: [],
                D: [],
                black: [],
              }
            } else {
              // Ensure all deck keys exist and are arrays
              const decks: DeckLetter[] = ['A', 'B', 'C', 'D', 'black']
              const validatedShuffles: Record<DeckLetter, string[]> = {
                A: [],
                B: [],
                C: [],
                D: [],
                black: [],
              }
              decks.forEach(deck => {
                if (Array.isArray(state.deckShuffles[deck])) {
                  validatedShuffles[deck] = state.deckShuffles[deck].filter(
                    (id: unknown) => typeof id === 'string'
                  )
                }
              })
              state.deckShuffles = validatedShuffles
            }

            // Initialize sessionDisabledCardIds (not persisted)
            state.sessionDisabledCardIds = new Set<string>()

            // Load settings, custom cards, card overrides, and presets from separate storage
            state.settings = loadSettings()
            state.customCards = loadCustomCards()
            state.cardOverrides = loadCardOverrides()
            state.presets = loadPresets()
          } catch (err) {
            console.warn('Error validating rehydrated state, resetting:', err)
            return {
              ...initialState,
              settings: loadSettings(),
              customCards: loadCustomCards(),
              cardOverrides: loadCardOverrides(),
              presets: loadPresets(),
            }
          }
        }
      },
    }
  )
)
