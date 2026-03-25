// Card Manager: View, edit, enable/disable all game cards
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGameStore, Card, DeckLetter, PlayerColor, AVAILABLE_TAGS, Tag } from '@/state/store'
import { useAuthStore } from '@/state/authStore'
import { getSupabaseClient } from '@/lib/supabase/client'
import { createCard, deleteCard as deleteCloudCard } from '@/lib/supabase/cards'
import cardsData from '@/data/cards.json'
import Candle from '@/components/Candle'
import { playButtonClickSoundFromEvent } from '@/lib/sound'

const CustomCardSchema = z.object({
  title: z.string().trim().min(2).max(60),
  description: z.string().trim().min(4).max(240),
  playerColor: z.enum(['red', 'blue', 'any']),
  deck: z.enum(['A', 'B', 'C', 'D']),
  isSwapCard: z.boolean().optional().default(false),
  imageDataUrl: z.string().url().optional().or(z.literal('')),
})

const EditCardSchema = z.object({
  title: z.string().trim().min(2).max(60),
  description: z.string().trim().min(4).max(240),
  playerColor: z.enum(['red', 'blue', 'any', 'neutral']),
  deck: z.enum(['A', 'B', 'C', 'D', 'black']),
  isSwapCard: z.boolean().optional().default(false),
  isEnabled: z.boolean().optional().default(true),
  isFavorite: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
})

type CustomCardFormData = z.infer<typeof CustomCardSchema>
type EditCardFormData = z.infer<typeof EditCardSchema>

type TabType = 'custom' | 'all' | 'favorites'

export default function Create() {
  const navigate = useNavigate()
  const { 
    customCards, 
    addCustomCard, 
    deleteCustomCard, 
    syncCloudCards, 
    cloudCards,
    updateCard,
    setCardEnabled,
    resetToDefaultDeck,
    cardOverrides,
    favoriteCardIds,
    toggleFavorite,
  } = useGameStore()
  const { mode, user, isAdmin } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationError, setMigrationError] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Filters for All Cards tab
  const [filterDeck, setFilterDeck] = useState<'all' | DeckLetter>('all')
  const [filterColor, setFilterColor] = useState<'all' | PlayerColor | 'neutral'>('all')
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all')
  const [filterTag, setFilterTag] = useState<'all' | Tag>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomCardFormData>({
    resolver: zodResolver(CustomCardSchema),
    defaultValues: {
      title: '',
      description: '',
      playerColor: 'any',
      deck: 'A',
      isSwapCard: false,
      imageDataUrl: '',
    },
  })

  const editForm = useForm<EditCardFormData>({
    resolver: zodResolver(EditCardSchema),
    defaultValues: {
      title: '',
      description: '',
      playerColor: 'neutral',
      deck: 'A',
      isSwapCard: false,
      isEnabled: true,
    },
  })

  const isSwapCard = watch('isSwapCard')

  const onSubmit = async (data: CustomCardFormData) => {
    const newCard: Card = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description,
      deck: data.deck as DeckLetter,
      playerColor: data.playerColor,
      isSwapCard: data.isSwapCard || false,
      isCustom: true,
      isEnabled: true,
      imageDataUrl: data.imageDataUrl || undefined,
    }

    // Cloud mode: create in Supabase
    if (mode === 'cloud' && user) {
      const { client } = getSupabaseClient()
      if (client) {
        const cloudCard = await createCard(client, newCard, user.id)
        if (cloudCard) {
          await syncCloudCards()
          reset()
          setImagePreview(null)
          return
        } else {
          console.warn('Failed to create card in cloud, saving locally')
        }
      }
    }

    // Local mode or fallback
    addCustomCard(newCard)
    reset()
    setImagePreview(null)
  }

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return

    // Cloud mode: delete from Supabase if it's a cloud card
    if (mode === 'cloud' && user) {
      const cloudCard = cloudCards.user.find(c => c.id === cardId)
      if (cloudCard) {
        const { client } = getSupabaseClient()
        if (client) {
          const success = await deleteCloudCard(client, cardId)
          if (success) {
            await syncCloudCards()
            return
          }
        }
      }
    }

    // Local mode or local card
    deleteCustomCard(cardId)
  }

  const handleEdit = (card: Card) => {
    setEditingCard(card)
    editForm.reset({
      title: card.title,
      description: card.description,
      playerColor: card.playerColor as PlayerColor | 'neutral',
      deck: card.deck,
      isSwapCard: card.isSwapCard || false,
      isEnabled: card.isEnabled !== false,
      isFavorite: card.isFavorite || false,
      tags: card.tags || [],
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (data: EditCardFormData) => {
    if (!editingCard) return

    const updates: Partial<Card> = {
      title: data.title,
      description: data.description,
      playerColor: data.playerColor,
      deck: data.deck as DeckLetter,
      isSwapCard: data.isSwapCard || false,
      isEnabled: data.isEnabled !== false,
      isFavorite: data.isFavorite || false,
      tags: data.tags && data.tags.length > 0 ? data.tags as Tag[] : undefined,
    }

    await updateCard(editingCard.id, updates)
    setShowEditModal(false)
    setEditingCard(null)
  }

  const handleToggleEnabled = async (cardId: string, enabled: boolean) => {
    await setCardEnabled(cardId, enabled)
  }

  const handleToggleFavorite = async (cardId: string) => {
    await toggleFavorite(cardId)
  }

  const handleMigrateLocalCards = async () => {
    if (mode !== 'cloud' || !user) return

    setIsMigrating(true)
    setMigrationError(null)

    try {
      const { client } = getSupabaseClient()
      if (!client) {
        setMigrationError('Supabase is not available')
        return
      }

      const localOnlyCards = customCards.filter(card => 
        !card.id.startsWith('custom-') || !cloudCards.user.some(cc => cc.id === card.id)
      )

      if (localOnlyCards.length === 0) {
        setMigrationError('No local cards to migrate')
        return
      }

      for (const card of localOnlyCards) {
        await createCard(client, card, user.id)
      }

      await syncCloudCards()
    } catch (error) {
      console.error('Migration error:', error)
      setMigrationError('Failed to migrate cards. Please try again.')
    } finally {
      setIsMigrating(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        setValue('imageDataUrl', dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  // Get all cards for "All Cards" tab
  const getAllCards = useMemo(() => {
    const allCards: Card[] = []
    
    // Base cards (from cards.json or cloud global cards)
    if (mode === 'cloud' && cloudCards.global.length > 0) {
      // In cloud mode, include all global cards (including Deck D)
      allCards.push(...cloudCards.global.map(card => ({
        ...card,
        isEnabled: card.isEnabled !== false // Ensure isEnabled defaults to true
      })))
    } else {
      // Local mode: get base cards and apply overrides
      const baseCards = (cardsData as Card[]).map(card => {
        const override = cardOverrides[card.id]
        const mergedCard = override ? { ...card, ...override } : card
        // Ensure isEnabled defaults to true
        return {
          ...mergedCard,
          isEnabled: mergedCard.isEnabled !== false
        }
      })
      allCards.push(...baseCards)
    }

    // Custom cards (including any Deck D custom cards)
    if (mode === 'cloud') {
      allCards.push(...cloudCards.user.map(card => ({
        ...card,
        isEnabled: card.isEnabled !== false
      })))
    } else {
      allCards.push(...customCards.map(card => ({
        ...card,
        isEnabled: card.isEnabled !== false
      })))
    }

    // Ensure all cards have isEnabled set (default to true)
    return allCards.map(card => ({
      ...card,
      isEnabled: card.isEnabled !== false
    }))
  }, [mode, cloudCards, customCards, cardOverrides])

  // Filtered cards for "All Cards" tab
  const filteredAllCards = useMemo(() => {
    return getAllCards.filter(card => {
      const deckMatch = filterDeck === 'all' || card.deck === filterDeck
      const colorMatch = filterColor === 'all' || card.playerColor === filterColor
      const enabledMatch = 
        filterEnabled === 'all' || 
        (filterEnabled === 'enabled' && card.isEnabled !== false) ||
        (filterEnabled === 'disabled' && card.isEnabled === false)
      const tagMatch = 
        filterTag === 'all' || 
        (card.tags || []).includes(filterTag)
      const searchMatch = 
        !searchQuery ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      return deckMatch && colorMatch && enabledMatch && tagMatch && searchMatch
    })
  }, [getAllCards, filterDeck, filterColor, filterEnabled, filterTag, searchQuery])

  // Custom cards for "Custom Only" tab
  const allCustomCards = useMemo(() => {
    if (mode === 'cloud') {
      return [...cloudCards.user, ...customCards.filter(c => 
        !cloudCards.user.some(cc => cc.id === c.id)
      )]
    }
    return customCards
  }, [mode, customCards, cloudCards.user])

  const filteredCustomCards = useMemo(() => {
    return allCustomCards.filter(card => {
      const colorMatch = filterColor === 'all' || card.playerColor === filterColor
      const deckMatch = filterDeck === 'all' || card.deck === filterDeck
      return colorMatch && deckMatch
    })
  }, [allCustomCards, filterColor, filterDeck])

  const hasLocalOnlyCards = useMemo(() => {
    if (mode !== 'cloud') return false
    return customCards.some(card => 
      !cloudCards.user.some(cc => cc.id === card.id)
    )
  }, [mode, customCards, cloudCards.user])

  // Check if a card can be edited
  const canEditCard = (card: Card): boolean => {
    if (card.isCustom) return true // Custom cards can always be edited by owner
    if (mode === 'cloud' && !card.isCustom) {
      return isAdmin // Global cards only editable by admin
    }
    return true // Local mode: base cards can be edited
  }

  // Check if a card can be deleted
  const canDeleteCard = (card: Card): boolean => {
    if (card.isCustom) return true
    if (mode === 'cloud' && !card.isCustom) {
      return isAdmin // Global cards only deletable by admin
    }
    return false // Base cards in local mode cannot be deleted, only disabled
  }

  return (
    <div
      className="candlelit-bg min-h-screen relative overflow-hidden"
      onPointerDownCapture={playButtonClickSoundFromEvent}
    >
      {/* Candles */}
      <div className="absolute top-10 left-5 md:left-10 opacity-30">
        <Candle size={40} />
      </div>
      <div className="absolute top-20 right-5 md:right-10 opacity-30">
        <Candle size={35} />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-30">
        <Candle size={38} />
      </div>
      <div className="absolute bottom-10 right-1/4 opacity-30">
        <Candle size={42} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-display gold-text mb-4">
              Card Manager
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-body">
              Create, edit, and manage all cards
            </p>
            {mode === 'cloud' && user && (
              <p className="text-sm text-white/80 font-body mt-2">
                {isAdmin ? 'Admin mode: You can edit global cards' : 'Cards will be saved to the cloud'}
              </p>
            )}
          </div>

          {/* Migration Button */}
          {hasLocalOnlyCards && mode === 'cloud' && user && (
            <motion.div
              className="mb-6 parchment-bg rounded-lg p-4 glow-warm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-gold font-body font-semibold mb-1">
                    Upload local cards to cloud
                  </p>
                  <p className="text-sm text-gold/80 font-body">
                    You have {customCards.filter(c => !cloudCards.user.some(cc => cc.id === c.id)).length} local card(s) not yet in the cloud
                  </p>
                  {migrationError && (
                    <p className="text-sm text-crimson mt-2">{migrationError}</p>
                  )}
                </div>
                <motion.button
                  type="button"
                  onClick={handleMigrateLocalCards}
                  disabled={isMigrating}
                  className="px-6 py-2 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  whileHover={!isMigrating ? { scale: 1.05 } : {}}
                  whileTap={!isMigrating ? { scale: 0.95 } : {}}
                >
                  {isMigrating ? 'Uploading...' : 'Upload to Cloud'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Create Custom Card Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mb-12">
            <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm">
              <h2 className="text-2xl md:text-3xl font-display gold-text mb-6">
                Create Custom Card
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cardTitle" className="block text-gold font-body font-semibold mb-2 text-left">
                    Title <span className="text-crimson">*</span>
                  </label>
                  <input
                    id="cardTitle"
                    type="text"
                    {...register('title')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-velvet/50"
                    placeholder="Enter card title (2-60 characters)"
                  />
                  {errors.title && (
                    <p className="text-crimson text-sm mt-1 text-left">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cardPlayerColor" className="block text-gold font-body font-semibold mb-2 text-left">
                    Player Color
                  </label>
                  <select
                    id="cardPlayerColor"
                    {...register('playerColor')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="any">Any Player</option>
                    <option value="red">Red (Female)</option>
                    <option value="blue">Blue (Male)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="cardDescription" className="block text-gold font-body font-semibold mb-2 text-left">
                    Description <span className="text-crimson">*</span>
                  </label>
                  <textarea
                    id="cardDescription"
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none placeholder:text-velvet/50"
                    placeholder="Enter card description (4-240 characters)"
                  />
                  {errors.description && (
                    <p className="text-crimson text-sm mt-1 text-left">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cardDeck" className="block text-gold font-body font-semibold mb-2 text-left">
                    Deck
                  </label>
                  <select
                    id="cardDeck"
                    {...register('deck')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="A">Deck A</option>
                    <option value="B">Deck B</option>
                    <option value="C">Deck C</option>
                    <option value="D">Deck D</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cardImage" className="block text-gold font-body font-semibold mb-2 text-left">
                    Optional Image
                  </label>
                  <input
                    id="cardImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full h-32 object-contain rounded-lg border border-gold/30"
                      />
                      <input
                        type="hidden"
                        {...register('imageDataUrl')}
                        value={imagePreview}
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex items-center gap-3 pt-6">
                  <input
                    id="isSwapCard"
                    type="checkbox"
                    {...register('isSwapCard')}
                    className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                  />
                  <label htmlFor="isSwapCard" className="text-gold font-body font-semibold cursor-pointer">
                    This is a swap card
                  </label>
                </div>
              </div>

              {isSwapCard && (
                <div className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                  <p className="text-gold font-body text-sm">
                    ⚠️ Warning: Many swap cards will speed up black deck unlock (2 swaps per player needed)
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Card
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    reset()
                    setImagePreview(null)
                  }}
                  className="px-6 py-3 bg-velvet/80 text-gold font-body text-lg rounded-lg hover:bg-velvet transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Form
                </motion.button>
              </div>
            </div>
          </form>

          {/* Tabs */}
          <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm">
            <div className="flex gap-4 mb-6 border-b border-gold/30">
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-6 py-3 font-display text-lg transition-colors ${
                  activeTab === 'custom'
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-gold/70 hover:text-gold'
                }`}
              >
                Custom Only
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 font-display text-lg transition-colors ${
                  activeTab === 'all'
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-gold/70 hover:text-gold'
                }`}
              >
                All Cards
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-6 py-3 font-display text-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'favorites'
                    ? 'text-gold border-b-2 border-gold'
                    : 'text-gold/70 hover:text-gold'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Favorites
                {favoriteCardIds.size > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-gold/20 text-gold rounded-full">
                    {favoriteCardIds.size}
                  </span>
                )}
              </button>
            </div>

            {/* Custom Only Tab */}
            {activeTab === 'custom' && (
              <div>
                <h2 className="text-3xl md:text-4xl font-display gold-text mb-6 text-center">
                  My Custom Cards
                </h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6 justify-center">
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">
                      Filter by Color
                    </label>
                    <select
                      value={filterColor}
                      onChange={(e) => setFilterColor(e.target.value as any)}
                      className="px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold"
                    >
                      <option value="all">All Colors</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">
                      Filter by Deck
                    </label>
                    <select
                      value={filterDeck}
                      onChange={(e) => setFilterDeck(e.target.value as any)}
                      className="px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold"
                    >
                      <option value="all">All Decks</option>
                      <option value="A">Deck A</option>
                      <option value="B">Deck B</option>
                      <option value="C">Deck C</option>
                      <option value="D">Deck D</option>
                    </select>
                  </div>
                </div>

                {/* Cards Grid */}
                {filteredCustomCards.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gold font-body text-lg">
                      No custom cards yet. Create your first card above!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCustomCards.map((card) => (
                      <div
                        key={card.id}
                        className="p-4 bg-white/90 rounded-lg border-2 border-gold/30 relative"
                      >
                        {card.imageDataUrl && (
                          <img
                            src={card.imageDataUrl}
                            alt={card.title}
                            className="w-full h-24 object-cover rounded mb-2"
                          />
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-gold font-display font-semibold text-lg flex-1">
                            {card.title}
                          </h3>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="ml-2 text-crimson hover:text-red-700 transition-colors"
                            aria-label="Delete card"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-velvet/80 font-body text-sm mb-3 line-clamp-2">
                          {card.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-gold/20 text-gold text-xs font-body rounded">
                            Deck {card.deck}
                          </span>
                          <span
                            className={`px-2 py-1 text-white text-xs font-body rounded ${
                              card.playerColor === 'red'
                                ? 'bg-red-600'
                                : card.playerColor === 'blue'
                                ? 'bg-blue-600'
                                : 'bg-gray-600'
                            }`}
                          >
                            {card.playerColor === 'red'
                              ? 'Red'
                              : card.playerColor === 'blue'
                              ? 'Blue'
                              : 'Any'}
                          </span>
                          {card.isSwapCard && (
                            <span className="px-2 py-1 bg-gold text-velvet text-xs font-body rounded">
                              ✨ Swap
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Cards Tab */}
            {activeTab === 'all' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-3xl md:text-4xl font-display gold-text">
                    All Cards
                  </h2>
                  {mode === 'guest' && (
                    <motion.button
                      onClick={() => {
                        if (confirm('Reset all base cards to defaults? This will clear all edits and re-enable all cards.')) {
                          resetToDefaultDeck()
                        }
                      }}
                      className="px-4 py-2 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reset to Defaults
                    </motion.button>
                  )}
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">
                      Deck
                    </label>
                    <select
                      value={filterDeck}
                      onChange={(e) => setFilterDeck(e.target.value as 'all' | DeckLetter)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold"
                    >
                      <option value="all">All Decks</option>
                      <option value="A">Deck A</option>
                      <option value="B">Deck B</option>
                      <option value="C">Deck C</option>
                      <option value="D">Deck D</option>
                      <option value="black">Black Deck</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">
                      Performer
                    </label>
                    <select
                      value={filterColor}
                      onChange={(e) => setFilterColor(e.target.value as 'all' | PlayerColor | 'neutral')}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold"
                    >
                      <option value="all">All</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="any">Any</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">
                      Status
                    </label>
                    <select
                      value={filterEnabled}
                      onChange={(e) => setFilterEnabled(e.target.value as 'all' | 'enabled' | 'disabled')}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold"
                    >
                      <option value="all">All</option>
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">
                      Tag
                    </label>
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value as 'all' | Tag)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold"
                    >
                      <option value="all">All</option>
                      {AVAILABLE_TAGS.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">
                      Search
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title/description..."
                      className="w-full px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold placeholder:text-velvet/50"
                    />
                  </div>
                </div>

                {/* Cards Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gold/30">
                        <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Enabled</th>
                        <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">⭐</th>
                        <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Deck</th>
                        <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Performer</th>
                        <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Title</th>
                        <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Description</th>
                        <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Tags</th>
                        <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAllCards.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-gold font-body">
                            No cards found matching filters
                          </td>
                        </tr>
                      ) : (
                        filteredAllCards.map((card) => (
                          <tr key={card.id} className="border-b border-gold/20 hover:bg-gold/5">
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={card.isEnabled !== false}
                                onChange={(e) => handleToggleEnabled(card.id, e.target.checked)}
                                className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20 cursor-pointer"
                                title={card.isEnabled !== false ? 'Enabled' : 'Disabled'}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleFavorite(card.id)}
                                className="text-gold hover:text-gold/70 transition-colors"
                                title={favoriteCardIds.has(card.id) ? 'Unfavorite' : 'Favorite'}
                              >
                                {favoriteCardIds.has(card.id) ? (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-gold font-body font-semibold">
                              {card.deck}
                            </td>
                            <td className="py-3 px-4 text-gold font-body">
                              {card.playerColor === 'red' ? 'Red' : card.playerColor === 'blue' ? 'Blue' : card.playerColor === 'any' ? 'Any' : 'Neutral'}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleEdit(card)}
                                className="text-gold font-display font-semibold hover:text-velvet transition-colors text-left"
                              >
                                {card.title}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-gold font-body text-sm max-w-md">
                                {card.description}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {card.isSwapCard && (
                                  <span className="px-2 py-1 bg-gold text-velvet text-xs font-body rounded">
                                    Swap
                                  </span>
                                )}
                                {card.isCustom ? (
                                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-body rounded">
                                    Custom
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-600 text-white text-xs font-body rounded">
                                    Base
                                  </span>
                                )}
                                {(card.tags || []).map(tag => (
                                  <span key={tag} className="px-2 py-1 bg-purple-600 text-white text-xs font-body rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {canEditCard(card) && (
                                  <button
                                    onClick={() => handleEdit(card)}
                                    className="px-3 py-1 bg-gold/20 text-gold font-body text-sm rounded hover:bg-gold/30 transition-colors"
                                  >
                                    Edit
                                  </button>
                                )}
                                {canDeleteCard(card) && (
                                  <button
                                    onClick={() => handleDelete(card.id)}
                                    className="px-3 py-1 bg-crimson/20 text-crimson font-body text-sm rounded hover:bg-crimson/30 transition-colors"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-3xl md:text-4xl font-display gold-text flex items-center gap-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Favorites
                  </h2>
                  <p className="text-gold/70 font-body text-sm">
                    {favoriteCardIds.size} card{favoriteCardIds.size !== 1 ? 's' : ''} favorited
                  </p>
                </div>

                {favoriteCardIds.size === 0 ? (
                  <div className="text-center py-16">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/30 mx-auto mb-4">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-gold/60 font-body text-lg mb-2">No favorites yet</p>
                    <p className="text-gold/40 font-body text-sm">Star a card during gameplay or in the All Cards tab</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/30">
                          <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">⭐</th>
                          <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Deck</th>
                          <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Performer</th>
                          <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Title</th>
                          <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Description</th>
                          <th className="text-left py-3 px-4 text-gold font-display font-semibold bg-gold/30">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getAllCards
                          .filter(card => favoriteCardIds.has(card.id))
                          .map((card) => (
                            <tr key={card.id} className="border-b border-gold/20 hover:bg-gold/5">
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleToggleFavorite(card.id)}
                                  className="text-gold hover:text-gold/70 transition-colors"
                                  title="Unfavorite"
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                </button>
                              </td>
                              <td className="py-3 px-4 text-gold font-body font-semibold">{card.deck}</td>
                              <td className="py-3 px-4 text-gold font-body">
                                {card.playerColor === 'red' ? 'Red' : card.playerColor === 'blue' ? 'Blue' : card.playerColor === 'any' ? 'Any' : 'Neutral'}
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleEdit(card)}
                                  className="text-gold font-display font-semibold hover:text-velvet transition-colors text-left"
                                >
                                  {card.title}
                                </button>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-gold font-body text-sm max-w-md">{card.description}</p>
                              </td>
                              <td className="py-3 px-4">
                                {card.isCustom ? (
                                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-body rounded">Custom</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-600 text-white text-xs font-body rounded">Base</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit Modal */}
          <AnimatePresence>
            {showEditModal && editingCard && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/60 z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCard(null)
                  }}
                />
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-3xl font-display gold-text">
                        Edit Card
                      </h2>
                      <button
                        onClick={() => {
                          setShowEditModal(false)
                          setEditingCard(null)
                        }}
                        className="text-gold hover:text-gold transition-colors text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-title" className="block text-gold font-body font-semibold mb-2 text-left">
                            Title
                          </label>
                          <input
                            id="edit-title"
                            type="text"
                            {...editForm.register('title')}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                          />
                          {editForm.formState.errors.title && (
                            <p className="text-crimson text-sm mt-1 text-left">
                              {editForm.formState.errors.title.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="edit-deck" className="block text-gold font-body font-semibold mb-2 text-left">
                            Deck
                          </label>
                          <select
                            id="edit-deck"
                            {...editForm.register('deck')}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                          >
                            <option value="A">Deck A</option>
                            <option value="B">Deck B</option>
                            <option value="C">Deck C</option>
                            <option value="D">Deck D</option>
                            <option value="black">Black Deck</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="edit-description" className="block text-gold font-body font-semibold mb-2 text-left">
                          Description
                        </label>
                        <textarea
                          id="edit-description"
                          {...editForm.register('description')}
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
                        />
                        {editForm.formState.errors.description && (
                          <p className="text-crimson text-sm mt-1 text-left">
                            {editForm.formState.errors.description.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="edit-player-color" className="block text-gold font-body font-semibold mb-2 text-left">
                          Player Color
                        </label>
                        <select
                          id="edit-player-color"
                          {...editForm.register('playerColor')}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                        >
                          <option value="red">Red</option>
                          <option value="blue">Blue</option>
                          <option value="any">Any</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gold font-body font-semibold mb-2 text-left">
                          Tags
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {AVAILABLE_TAGS.map(tag => {
                            const currentTags = editForm.watch('tags') || []
                            const isSelected = currentTags.includes(tag)
                            return (
                              <label key={tag} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const newTags = e.target.checked
                                      ? [...currentTags, tag]
                                      : currentTags.filter(t => t !== tag)
                                    editForm.setValue('tags', newTags)
                                  }}
                                  className="w-4 h-4 text-gold border-gold/30 rounded focus:ring-gold/20"
                                />
                                <span className="text-gold font-body text-sm">{tag}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            {...editForm.register('isSwapCard')}
                            className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                          />
                          <span className="text-velvet font-body font-semibold">
                            Swap Card
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            {...editForm.register('isEnabled')}
                            className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                          />
                          <span className="text-velvet font-body font-semibold">
                            Enabled
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            {...editForm.register('isFavorite')}
                            className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                          />
                          <span className="text-velvet font-body font-semibold">
                            ⭐ Favorite
                          </span>
                        </label>
                      </div>

                      {!canEditCard(editingCard) && (
                        <div className="p-4 bg-crimson/20 border border-crimson/50 rounded-lg">
                          <p className="text-crimson text-sm text-center">
                            You don't have permission to edit this card
                          </p>
                        </div>
                      )}

                      <div className="flex gap-4 mt-6">
                        <motion.button
                          type="submit"
                          disabled={!canEditCard(editingCard)}
                          className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={canEditCard(editingCard) ? { scale: 1.05 } : {}}
                          whileTap={canEditCard(editingCard) ? { scale: 0.95 } : {}}
                        >
                          Save Changes
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => {
                            setShowEditModal(false)
                            setEditingCard(null)
                          }}
                          className="px-6 py-3 bg-velvet/80 text-gold font-body text-lg rounded-lg hover:bg-velvet transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="text-center mt-8">
            <motion.button
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Settings
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
