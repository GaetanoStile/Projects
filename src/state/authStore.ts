import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getAdminEmails } from '@/lib/config'
import type { Session, Subscription, SupabaseClient, User } from '@supabase/supabase-js'

export type AuthMode = 'guest' | 'cloud'

export interface AuthUser {
  id: string
  email: string
  displayName?: string
  isAdmin: boolean
}

export interface UserProfile {
  id: string
  email: string
  displayName?: string
  createdAt?: string
  planTier: string
  isAdmin: boolean
}

interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  mode: AuthMode
  isAuthenticated: boolean
  planTier: string
  loading: boolean
  isAdmin: boolean
}

interface AuthResult {
  error: string | null
}

interface AuthActions {
  setMode: (mode: AuthMode) => void
  signOut: () => Promise<AuthResult>
  initializeAuth: () => Promise<void>
  restoreSession: () => Promise<void>
  fetchProfile: (userId: string) => Promise<UserProfile | null>
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
}

const DEFAULT_PLAN_TIER = 'free'

const initialState: AuthState = {
  user: null,
  profile: null,
  mode: 'guest',
  isAuthenticated: false,
  planTier: DEFAULT_PLAN_TIER,
  loading: true,
  isAdmin: false,
}

let authSubscription: Subscription | null = null

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMode: (mode: AuthMode) => {
        set({ mode })
      },

      fetchProfile: async (userId: string): Promise<UserProfile | null> => {
        const { client } = getSupabaseClient()
        if (!client) return null

        try {
          const { data, error } = await client
            .from('users_profile')
            .select('id, email, display_name, created_at, plan_tier, is_admin')
            .eq('id', userId)
            .maybeSingle()

          if (error) {
            console.warn('Error fetching user profile:', error)
            return null
          }

          return data ? mapProfileRow(data) : null
        } catch (error) {
          console.error('Exception fetching user profile:', error)
          return null
        }
      },

      initializeAuth: async () => {
        ensureAuthSubscription(set, get)
        await get().restoreSession()
      },

      restoreSession: async () => {
        const { client, isSupabaseAvailable } = getSupabaseClient()

        if (!isSupabaseAvailable || !client) {
          clearAuthState(set)
          return
        }

        set({ loading: true })

        try {
          const {
            data: { session },
            error,
          } = await client.auth.getSession()

          if (error) {
            console.error('Error restoring auth session:', error)
            clearAuthState(set)
            return
          }

          await syncSessionState(session, client, set, get)
        } catch (error) {
          console.error('Exception restoring auth session:', error)
          clearAuthState(set)
        }
      },

      signUp: async (
        email: string,
        password: string,
        displayName?: string
      ): Promise<AuthResult> => {
        const { client, isSupabaseAvailable } = getSupabaseClient()

        if (!isSupabaseAvailable || !client) {
          return { error: 'Supabase is not configured' }
        }

        set({ loading: true })

        try {
          const { data, error } = await client.auth.signUp({
            email,
            password,
            options: displayName?.trim()
              ? {
                  data: {
                    display_name: displayName.trim(),
                  },
                }
              : undefined,
          })

          if (error) {
            set({ loading: false })
            return { error: error.message }
          }

          if (!data.session) {
            set({ loading: false })
            return {
              error:
                'Account created. Please confirm your email if required, then log in to continue.',
            }
          }

          await syncSessionState(data.session, client, set, get)
          return { error: null }
        } catch (error) {
          console.error('Exception signing up:', error)
          set({ loading: false })
          return { error: 'An unexpected error occurred' }
        }
      },

      signIn: async (email: string, password: string): Promise<AuthResult> => {
        const { client, isSupabaseAvailable } = getSupabaseClient()

        if (!isSupabaseAvailable || !client) {
          return { error: 'Supabase is not configured' }
        }

        set({ loading: true })

        try {
          const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            set({ loading: false })
            return { error: error.message }
          }

          await syncSessionState(data.session, client, set, get)
          return { error: null }
        } catch (error) {
          console.error('Exception signing in:', error)
          set({ loading: false })
          return { error: 'An unexpected error occurred' }
        }
      },

      signOut: async (): Promise<AuthResult> => {
        const { client } = getSupabaseClient()

        if (!client) {
          clearAuthState(set)
          return { error: null }
        }

        try {
          const { error } = await client.auth.signOut()

          if (error) {
            console.error('Error signing out:', error)
            return { error: error.message }
          }

          clearAuthState(set)
          return { error: null }
        } catch (error) {
          console.error('Exception signing out:', error)
          return { error: 'An unexpected error occurred' }
        }
      },
    }),
    {
      name: 'couples-game-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate auth state:', error)
          return
        }

        if (state) {
          void state.initializeAuth()
        }
      },
    }
  )
)

function clearAuthState(set: typeof useAuthStore.setState) {
  set({
    user: null,
    profile: null,
    mode: 'guest',
    isAuthenticated: false,
    planTier: DEFAULT_PLAN_TIER,
    loading: false,
    isAdmin: false,
  })
}

function ensureAuthSubscription(
  set: typeof useAuthStore.setState,
  get: typeof useAuthStore.getState
) {
  if (authSubscription) return

  const { client, isSupabaseAvailable } = getSupabaseClient()
  if (!isSupabaseAvailable || !client) {
    clearAuthState(set)
    return
  }

  const { data } = client.auth.onAuthStateChange((_event, session) => {
    void syncSessionState(session, client, set, get)
  })

  authSubscription = data.subscription
}

async function syncSessionState(
  session: Session | null,
  client: SupabaseClient,
  set: typeof useAuthStore.setState,
  get: typeof useAuthStore.getState
) {
  if (!session?.user) {
    clearAuthState(set)
    return
  }

  const shouldBeAdmin = isAdminEmail(session.user.email)
  await ensureUserProfile(client, session.user, shouldBeAdmin)

  let profile = await get().fetchProfile(session.user.id)

  if (!profile) {
    profile = {
      id: session.user.id,
      email: session.user.email || '',
      displayName: buildDisplayName(session.user),
      createdAt: undefined,
      planTier: DEFAULT_PLAN_TIER,
      isAdmin: shouldBeAdmin,
    }
  }

  const normalizedProfile: UserProfile = {
    ...profile,
    email: profile.email || session.user.email || '',
    displayName: profile.displayName || buildDisplayName(session.user, profile.displayName),
    planTier: profile.planTier || DEFAULT_PLAN_TIER,
    isAdmin: profile.isAdmin || shouldBeAdmin,
  }

  set({
    user: mapAuthUser(session.user, normalizedProfile),
    profile: normalizedProfile,
    mode: 'cloud',
    isAuthenticated: true,
    planTier: normalizedProfile.planTier,
    loading: false,
    isAdmin: normalizedProfile.isAdmin,
  })
}

function mapAuthUser(user: User, profile: UserProfile | null): AuthUser {
  return {
    id: user.id,
    email: user.email || profile?.email || '',
    displayName: profile?.displayName || buildDisplayName(user),
    isAdmin: profile?.isAdmin === true,
  }
}

function mapProfileRow(row: {
  id: string
  email: string | null
  display_name: string | null
  created_at: string | null
  plan_tier: string | null
  is_admin: boolean | null
}): UserProfile {
  return {
    id: row.id,
    email: row.email || '',
    displayName: row.display_name || undefined,
    createdAt: row.created_at || undefined,
    planTier: row.plan_tier || DEFAULT_PLAN_TIER,
    isAdmin: row.is_admin === true,
  }
}

function buildDisplayName(user: User, existingDisplayName?: string | null): string {
  return existingDisplayName || user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
}

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}

async function ensureUserProfile(
  client: SupabaseClient,
  user: User,
  shouldBeAdmin: boolean
): Promise<void> {
  try {
    const { data: existing, error: fetchError } = await client
      .from('users_profile')
      .select('id, email, display_name, plan_tier, is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (fetchError) {
      console.warn('Error reading existing user profile:', fetchError)
    }

    const payload = {
      id: user.id,
      email: existing?.email || user.email || '',
      display_name: existing?.display_name || buildDisplayName(user, existing?.display_name),
      plan_tier: existing?.plan_tier || DEFAULT_PLAN_TIER,
      is_admin: existing?.is_admin === true || shouldBeAdmin,
    }

    const { error } = await client.from('users_profile').upsert(payload, {
      onConflict: 'id',
    })

    if (error) {
      console.error('Error ensuring user profile:', error)
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error)
  }
}

