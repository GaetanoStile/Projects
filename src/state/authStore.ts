import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getAdminEmails } from '@/lib/config'
import type { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  displayName?: string
  isAdmin: boolean
}

interface AuthState {
  user: UserProfile | null
  mode: 'guest' | 'cloud'
  isLoading: boolean
}

interface AuthActions {
  setUser: (user: UserProfile | null) => void
  setMode: (mode: 'guest' | 'cloud') => void
  signOut: () => Promise<void>
  checkAdminStatus: (userId: string, email: string) => Promise<boolean>
  initializeAuth: () => Promise<void>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
}

const initialState: AuthState = {
  user: null,
  mode: 'guest',
  isLoading: true,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user: UserProfile | null) => {
        set({ user })
      },

      setMode: (mode: 'guest' | 'cloud') => {
        set({ mode })
      },

      signOut: async () => {
        const { client } = getSupabaseClient()
        if (client) {
          try {
            await client.auth.signOut()
          } catch (error) {
            console.error('Error signing out:', error)
          }
        }
        set({ user: null, mode: 'guest' })
      },

      checkAdminStatus: async (userId: string, email: string): Promise<boolean> => {
        const { client } = getSupabaseClient()
        if (!client) return false

        // Check admin emails from env
        const adminEmails = getAdminEmails()
        if (adminEmails.includes(email.toLowerCase())) {
          return true
        }

        // Check users_profile table
        try {
          const { data, error } = await client
            .from('users_profile')
            .select('is_admin')
            .eq('id', userId)
            .single()

          if (error) {
            console.warn('Error checking admin status:', error)
            return false
          }

          return data?.is_admin === true
        } catch (error) {
          console.error('Exception checking admin status:', error)
          return false
        }
      },

      initializeAuth: async () => {
        const { client, isSupabaseAvailable } = getSupabaseClient()
        
        if (!isSupabaseAvailable) {
          set({ mode: 'guest', isLoading: false })
          return
        }

        if (!client) {
          set({ mode: 'guest', isLoading: false })
          return
        }

        try {
          const { data: { session }, error } = await client.auth.getSession()
          
          if (error) {
            console.error('Error getting session:', error)
            set({ mode: 'guest', isLoading: false })
            return
          }

          if (session?.user) {
            const isAdmin = await get().checkAdminStatus(session.user.id, session.user.email || '')
            
            // Ensure user profile exists
            await ensureUserProfile(client, session.user, isAdmin)

            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                displayName: session.user.user_metadata?.display_name,
                isAdmin,
              },
              mode: 'cloud',
              isLoading: false,
            })
          } else {
            set({ mode: 'guest', isLoading: false })
          }
        } catch (error) {
          console.error('Exception initializing auth:', error)
          set({ mode: 'guest', isLoading: false })
        }
      },

      signUp: async (email: string, password: string): Promise<{ error: string | null }> => {
        const { client, isSupabaseAvailable } = getSupabaseClient()
        
        if (!isSupabaseAvailable || !client) {
          return { error: 'Supabase is not configured' }
        }

        try {
          const { data, error } = await client.auth.signUp({
            email,
            password,
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user) {
            const isAdmin = await get().checkAdminStatus(data.user.id, email)
            await ensureUserProfile(client, data.user, isAdmin)

            set({
              user: {
                id: data.user.id,
                email: data.user.email || '',
                displayName: data.user.user_metadata?.display_name,
                isAdmin,
              },
              mode: 'cloud',
            })
          }

          return { error: null }
        } catch (error) {
          console.error('Exception signing up:', error)
          return { error: 'An unexpected error occurred' }
        }
      },

      signIn: async (email: string, password: string): Promise<{ error: string | null }> => {
        const { client, isSupabaseAvailable } = getSupabaseClient()
        
        if (!isSupabaseAvailable || !client) {
          return { error: 'Supabase is not configured' }
        }

        try {
          const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            return { error: error.message }
          }

          if (data.user) {
            const isAdmin = await get().checkAdminStatus(data.user.id, email)
            await ensureUserProfile(client, data.user, isAdmin)

            set({
              user: {
                id: data.user.id,
                email: data.user.email || '',
                displayName: data.user.user_metadata?.display_name,
                isAdmin,
              },
              mode: 'cloud',
            })
          }

          return { error: null }
        } catch (error) {
          console.error('Exception signing in:', error)
          return { error: 'An unexpected error occurred' }
        }
      },
    }),
    {
      name: 'couples-game-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        mode: state.mode,
        // Don't persist isLoading
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate auth state:', error)
          return { ...initialState, isLoading: false }
        }
        if (state) {
          // Re-initialize auth on rehydration
          state.initializeAuth()
        }
      },
    }
  )
)

/**
 * Ensure user profile exists in users_profile table
 */
async function ensureUserProfile(
  client: any,
  user: User,
  isAdmin: boolean
): Promise<void> {
  try {
    const { data: existing } = await client
      .from('users_profile')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existing) {
      // Create profile
      await client
        .from('users_profile')
        .insert({
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          is_admin: isAdmin,
        })
    } else if (isAdmin && !existing.is_admin) {
      // Update admin status if needed
      await client
        .from('users_profile')
        .update({ is_admin: true })
        .eq('id', user.id)
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error)
    // Don't throw - profile creation is not critical
  }
}

