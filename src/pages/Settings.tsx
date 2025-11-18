import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGameStore } from '@/state/store'
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
  const { settings, setSettings } = useGameStore()

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
    navigate('/dice')
  }

  return (
    <div className="candlelit-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
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
                  <label htmlFor="playerRedName" className="block text-velvet font-body font-semibold mb-2 text-left">
                    Player 1 Name (Female/Red)
                  </label>
                  <input
                    id="playerRedName"
                    type="text"
                    {...register('playerRedName')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                    placeholder="Natalie"
                  />
                  {errors.playerRedName && (
                    <p className="text-crimson text-sm mt-1 text-left">
                      {errors.playerRedName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="playerBlueName" className="block text-velvet font-body font-semibold mb-2 text-left">
                    Player 2 Name (Male/Blue)
                  </label>
                  <input
                    id="playerBlueName"
                    type="text"
                    {...register('playerBlueName')}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gold/30 bg-white/90 text-velvet font-body focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
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
                    <span className="text-velvet font-body font-semibold">
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
                    <span className="text-velvet font-body font-semibold">
                      Include custom cards for Blue
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column: Explainer */}
              <div className="space-y-4">
                <div className="p-4 bg-gold/10 rounded-lg border border-gold/30">
                  <h3 className="text-velvet font-display text-xl mb-3">How It Works</h3>
                  <ul className="text-velvet font-body text-sm space-y-2 text-left">
                    <li>• Custom cards you create will appear in gameplay when toggles are ON</li>
                    <li>• Swap cards unlock the black deck after collecting 3</li>
                    <li>• Cards never repeat within a session</li>
                    <li>• Each player has decks A, B, C, and D</li>
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
        </form>
      </motion.div>
    </div>
  )
}

