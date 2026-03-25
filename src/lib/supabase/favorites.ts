import { SupabaseClient } from '@supabase/supabase-js'

export const fetchUserFavoriteIds = async (
  client: SupabaseClient,
  userId: string
): Promise<string[]> => {
  try {
    const { data, error } = await client
      .from('user_favorite_cards')
      .select('card_id')
      .eq('user_id', userId)

    if (error) {
      console.warn('Error fetching user favorites:', error)
      return []
    }

    return (data || []).map((row: { card_id: string }) => row.card_id)
  } catch (err) {
    console.error('Exception fetching user favorites:', err)
    return []
  }
}

export const addFavorite = async (
  client: SupabaseClient,
  userId: string,
  cardId: string
): Promise<boolean> => {
  try {
    const { error } = await client
      .from('user_favorite_cards')
      .insert({ user_id: userId, card_id: cardId })

    if (error) {
      // Ignore unique constraint violations (already favorited)
      if (error.code === '23505') return true
      console.warn('Error adding favorite:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception adding favorite:', err)
    return false
  }
}

export const removeFavorite = async (
  client: SupabaseClient,
  userId: string,
  cardId: string
): Promise<boolean> => {
  try {
    const { error } = await client
      .from('user_favorite_cards')
      .delete()
      .eq('user_id', userId)
      .eq('card_id', cardId)

    if (error) {
      console.warn('Error removing favorite:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception removing favorite:', err)
    return false
  }
}
