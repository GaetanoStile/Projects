import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isCloudEnabled } from '@/lib/config'
import { useAuthStore } from '@/state/authStore'

interface RequireAuthProps {
  children: ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export default function RequireAuth({
  children,
  requireAdmin = false,
  redirectTo = '/welcome',
}: RequireAuthProps) {
  const { user, mode, isAuthenticated, isAdmin, loading } = useAuthStore()

  if (loading) {
    return null
  }

  if (!isCloudEnabled()) {
    return <Navigate to="/" replace />
  }

  if (!isAuthenticated || mode !== 'cloud' || !user) {
    return <Navigate to={redirectTo} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
