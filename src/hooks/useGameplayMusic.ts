import { useEffect, useRef } from 'react'

const MUSIC_URL = '/sounds/flame.mp3'

/**
 * Loops ambient gameplay music while `musicEnabled` is true.
 * Cleans up on unmount or when music is turned off.
 */
export function useGameplayMusic(musicEnabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!musicEnabled) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
      return
    }

    const audio = new Audio(MUSIC_URL)
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio

    const tryPlay = () => {
      void audio.play().catch(() => {})
    }
    tryPlay()

    const onFirstPointer = () => {
      tryPlay()
      window.removeEventListener('pointerdown', onFirstPointer)
    }
    window.addEventListener('pointerdown', onFirstPointer)

    return () => {
      window.removeEventListener('pointerdown', onFirstPointer)
      audio.pause()
      audio.currentTime = 0
      audioRef.current = null
    }
  }, [musicEnabled])
}
