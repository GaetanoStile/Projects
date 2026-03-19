import { useGameStore } from '@/state/store'

let cardFlipAudio: HTMLAudioElement | null = null
let blackDeckAudio: HTMLAudioElement | null = null

export function playCardFlipSound() {
  const { settings } = useGameStore.getState()
  if (!settings.soundEnabled) return

  if (!cardFlipAudio) {
    cardFlipAudio = new Audio("/sounds/card_flip.wav")
    cardFlipAudio.volume = 0.4
  }
  cardFlipAudio.currentTime = 0
  cardFlipAudio.play().catch(() => {})
}

export function playBlackDeckAppearSound() {
  const { settings } = useGameStore.getState()
  if (!settings.soundEnabled) return

  if (!blackDeckAudio) {
    blackDeckAudio = new Audio("/sounds/blackdeckappear.wav")
    blackDeckAudio.volume = 0.5
  }
  blackDeckAudio.currentTime = 0
  blackDeckAudio.play().catch(() => {})
}
