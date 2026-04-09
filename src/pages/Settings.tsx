import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGameStore } from '@/state/store'
import { useAuthStore } from '@/state/authStore'
import { useSessionStore } from '@/state/sessionStore'
import AuthModal from '@/components/AuthModal'
import { playButtonClickSoundFromEvent } from '@/lib/sound'
import { isCloudEnabled } from '@/lib/config'
import { useCloudCards } from '@/hooks/useCloudCards'
import Candle from '@/components/Candle'
import { isPaidPlan, FEATURE_LABELS, PREMIUM_FEATURES } from '@/lib/features'

const SettingsSchema = z.object({
  playerRedName: z.string().trim().min(1).max(24),
  playerBlueName: z.string().trim().min(1).max(24),
  includeCustomRed: z.boolean(),
  includeCustomBlue: z.boolean(),
})

type SettingsFormData = z.infer<typeof SettingsSchema>

export default function Settings() {
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')
  const { 
    settings, 
    setSettings, 
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    cardOverrides
  } = useGameStore()
  const { user, profile, isAuthenticated, mode, planTier, signOut } = useAuthStore()
  const { activeSession, checkForActiveSession, loadSession } = useSessionStore()
  const cloudEnabled = isCloudEnabled()
  
  useEffect(() => {
    if (localStorage.getItem('cg.disclaimerAccepted') !== 'true') {
      navigate('/disclaimer', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (isAuthenticated) {
      void checkForActiveSession()
    }
  }, [isAuthenticated, checkForActiveSession])

  // Fetch cloud cards when in cloud mode
  useCloudCards()

  const [showSavePresetModal, setShowSavePresetModal] = useState(false)
  const [presetName, setPresetName] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      playerRedName: settings.playerRedName,
      playerBlueName: settings.playerBlueName,
      includeCustomRed: settings.includeCustomRed,
      includeCustomBlue: settings.includeCustomBlue,
    },
  })

  const onSubmit = (data: SettingsFormData) => {
    setSettings(data)
    const hasSeenHowToPlay = useGameStore.getState().settings.hasSeenHowToPlay
    navigate(hasSeenHowToPlay ? '/dice' : '/how-to-play')
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name')
      return
    }

    // Get disabled card IDs from overrides
    const disabledCardIds = Object.keys(cardOverrides).filter(
      id => cardOverrides[id].isEnabled === false
    )

    savePreset({
      name: presetName.trim(),
      includeCustomRed: settings.includeCustomRed,
      includeCustomBlue: settings.includeCustomBlue,
      disabledCardIds,
    })

    setPresetName('')
    setShowSavePresetModal(false)
  }

  const handleLoadPreset = (presetId: string) => {
    if (!confirm('This will apply preset settings and disable/enable cards. Continue?')) {
      return
    }
    loadPreset(presetId)
  }

  const handleDeletePreset = (presetId: string) => {
    if (!confirm('Delete this preset?')) {
      return
    }
    deletePreset(presetId)
  }

  return (
    <div
      className="candlelit-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-12"
      onPointerDownCapture={playButtonClickSoundFromEvent}
    >
      {/* Candles */}
      <div className="absolute top-20 left-10 md:left-20">
        <Candle size={50} />
      </div>
      <div className="absolute top-32 right-10 md:right-20">
        <Candle size={45} />
      </div>
      <div className="absolute bottom-40 left-1/4">
        <Candle size={40} />
      </div>
      <div className="absolute bottom-32 right-1/4">
        <Candle size={48} />
      </div>

      {/* Content */}
      <motion.div
        className="text-center z-10 px-4 w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-display gold-text mb-8">
          Game Settings
        </h1>

        {/* Resume banner — shown only when a logged-in user has an unfinished session */}
        {isAuthenticated && activeSession && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-gold/30 bg-gold/10 px-5 py-3 text-left">
            <div>
              <p className="text-sm font-body font-semibold text-gold">You have an unfinished game</p>
              <p className="text-xs text-gold/70 font-body mt-0.5">
                {activeSession.player_red_name} &amp; {activeSession.player_blue_name} &mdash; {activeSession.used_card_ids.length} cards drawn
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                loadSession(activeSession)
                navigate('/game')
              }}
              className="shrink-0 rounded-lg bg-gold px-4 py-2 text-sm font-display text-velvet hover:bg-gold/90 transition-colors"
            >
              Resume &rarr;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Names and Toggles */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="playerRedName" className="block text-gold font-body font-semibold mb-2 text-left">
                    Player 1 Name (Female/Red)
                  </label>
                  <input
                    id="playerRedName"
                    type="text"
                    {...register('playerRedName')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-velvet/50"
                    placeholder="Natalie"
                  />
                  {errors.playerRedName && (
                    <p className="text-crimson text-sm mt-1 text-left">
                      {errors.playerRedName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="playerBlueName" className="block text-gold font-body font-semibold mb-2 text-left">
                    Player 2 Name (Male/Blue)
                  </label>
                  <input
                    id="playerBlueName"
                    type="text"
                    {...register('playerBlueName')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-velvet/50"
                    placeholder="Jordan"
                  />
                  {errors.playerBlueName && (
                    <p className="text-crimson text-sm mt-1 text-left">
                      {errors.playerBlueName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <label htmlFor="includeCustomRed" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="includeCustomRed"
                      type="checkbox"
                      {...register('includeCustomRed')}
                      className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                    />
                    <span className="text-gold font-body font-semibold">
                      Include custom cards for Red
                    </span>
                  </label>

                  <label htmlFor="includeCustomBlue" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="includeCustomBlue"
                      type="checkbox"
                      {...register('includeCustomBlue')}
                      className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                    />
                    <span className="text-gold font-body font-semibold">
                      Include custom cards for Blue
                    </span>
                  </label>

                  <label htmlFor="soundEnabled" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="soundEnabled"
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings({ soundEnabled: e.target.checked })}
                      className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                    />
                    <span className="text-gold font-body font-semibold">
                      Sound Effects
                    </span>
                  </label>

                  <label htmlFor="musicEnabled" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="musicEnabled"
                      type="checkbox"
                      checked={settings.musicEnabled}
                      onChange={(e) => setSettings({ musicEnabled: e.target.checked })}
                      className="w-5 h-5 text-gold border-gold/30 rounded focus:ring-gold/20"
                    />
                    <span className="text-gold font-body font-semibold">
                      Gameplay music (ambient)
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column: Explainer */}
              <div className="space-y-4">
                <div className="p-4 bg-gold/10 rounded-lg border border-gold/30">
                  <h3 className="text-gold font-display text-xl mb-3">How It Works</h3>
                  <ul className="text-gold font-body text-sm space-y-2 text-left">
                    <li>• Custom cards you create will appear in gameplay when toggles are ON</li>
                    <li>• Each player can access the Black deck once they hold 2 or more swap cards</li>
                    <li>• Cards never repeat within a session</li>
                    <li>• Each player has decks A, B, C, and D</li>
                    <li>• Disable cards in the Card Manager to exclude them</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/create')}
                    className="w-full px-6 py-3 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors font-semibold"
                  >
                    Go to Card Creation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {cloudEnabled && (
            <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm mb-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="text-left">
                  <h2 className="text-2xl md:text-3xl font-display gold-text mb-2">
                    Account
                  </h2>
                  <p className="text-gold/80 font-body">
                    Account mode keeps your identity across refresh and unlocks personal cloud features.
                  </p>
                </div>

                {isAuthenticated ? (
                  <div className="rounded-xl border border-gold/25 bg-white/85 p-5 text-left min-w-[260px]">
                    <div className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                      Signed In
                    </div>
                    <div className="text-gold font-display text-xl">
                      {profile?.displayName || user?.displayName || user?.email}
                    </div>
                    <div className="text-sm text-gold/80 mt-1 break-all">
                      {profile?.email || user?.email}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs uppercase tracking-[0.18em]">
                        {profile?.planTier || 'free'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-velvet/10 text-velvet text-xs uppercase tracking-[0.18em]">
                        {mode === 'cloud' ? 'Account mode' : 'Guest mode'}
                      </span>
                      {profile?.isAdmin && (
                        <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-xs uppercase tracking-[0.18em]">
                          Admin
                        </span>
                      )}
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => {
                        void signOut()
                      }}
                      className="mt-5 w-full px-5 py-3 bg-velvet/85 text-gold font-body rounded-lg hover:bg-velvet transition-colors font-semibold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Log Out
                    </motion.button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gold/25 bg-white/85 p-5 text-left min-w-[260px]">
                    <div className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">
                      Guest Mode
                    </div>
                    <div className="text-gold font-display text-xl">
                      Playing locally
                    </div>
                    <p className="text-sm text-gold/80 mt-2">
                      Create an account or log in to keep a persistent identity in the app.
                    </p>
                    <div className="mt-5 flex flex-col gap-3">
                      <motion.button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('signup')
                          setShowAuthModal(true)
                        }}
                        className="w-full px-5 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Sign Up
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('login')
                          setShowAuthModal(true)
                        }}
                        className="w-full px-5 py-3 bg-velvet/85 text-gold font-body rounded-lg hover:bg-velvet transition-colors font-semibold"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Log In
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plan Section — only shown when cloud/account mode is enabled */}
          {cloudEnabled && isAuthenticated && (
            <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm mb-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="text-left">
                  <h2 className="text-2xl md:text-3xl font-display gold-text mb-2">
                    Your Plan
                  </h2>
                  <p className="text-gold/80 font-body">
                    Premium features unlock exclusive experiences for you and your partner.
                  </p>
                </div>

                <div className="rounded-xl border border-gold/25 bg-white/85 p-5 text-left min-w-[260px]">
                  {/* Current tier pill */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs uppercase tracking-[0.2em] text-gold/70">Current Plan</span>
                    {isPaidPlan(planTier) ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-700 text-xs font-display uppercase tracking-[0.18em] font-semibold">
                        Paid
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-display uppercase tracking-[0.18em] font-semibold">
                        Free
                      </span>
                    )}
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-3 mb-5">
                    {(Object.values(PREMIUM_FEATURES) as Array<keyof typeof FEATURE_LABELS>).map(feature => (
                      <li key={feature} className="flex items-center gap-3">
                        {isPaidPlan(planTier) ? (
                          <span className="text-emerald-600 text-base leading-none flex-shrink-0">✓</span>
                        ) : (
                          <span className="text-gold/50 text-base leading-none flex-shrink-0">🔒</span>
                        )}
                        <span className={`font-body text-sm ${isPaidPlan(planTier) ? 'text-gold' : 'text-gold/60'}`}>
                          {FEATURE_LABELS[feature]}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Paid user — Library link */}
                  {isPaidPlan(planTier) && (
                    <Link
                      to="/library"
                      className="block w-full px-5 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all text-sm text-center"
                    >
                      Browse Community Library
                    </Link>
                  )}

                  {/* Upgrade CTA — free users only */}
                  {!isPaidPlan(planTier) && (
                    <div className="rounded-lg border border-gold/40 bg-gradient-to-br from-gold/10 to-gold/5 p-4 text-center">
                      <p className="text-gold font-body text-sm mb-3 font-semibold">
                        Upgrade to unlock premium features
                      </p>
                      <Link
                        to="/pricing"
                        className="block w-full px-5 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all text-sm"
                      >
                        Unlock Premium
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Presets Section */}
          <div className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-display gold-text mb-4 sm:mb-0">
                Presets
              </h2>
              <motion.button
                type="button"
                onClick={() => setShowSavePresetModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save Current as Preset
              </motion.button>
            </div>

            {presets.length === 0 ? (
              <p className="text-gold/80 font-body text-center py-8">
                No presets saved yet. Save your current configuration to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 bg-white/90 rounded-lg border-2 border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="text-gold font-display font-semibold text-lg mb-1">
                        {preset.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gold/80 font-body">
                        <span>{preset.disabledCardIds.length} disabled cards</span>
                        <span>•</span>
                        <span>
                          Custom: {preset.includeCustomRed ? 'Red' : ''} {preset.includeCustomBlue ? 'Blue' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        type="button"
                        onClick={() => handleLoadPreset(preset.id)}
                        className="px-4 py-2 bg-gold/20 text-gold font-body rounded-lg hover:bg-gold/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Load
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="px-4 py-2 bg-crimson/20 text-crimson font-body rounded-lg hover:bg-crimson/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display text-xl rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                minWidth: '200px',
                minHeight: '56px',
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
              }}
            >
              Save & Roll Dice
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/create')}
              className="px-8 py-4 bg-velvet/80 text-gold font-body text-xl rounded-lg hover:bg-velvet transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                minWidth: '200px',
                minHeight: '56px',
              }}
            >
              Go to Card Creation
            </motion.button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate('/how-to-play')}
              className="text-gold/60 hover:text-gold text-sm font-body underline transition-colors"
            >
              View How To Play
            </button>
          </div>
        </form>
      </motion.div>

      {/* Save Preset Modal */}
      <AnimatePresence>
        {showSavePresetModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSavePresetModal(false)
                setPresetName('')
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
                className="parchment-bg rounded-2xl p-8 md:p-12 glow-warm max-w-md w-full"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <h2 className="text-2xl font-display gold-text mb-4">
                  Save Preset
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="presetName" className="block text-gold font-body font-semibold mb-2 text-left">
                      Preset Name
                    </label>
                    <input
                      id="presetName"
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Enter preset name..."
                      className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-gold font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-velvet/50"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      type="button"
                      onClick={handleSavePreset}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-gold to-gold/80 text-velvet font-display rounded-lg glow-gold hover:from-gold/90 hover:to-gold/70 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Save
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => {
                        setShowSavePresetModal(false)
                        setPresetName('')
                      }}
                      className="flex-1 px-6 py-3 bg-velvet/80 text-gold font-body rounded-lg hover:bg-velvet transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestMode={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  )
}
