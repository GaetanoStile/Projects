import { useEffect } from 'react'
import { useAuthStore } from '@/state/authStore'
import { useGameStore } from '@/state/store'

export const useFavorites = () => {
  const { isAuthenticated, user } = useAuthStore()
  const { loadFavoritesForUser } = useGameStore()

  useEffect(() => {
    void loadFavoritesForUser()
  }, [isAuthenticated, user?.id, loadFavoritesForUser])
}
