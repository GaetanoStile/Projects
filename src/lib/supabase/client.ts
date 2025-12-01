import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { isCloudEnabled } from '../config'

let supabaseClient: SupabaseClient | null = null

/**
 * Initialize Supabase client if environment variables are available
 */
const initializeSupabase = (): { client: SupabaseClient | null; isSupabaseAvailable: boolean } => {
  if (!isCloudEnabled()) {
    return { client: null, isSupabaseAvailable: false }
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing')
    return { client: null, isSupabaseAvailable: false }
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    return { client: supabaseClient, isSupabaseAvailable: true }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return { client: null, isSupabaseAvailable: false }
  }
}

/**
 * Get Supabase client instance
 * Returns null if Supabase is not configured
 */
export const getSupabaseClient = (): { client: SupabaseClient | null; isSupabaseAvailable: boolean } => {
  if (supabaseClient) {
    return { client: supabaseClient, isSupabaseAvailable: true }
  }
  return initializeSupabase()
}

// Initialize on module load
initializeSupabase()

