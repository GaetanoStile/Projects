import { create } from 'zustand'
import { getSupabaseClient } from '@/lib/supabase/client'
import { fetchActiveSession, upsertSession, completeSession, GameSessionRow } from '@/lib/supabase/sessions'
import { useAuthStore } from './authStore'
import { useGameStore } from './store'

interface SessionState {
  currentSessionId: string | null
  lastSavedAt: Date | null
  isSaving: boolean
  activeSession: GameSessionRow | null
}

interface SessionActions {
  checkForActiveSession: () => Promise<void>
  saveCurrentSession: () => Promise<void>
  markSessionComplete: () => Promise<void>
  loadSession: (session: GameSessionRow) => void
  clearSession: () => void
}

function deriveSelectedMode(includeCustomRed: boolean, includeCustomBlue: boolean): string {
  if (includeCustomRed && includeCustomBlue) return 'both'
  if (includeCustomRed) return 'red_only'
  if (includeCustomBlue) return 'blue_only'
  return 'none'
}

export const useSessionStore = create<SessionState & SessionActions>()((set, get) => ({
  currentSessionId: null,
  lastSavedAt: null,
  isSaving: false,
  activeSession: null,

  checkForActiveSession: async () => {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (!isAuthenticated || !user?.id) return

    const { client, isSupabaseAvailable } = getSupabaseClient()
    if (!isSupabaseAvailable || !client) return

    const session = await fetchActiveSession(client, user.id)
    set({ activeSession: session })

    // If we found an active session, store its id as currentSessionId
    if (session) {
      set({ currentSessionId: session.id })
    }
  },

  saveCurrentSession: async () => {
    const { isAuthenticated, user } = useAuthStore.getState()
    if (!isAuthenticated || !user?.id) return

    const { client, isSupabaseAvailable } = getSupabaseClient()
    if (!isSupabaseAvailable || !client) return

    const gameState = useGameStore.getState()
    const { currentPlayer, startingPlayer, swapCount, swapInventory, usedCardIds, sessionDisabledCardIds, settings } = gameState

    // Only save if the game is actually in progress
    if (!currentPlayer) return

    set({ isSaving: true })

    const selectedMode = deriveSelectedMode(settings.includeCustomRed, settings.includeCustomBlue)

    const payload = {
      user_id: user.id,
      player_red_name: settings.playerRedName,
      player_blue_name: settings.playerBlueName,
      current_player: currentPlayer,
      starting_player: startingPlayer,
      used_card_ids: Array.from(usedCardIds),
      swap_count_red: swapCount.red,
      swap_count_blue: swapCount.blue,
      swap_inventory_red: swapInventory.red,
      swap_inventory_blue: swapInventory.blue,
      black_unlocked_red: swapInventory.red >= 2,
      black_unlocked_blue: swapInventory.blue >= 2,
      selected_mode: selectedMode,
      session_disabled_card_ids: Array.from(sessionDisabledCardIds),
      is_completed: false,
    }

    const { currentSessionId } = get()
    const result = await upsertSession(client, currentSessionId, payload)

    if (result) {
      set({
        currentSessionId: result.id,
        lastSavedAt: new Date(),
        isSaving: false,
        activeSession: result,
      })
    } else {
      set({ isSaving: false })
    }
  },

  markSessionComplete: async () => {
    const { currentSessionId } = get()
    if (!currentSessionId) return

    const { client, isSupabaseAvailable } = getSupabaseClient()
    if (!isSupabaseAvailable || !client) return

    await completeSession(client, currentSessionId)
    set({ currentSessionId: null, activeSession: null, lastSavedAt: null })
  },

  loadSession: (session: GameSessionRow) => {
    set({ currentSessionId: session.id, activeSession: session })
    useGameStore.getState().loadSessionIntoStore(session)
  },

  clearSession: () => {
    set({ currentSessionId: null, activeSession: null, lastSavedAt: null, isSaving: false })
  },
}))
