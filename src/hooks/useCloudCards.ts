import { useEffect } from 'react'
import { useAuthStore } from '@/state/authStore'
import { useGameStore } from '@/state/store'

/**
 * Hook to fetch and sync cloud cards when in cloud mode
 * Should be called when user logs in or navigates to game setup
 */
export const useCloudCards = () => {
  const { mode, user } = useAuthStore()
  const { syncCloudCards } = useGameStore()

  useEffect(() => {
    if (mode === 'cloud' && user) {
      syncCloudCards()
    }
  }, [mode, user, syncCloudCards])
}

