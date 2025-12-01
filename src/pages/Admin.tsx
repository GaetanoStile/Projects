import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/state/authStore'
import { useGameStore, Card, DeckLetter, PlayerColor } from '@/state/store'
import { getSupabaseClient } from '@/lib/supabase/client'
import { fetchGlobalCards, createGlobalCard, updateGlobalCard, deleteGlobalCard } from '@/lib/supabase/cards'
import { isCloudEnabled } from '@/lib/config'
import Candle from '@/components/Candle'

const AdminCardSchema = z.object({
  title: z.string().trim().min(2).max(60),
  description: z.string().trim().min(4).max(240),
  playerColor: z.enum(['red', 'blue', 'any', 'neutral']),
  deck: z.enum(['A', 'B', 'C', 'D', 'black']),
  isSwapCard: z.boolean().optional().default(false),
})

type AdminCardFormData = z.infer<typeof AdminCardSchema>

export default function Admin() {
  const navigate = useNavigate()
  const { user, mode, isAdmin } = useAuthStore()
  const { cloudCards, syncCloudCards } = useGameStore()
  const [isLoading, setIsLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterDeck, setFilterDeck] = useState<'all' | DeckLetter>('all')
  const [filterColor, setFilterColor] = useState<'all' | PlayerColor | 'neutral'>('all')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdminCardFormData>({
    resolver: zodResolver(AdminCardSchema),
    defaultValues: {
      title: '',
      description: '',
      playerColor: 'neutral',
      deck: 'A',
      isSwapCard: false,
    },
  })

  // Redirect if not authorized
  useEffect(() => {
    if (!isCloudEnabled() || mode !== 'cloud' || !user || !isAdmin) {
      navigate('/')
    }
  }, [mode, user, isAdmin, navigate])

  // Load global cards
  useEffect(() => {
    const loadCards = async () => {
      if (mode === 'cloud' && user && isAdmin) {
        setIsLoading(true)
        await syncCloudCards()
        setIsLoading(false)
      }
    }
    loadCards()
  }, [mode, user, isAdmin, syncCloudCards])

  const globalCards = cloudCards.global

  const filteredCards = useMemo(() => {
    return globalCards.filter(card => {
      const deckMatch = filterDeck === 'all' || card.deck === filterDeck
      const colorMatch = filterColor === 'all' || card.playerColor === filterColor
      return deckMatch && colorMatch
    })
  }, [globalCards, filterDeck, filterColor])

  const onSubmit = async (data: AdminCardFormData) => {
    const { client } = getSupabaseClient()
    if (!client) return

    const cardData: Card = {
      id: editingCard?.id || `temp-${Date.now()}`,
      title: data.title,
      description: data.description,
      deck: data.deck as DeckLetter,
      playerColor: data.playerColor,
      isSwapCard: data.isSwapCard || false,
      isCustom: false,
    }

    try {
      if (editingCard) {
        await updateGlobalCard(client, editingCard.id, cardData)
      } else {
        await createGlobalCard(client, cardData)
      }
      await syncCloudCards()
      reset()
      setEditingCard(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error saving card:', error)
    }
  }

  const handleEdit = (card: Card) => {
    setEditingCard(card)
    setValue('title', card.title)
    setValue('description', card.description)
    setValue('playerColor', card.playerColor as PlayerColor | 'neutral')
    setValue('deck', card.deck)
    setValue('isSwapCard', card.isSwapCard || false)
    setShowForm(true)
  }

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this global card?')) return

    const { client } = getSupabaseClient()
    if (!client) return

    try {
      await deleteGlobalCard(client, cardId)
      await syncCloudCards()
    } catch (error) {
      console.error('Error deleting card:', error)
    }
  }

  const handleCancel = () => {
    reset()
    setEditingCard(null)
    setShowForm(false)
  }

  if (!isCloudEnabled() || mode !== 'cloud' || !user || !isAdmin) {
    return null
  }

  return (
    <div className="candlelit-bg min-h-screen relative overflow-hidden">
      {/* Candles */}
      <div className="absolute top-10 left-5 md:left-10 opacity-30">
        <Candle size={40} />
      </div>
      <div className="absolute top-20 right-5 md:right-10 opacity-30">
        <Candle size={35} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-display gold-text mb-2">
                Admin Panel
              </h1>
              <p className="text-lg text-gold/80 font-body">
                Manage global cards
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <motion.div
              className="mb-8 parchment-bg rounded-2xl p-8 glow-warm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-display gold-text mb-6">
                {editingCard ? 'Edit Global Card' : 'Add Global Card'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin-title" className="block text-velvet font-body font-semibold mb-2 text-left">
                      Title
                    </label>
                    <input
                      id="admin-title"
                      type="text"
                      {...register('title')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                    {errors.title && (
                      <p className="text-crimson text-sm mt-1 text-left">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="admin-deck" className="block text-velvet font-body font-semibold mb-2 text-left">
                      Deck
                    </label>
                    <select
                      id="admin-deck"
                      {...register('deck')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      <option value="A">Deck A</option>
                      <option value="B">Deck B</option>
                      <option value="C">Deck C</option>
                      <option value="D">Deck D</option>
                      <option value="black">Black Deck</option>
                    </select>
                    {errors.deck && (
                      <p className="text-crimson text-sm mt-1 text-left">{errors.deck.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-description" className="block text-velvet font-body font-semibold mb-2 text-left">
                    Description
                  </label>
                  <textarea
                    id="admin-description"
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                  {errors.description && (
                    <p className="text-crimson text-sm mt-1 text-left">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin-player-color" className="block text-velvet font-body font-semibold mb-2 text-left">
                      Player Color
                    </label>
                    <select
                      id="admin-player-color"
                      {...register('playerColor')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="any">Any</option>
                      <option value="neutral">Neutral</option>
                    </select>
                    {errors.playerColor && (
                      <p className="text-crimson text-sm mt-1 text-left">{errors.playerColor.message}</p>
                    )}
                  </div>

                  <div className="flex items-end">
                    <label htmlFor="admin-swap-card" className="flex items-center gap-3 cursor-pointer">
                      <input
                        id="admin-swap-card"
                        type="checkbox"
                        {...register('isSwapCard')}
                        className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                      />
                      <span className="text-velvet font-body font-semibold">
                        Is Swap Card
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {editingCard ? 'Update Card' : 'Create Card'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-velvet/80 text-gold font-body text-lg rounded-lg hover:bg-velvet transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Filters and Add Button */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={filterDeck}
                onChange={(e) => setFilterDeck(e.target.value as 'all' | DeckLetter)}
                className="px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold"
              >
                <option value="all">All Decks</option>
                <option value="A">Deck A</option>
                <option value="B">Deck B</option>
                <option value="C">Deck C</option>
                <option value="D">Deck D</option>
                <option value="black">Black Deck</option>
              </select>
              <select
                value={filterColor}
                onChange={(e) => setFilterColor(e.target.value as 'all' | PlayerColor | 'neutral')}
                className="px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold"
              >
                <option value="all">All Colors</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="any">Any</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            {!showForm && (
              <motion.button
                onClick={() => {
                  setShowForm(true)
                  setEditingCard(null)
                  reset()
                }}
                className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Global Card
              </motion.button>
            )}
          </div>

          {/* Cards List */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gold/80 font-body">Loading cards...</p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12 parchment-bg rounded-lg glow-warm">
              <p className="text-velvet font-body">No global cards found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => (
                <motion.div
                  key={card.id}
                  className="parchment-bg rounded-lg p-4 glow-warm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-velvet font-display text-lg font-semibold">{card.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(card)}
                        className="text-gold hover:text-gold/80 text-sm font-body"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="text-crimson hover:text-crimson/80 text-sm font-body"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-velvet/80 font-body text-sm mb-2 line-clamp-2">{card.description}</p>
                  <div className="flex gap-2 text-xs text-velvet/60 font-body">
                    <span>Deck: {card.deck}</span>
                    <span>•</span>
                    <span>Color: {card.playerColor}</span>
                    {card.isSwapCard && <span>•</span>}
                    {card.isSwapCard && <span>Swap Card</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

