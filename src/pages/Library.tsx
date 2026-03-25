import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/state/authStore'
import { useGameStore, DeckLetter, PlayerColor, Tag, AVAILABLE_TAGS } from '@/state/store'
import { getSupabaseClient } from '@/lib/supabase/client'
import { fetchPublicCardsWithCreators, createCard, LibraryCard } from '@/lib/supabase/cards'
import Candle from '@/components/Candle'
import { playButtonClickSoundFromEvent } from '@/lib/sound'

export default function Library() {
  const navigate = useNavigate()
  const { isAuthenticated, user, mode, planTier } = useAuthStore()
  const { syncCloudCards } = useGameStore()

  const [libraryCards, setLibraryCards] = useState<LibraryCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())

  const [filterSearch, setFilterSearch] = useState('')
  const [filterDeck, setFilterDeck] = useState<'all' | DeckLetter>('all')
  const [filterColor, setFilterColor] = useState<'all' | PlayerColor | 'neutral'>('all')
  const [filterTag, setFilterTag] = useState<'all' | Tag>('all')

  const isPaidUser = planTier !== 'free'

  useEffect(() => {
    if (!isPaidUser) {
      setIsLoading(false)
      return
    }

    const load = async () => {
      setIsLoading(true)
      const { client } = getSupabaseClient()
      const cards = await fetchPublicCardsWithCreators(client)
      setLibraryCards(cards)
      setIsLoading(false)
    }

    void load()
  }, [isPaidUser])

  const filteredCards = useMemo(() => {
    return libraryCards.filter(card => {
      const deckMatch = filterDeck === 'all' || card.deck === filterDeck
      const colorMatch = filterColor === 'all' || card.playerColor === filterColor
      const tagMatch = filterTag === 'all' || (card.tags || []).includes(filterTag)
      const searchMatch =
        !filterSearch ||
        card.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
        card.description.toLowerCase().includes(filterSearch.toLowerCase())
      return deckMatch && colorMatch && tagMatch && searchMatch
    })
  }, [libraryCards, filterDeck, filterColor, filterTag, filterSearch])

  const handleAddToMyCards = async (card: LibraryCard) => {
    if (!isAuthenticated || !user || mode !== 'cloud') return

    setAddingIds(prev => new Set([...prev, card.id]))

    try {
      const cloned = {
        ...card,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isCustom: true,
        isEnabled: true,
        visibility: 'private' as const,
        isFavorite: false,
        creatorName: undefined,
      }

      const { client } = getSupabaseClient()
      if (client) {
        await createCard(client, cloned, user.id)
        await syncCloudCards()
      }

      setAddedIds(prev => new Set([...prev, card.id]))
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev)
        next.delete(card.id)
        return next
      })
    }
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

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-display gold-text mb-4">
              Community Library
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-body">
              Browse public cards created by the community
            </p>
          </div>

          {/* Free-tier gate */}
          {!isPaidUser && (
            <div className="relative">
              {/* Blurred teaser cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 blur-sm pointer-events-none select-none" aria-hidden>
                {[
                  { title: 'A Tender Touch', desc: 'Spend five minutes giving your partner a slow shoulder massage...', deck: 'A', color: 'any' },
                  { title: 'Whispered Secrets', desc: 'Take turns whispering one thing you love about each other...', deck: 'B', color: 'red' },
                  { title: 'The Long Kiss', desc: 'Share a slow, unhurried kiss lasting at least 30 seconds...', deck: 'C', color: 'blue' },
                ].map((p, i) => (
                  <div key={i} className="parchment-bg rounded-xl p-6 glow-warm">
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-1 bg-gold/20 text-gold text-xs font-body rounded">Deck {p.deck}</span>
                      <span className="px-2 py-1 bg-gray-600 text-white text-xs font-body rounded capitalize">{p.color}</span>
                    </div>
                    <h3 className="text-gold font-display text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-velvet/80 font-body text-sm line-clamp-3">{p.desc}</p>
                    <p className="text-gold/50 font-body text-xs mt-3">by Community</p>
                  </div>
                ))}
              </div>

              {/* Lock overlay */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm text-center max-w-md mx-auto shadow-2xl">
                  <div className="text-5xl mb-4">🔒</div>
                  <h2 className="text-2xl md:text-3xl font-display gold-text mb-3">
                    Unlock the Community Library
                  </h2>
                  <p className="text-velvet/80 font-body mb-6">
                    Upgrade to a paid plan to browse hundreds of community-created cards, add them to your collection, and discover new experiences.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.button
                      onClick={() => navigate('/settings')}
                      className="px-8 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-lg rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Upgrade
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/welcome')}
                      className="px-8 py-3 bg-velvet/80 text-gold font-body text-lg rounded-lg hover:bg-velvet transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Full library — paid users */}
          {isPaidUser && (
            <>
              {/* Filter bar */}
              <div className="parchment-bg rounded-2xl p-6 md:p-8 glow-warm mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">Search</label>
                    <input
                      type="text"
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                      placeholder="Search title or description..."
                      className="w-full px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold placeholder:text-velvet/50"
                    />
                  </div>
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">Deck</label>
                    <select
                      value={filterDeck}
                      onChange={e => setFilterDeck(e.target.value as 'all' | DeckLetter)}
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
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">Performer</label>
                    <select
                      value={filterColor}
                      onChange={e => setFilterColor(e.target.value as 'all' | PlayerColor | 'neutral')}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold"
                    >
                      <option value="all">All</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="any">Any</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gold font-body font-semibold mb-2 text-sm">Tag</label>
                    <select
                      value={filterTag}
                      onChange={e => setFilterTag(e.target.value as 'all' | Tag)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold"
                    >
                      <option value="all">All Tags</option>
                      {AVAILABLE_TAGS.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {filteredCards.length > 0 && (
                  <p className="text-gold/60 font-body text-sm mt-4">
                    Showing {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="text-center py-16">
                  <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gold/70 font-body">Loading community cards...</p>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && libraryCards.length === 0 && (
                <div className="text-center py-16 parchment-bg rounded-2xl glow-warm">
                  <p className="text-gold font-display text-xl mb-2">No public cards yet</p>
                  <p className="text-gold/60 font-body text-sm">
                    Be the first! Mark one of your custom cards as Public in the Card Manager.
                  </p>
                  <motion.button
                    onClick={() => navigate('/create')}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Go to Card Manager
                  </motion.button>
                </div>
              )}

              {/* No filter results */}
              {!isLoading && libraryCards.length > 0 && filteredCards.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gold/60 font-body">No cards match your filters.</p>
                </div>
              )}

              {/* Card grid */}
              {!isLoading && filteredCards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredCards.map((card, i) => (
                      <motion.div
                        key={card.id}
                        className="parchment-bg rounded-xl p-6 glow-warm flex flex-col"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                      >
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-gold/20 text-gold text-xs font-body rounded">
                            Deck {card.deck}
                          </span>
                          <span className={`px-2 py-1 text-white text-xs font-body rounded ${
                            card.playerColor === 'red'
                              ? 'bg-red-600'
                              : card.playerColor === 'blue'
                              ? 'bg-blue-600'
                              : 'bg-gray-600'
                          }`}>
                            {card.playerColor === 'red' ? 'Red' : card.playerColor === 'blue' ? 'Blue' : 'Any'}
                          </span>
                          {card.isSwapCard && (
                            <span className="px-2 py-1 bg-gold text-velvet text-xs font-body rounded">
                              Swap
                            </span>
                          )}
                          {(card.tags || []).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-purple-700 text-white text-xs font-body rounded">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Title + description */}
                        <h3 className="text-gold font-display text-lg font-semibold mb-2 leading-snug">
                          {card.title}
                        </h3>
                        <p className="text-velvet/80 font-body text-sm line-clamp-3 flex-1">
                          {card.description}
                        </p>

                        {/* Creator */}
                        <p className="text-gold/50 font-body text-xs mt-3 mb-4">
                          by {card.creatorName || 'Community'}
                        </p>

                        {/* Add to My Cards */}
                        {mode === 'cloud' ? (
                          <motion.button
                            onClick={() => handleAddToMyCards(card)}
                            disabled={addedIds.has(card.id) || addingIds.has(card.id)}
                            className={`w-full py-2 px-4 rounded-lg font-body text-sm transition-all ${
                              addedIds.has(card.id)
                                ? 'bg-green-700/40 text-green-300 cursor-default'
                                : 'bg-gradient-to-r from-gold to-gold/80 text-velvet glow-gold hover:from-gold/90 hover:to-gold/70 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                            whileHover={!addedIds.has(card.id) && !addingIds.has(card.id) ? { scale: 1.02 } : {}}
                            whileTap={!addedIds.has(card.id) && !addingIds.has(card.id) ? { scale: 0.98 } : {}}
                          >
                            {addingIds.has(card.id)
                              ? 'Adding...'
                              : addedIds.has(card.id)
                              ? 'Added to My Cards'
                              : 'Add to My Cards'}
                          </motion.button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2 px-4 rounded-lg font-body text-sm bg-velvet/40 text-gold/40 cursor-not-allowed"
                            title="Sign in to add cards to your collection"
                          >
                            Sign in to add cards
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* Back navigation */}
          <div className="text-center mt-10">
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
