import { SupabaseClient } from '@supabase/supabase-js'
import { Card, DeckLetter, PlayerColor, Tag, AVAILABLE_TAGS } from '@/state/store'

/**
 * Database card interface (matches Supabase schema)
 */
export interface DatabaseCard {
  id: string
  owner_id: string | null
  title: string
  description: string
  deck: DeckLetter
  player_color: PlayerColor | 'neutral'
  is_swap_card: boolean
  is_custom: boolean
  is_enabled: boolean
  is_favorite: boolean
  intensity: string | null
  tags: string[] | null
  image_url: string | null
  created_at: string
}

/**
 * Convert database card to app Card format
 */
const dbCardToCard = (dbCard: DatabaseCard): Card => ({
  id: dbCard.id,
  title: dbCard.title,
  description: dbCard.description,
  deck: dbCard.deck,
  playerColor: dbCard.player_color,
  isSwapCard: dbCard.is_swap_card,
  isCustom: dbCard.is_custom,
  isEnabled: dbCard.is_enabled !== undefined ? dbCard.is_enabled : true,
  isFavorite: dbCard.is_favorite !== undefined ? dbCard.is_favorite : false,
  tags: dbCard.tags && Array.isArray(dbCard.tags) 
    ? dbCard.tags.filter((tag): tag is Tag => AVAILABLE_TAGS.includes(tag as Tag))
    : undefined,
  imageDataUrl: dbCard.image_url || undefined,
})

/**
 * Convert app Card to database format
 */
const cardToDbCard = (card: Card, ownerId: string | null = null): Omit<DatabaseCard, 'id' | 'created_at'> => ({
  owner_id: ownerId,
  title: card.title,
  description: card.description,
  deck: card.deck,
  player_color: card.playerColor,
  is_swap_card: card.isSwapCard || false,
  is_custom: card.isCustom || false,
  is_enabled: card.isEnabled !== undefined ? card.isEnabled : true,
  is_favorite: card.isFavorite !== undefined ? card.isFavorite : false,
  intensity: null,
  tags: card.tags && card.tags.length > 0 ? (card.tags as string[]) : null,
  image_url: card.imageDataUrl || null,
})

/**
 * Fetch all global cards (owner_id is null)
 */
export const fetchGlobalCards = async (client: SupabaseClient | null): Promise<Card[]> => {
  if (!client) return []

  try {
    const { data, error } = await client
      .from('cards')
      .select('*')
      .is('owner_id', null)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching global cards:', error)
      return []
    }

    return (data || []).map(dbCardToCard)
  } catch (error) {
    console.error('Exception fetching global cards:', error)
    return []
  }
}

/**
 * Fetch user's custom cards (owner_id = userId)
 */
export const fetchUserCards = async (client: SupabaseClient | null, userId: string): Promise<Card[]> => {
  if (!client || !userId) return []

  try {
    const { data, error } = await client
      .from('cards')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching user cards:', error)
      return []
    }

    return (data || []).map(dbCardToCard)
  } catch (error) {
    console.error('Exception fetching user cards:', error)
    return []
  }
}

/**
 * Create a user custom card
 */
export const createCard = async (
  client: SupabaseClient | null,
  card: Card,
  userId: string
): Promise<Card | null> => {
  if (!client || !userId) return null

  try {
    const dbCard = cardToDbCard(card, userId)
    const { data, error } = await client
      .from('cards')
      .insert(dbCard)
      .select()
      .single()

    if (error) {
      console.error('Error creating card:', error)
      return null
    }

    return dbCardToCard(data)
  } catch (error) {
    console.error('Exception creating card:', error)
    return null
  }
}

/**
 * Update a user's card
 */
export const updateCard = async (
  client: SupabaseClient | null,
  cardId: string,
  updates: Partial<Card>
): Promise<Card | null> => {
  if (!client || !cardId) return null

  try {
    const updateData: Partial<Omit<DatabaseCard, 'id' | 'created_at'>> = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.deck !== undefined) updateData.deck = updates.deck
    if (updates.playerColor !== undefined) updateData.player_color = updates.playerColor
    if (updates.isSwapCard !== undefined) updateData.is_swap_card = updates.isSwapCard
    if (updates.isEnabled !== undefined) updateData.is_enabled = updates.isEnabled
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite
    if (updates.tags !== undefined) updateData.tags = updates.tags && updates.tags.length > 0 ? updates.tags : null
    if (updates.imageDataUrl !== undefined) updateData.image_url = updates.imageDataUrl || null

    const { data, error } = await client
      .from('cards')
      .update(updateData)
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      console.error('Error updating card:', error)
      return null
    }

    return dbCardToCard(data)
  } catch (error) {
    console.error('Exception updating card:', error)
    return null
  }
}

/**
 * Delete a user's card
 */
export const deleteCard = async (
  client: SupabaseClient | null,
  cardId: string
): Promise<boolean> => {
  if (!client || !cardId) return false

  try {
    const { error } = await client
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Error deleting card:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Exception deleting card:', error)
    return false
  }
}

/**
 * Admin: Create a global card
 */
export const createGlobalCard = async (
  client: SupabaseClient | null,
  card: Card
): Promise<Card | null> => {
  if (!client) return null

  try {
    const dbCard = cardToDbCard(card, null)
    const { data, error } = await client
      .from('cards')
      .insert(dbCard)
      .select()
      .single()

    if (error) {
      console.error('Error creating global card:', error)
      return null
    }

    return dbCardToCard(data)
  } catch (error) {
    console.error('Exception creating global card:', error)
    return null
  }
}

/**
 * Admin: Update a global card
 */
export const updateGlobalCard = async (
  client: SupabaseClient | null,
  cardId: string,
  updates: Partial<Card>
): Promise<Card | null> => {
  return updateCard(client, cardId, updates)
}

/**
 * Admin: Delete a global card
 */
export const deleteGlobalCard = async (
  client: SupabaseClient | null,
  cardId: string
): Promise<boolean> => {
  return deleteCard(client, cardId)
}
