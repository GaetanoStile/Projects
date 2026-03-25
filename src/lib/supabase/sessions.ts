import { SupabaseClient } from '@supabase/supabase-js'

export interface GameSessionRow {
  id: string
  user_id: string
  player_red_name: string
  player_blue_name: string
  current_player: 'red' | 'blue'
  starting_player: 'red' | 'blue' | null
  used_card_ids: string[]
  swap_count_red: number
  swap_count_blue: number
  swap_inventory_red: number
  swap_inventory_blue: number
  black_unlocked_red: boolean
  black_unlocked_blue: boolean
  selected_mode: string
  session_disabled_card_ids: string[]
  is_completed: boolean
  created_at: string
  updated_at: string
}

type SessionUpsertPayload = Omit<GameSessionRow, 'id' | 'created_at' | 'updated_at'>

export const fetchActiveSession = async (
  client: SupabaseClient,
  userId: string
): Promise<GameSessionRow | null> => {
  try {
    const { data, error } = await client
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Error fetching active session:', error)
      return null
    }

    return data ?? null
  } catch (err) {
    console.error('Exception fetching active session:', err)
    return null
  }
}

export const upsertSession = async (
  client: SupabaseClient,
  sessionId: string | null,
  payload: SessionUpsertPayload
): Promise<GameSessionRow | null> => {
  try {
    if (sessionId) {
      const { data, error } = await client
        .from('game_sessions')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) {
        console.warn('Error updating session:', error)
        return null
      }
      return data
    } else {
      const { data, error } = await client
        .from('game_sessions')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.warn('Error inserting session:', error)
        return null
      }
      return data
    }
  } catch (err) {
    console.error('Exception upserting session:', err)
    return null
  }
}

export const completeSession = async (
  client: SupabaseClient,
  sessionId: string
): Promise<boolean> => {
  try {
    const { error } = await client
      .from('game_sessions')
      .update({ is_completed: true, updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (error) {
      console.warn('Error completing session:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('Exception completing session:', err)
    return false
  }
}
