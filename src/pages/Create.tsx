import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGameStore, Card, DeckLetter } from '@/state/store'
import { useAuthStore } from '@/state/authStore'
import { getSupabaseClient } from '@/lib/supabase/client'
import { createCard, deleteCard as deleteCloudCard } from '@/lib/supabase/cards'
import Candle from '@/components/Candle'

const CustomCardSchema = z.object({
  title: z.string().trim().min(2).max(60),
  description: z.string().trim().min(4).max(240),
  playerColor: z.enum(['red', 'blue', 'any']),
  deck: z.enum(['A', 'B', 'C', 'D']),
  isSwapCard: z.boolean().optional().default(false),
  imageDataUrl: z.string().url().optional().or(z.literal('')),
})

type CustomCardFormData = z.infer<typeof CustomCardSchema>

export default function Create() {
  const navigate = useNavigate()
  const { customCards, addCustomCard, deleteCustomCard, syncCloudCards, cloudCards } = useGameStore()
  const { mode, user } = useAuthStore()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationError, setMigrationError] = useState<string | null>(null)

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
      imageDataUrl: data.imageDataUrl || undefined,
    }

    // Cloud mode: create in Supabase
    if (mode === 'cloud' && user) {
      const { client } = getSupabaseClient()
      if (client) {
        const cloudCard = await createCard(client, newCard, user.id)
        if (cloudCard) {
          // Sync to update local cloudCards state
          await syncCloudCards()
          reset()
          setImagePreview(null)
          return
        } else {
          // Fallback to local if Supabase fails
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

      // Get local cards that don't have a Supabase ID (not already in cloud)
      const localOnlyCards = customCards.filter(card => 
        !card.id.startsWith('custom-') || !cloudCards.user.some(cc => cc.id === card.id)
      )

      if (localOnlyCards.length === 0) {
        setMigrationError('No local cards to migrate')
        return
      }

      // Create each card in Supabase
      for (const card of localOnlyCards) {
        await createCard(client, card, user.id)
      }

      // Sync to update state
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

  const [filterColor, setFilterColor] = useState<'all' | 'red' | 'blue' | 'any'>('all')
  const [filterDeck, setFilterDeck] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all')

  // Combine local and cloud cards for display
  const allCustomCards = useMemo(() => {
    if (mode === 'cloud') {
      return [...cloudCards.user, ...customCards.filter(c => 
        !cloudCards.user.some(cc => cc.id === c.id)
      )]
    }
    return customCards
  }, [mode, customCards, cloudCards.user])

  const filteredCards = useMemo(() => {
    return allCustomCards.filter(card => {
      const colorMatch = filterColor === 'all' || card.playerColor === filterColor
      const deckMatch = filterDeck === 'all' || card.deck === filterDeck
      return colorMatch && deckMatch
    })
  }, [allCustomCards, filterColor, filterDeck])

  // Check if there are local-only cards to migrate
  const hasLocalOnlyCards = useMemo(() => {
    if (mode !== 'cloud') return false
    return customCards.some(card => 
      !cloudCards.user.some(cc => cc.id === card.id)
    )
  }, [mode, customCards, cloudCards.user])

  return (
    <div className="candlelit-bg min-h-screen relative overflow-hidden">
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
              Create Custom Cards
            </h1>
            <p className="text-lg md:text-xl text-gold/80 font-body">
              Add your own cards to personalize the game
            </p>
            {mode === 'cloud' && user && (
              <p className="text-sm text-gold/60 font-body mt-2">
                Cards will be saved to the cloud
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
                  <p className="text-velvet font-body font-semibold mb-1">
                    Upload local cards to cloud
                  </p>
                  <p className="text-sm text-velvet/70 font-body">
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

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mb-12">
            <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cardTitle" className="block text-velvet font-body font-semibold mb-2 text-left">
                    Title <span className="text-crimson">*</span>
                  </label>
                  <input
                    id="cardTitle"
                    type="text"
                    {...register('title')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="Enter card title (2-60 characters)"
                  />
                  {errors.title && (
                    <p className="text-crimson text-sm mt-1 text-left">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cardPlayerColor" className="block text-velvet font-body font-semibold mb-2 text-left">
                    Player Color
                  </label>
                  <select
                    id="cardPlayerColor"
                    {...register('playerColor')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="any">Any Player</option>
                    <option value="red">Red (Female)</option>
                    <option value="blue">Blue (Male)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cardDescription" className="block text-velvet font-body font-semibold mb-2 text-left">
                    Description <span className="text-crimson">*</span>
                  </label>
                  <textarea
                    id="cardDescription"
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
                    placeholder="Enter card description (4-240 characters)"
                  />
                  {errors.description && (
                    <p className="text-crimson text-sm mt-1 text-left">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cardDeck" className="block text-velvet font-body font-semibold mb-2 text-left">
                    Deck
                  </label>
                  <select
                    id="cardDeck"
                    {...register('deck')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="A">Deck A</option>
                    <option value="B">Deck B</option>
                    <option value="C">Deck C</option>
                    <option value="D">Deck D</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cardImage" className="block text-velvet font-body font-semibold mb-2 text-left">
                    Optional Image
                  </label>
                  <input
                    id="cardImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
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

                <div className="flex items-center gap-3 pt-6">
                  <input
                    id="isSwapCard"
                    type="checkbox"
                    {...register('isSwapCard')}
                    className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                  />
                  <label htmlFor="isSwapCard" className="text-velvet font-body font-semibold cursor-pointer">
                    This is a swap card
                  </label>
                </div>
              </div>

              {isSwapCard && (
                <div className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                  <p className="text-velvet font-body text-sm">
                    ⚠️ Warning: Many swap cards will speed up black deck unlock (3 swaps needed)
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    minWidth: '160px',
                    minHeight: '44px',
                  }}
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
                  style={{
                    minWidth: '160px',
                    minHeight: '44px',
                  }}
                >
                  Clear Form
                </motion.button>
              </div>
            </div>
          </form>

          {/* My Custom Cards List */}
          <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm">
            <h2 className="text-3xl md:text-4xl font-display gold-text mb-6 text-center">
              My Custom Cards
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              <div>
                <label className="block text-velvet font-body font-semibold mb-2 text-sm">
                  Filter by Color
                </label>
                <select
                  value={filterColor}
                  onChange={(e) => setFilterColor(e.target.value as any)}
                  className="px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold"
                >
                  <option value="all">All Colors</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div>
                <label className="block text-velvet font-body font-semibold mb-2 text-sm">
                  Filter by Deck
                </label>
                <select
                  value={filterDeck}
                  onChange={(e) => setFilterDeck(e.target.value as any)}
                  className="px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold"
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
            {filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-velvet font-body text-lg">
                  No custom cards yet. Create your first card above!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => (
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
                      <h3 className="text-velvet font-display font-semibold text-lg flex-1">
                        {card.title}
                      </h3>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="ml-2 text-crimson hover:text-red-700 transition-colors"
                        aria-label="Delete card"
                        style={{ minWidth: '32px', minHeight: '32px' }}
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
                      <span className="px-2 py-1 bg-gold/20 text-velvet text-xs font-body rounded">
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

          {/* Navigation */}
          <div className="text-center mt-8">
            <motion.button
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                minWidth: '160px',
                minHeight: '44px',
              }}
            >
              Back to Settings
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

