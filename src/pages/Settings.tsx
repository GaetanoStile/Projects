import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGameStore } from '@/state/store'
import { useCloudCards } from '@/hooks/useCloudCards'
import Candle from '@/components/Candle'

const SettingsSchema = z.object({
  playerRedName: z.string().trim().min(1).max(24),
  playerBlueName: z.string().trim().min(1).max(24),
  includeCustomRed: z.boolean(),
  includeCustomBlue: z.boolean(),
})

type SettingsFormData = z.infer<typeof SettingsSchema>

export default function Settings() {
  const navigate = useNavigate()
  const { 
    settings, 
    setSettings, 
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    cardOverrides
  } = useGameStore()
  
  useEffect(() => {
    if (localStorage.getItem('cg.disclaimerAccepted') !== 'true') {
      navigate('/disclaimer', { replace: true })
    }
  }, [navigate])

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
    <div className="candlelit-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-12">
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
    </div>
  )
}
