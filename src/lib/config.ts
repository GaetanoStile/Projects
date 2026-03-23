/**
 * Configuration helpers for cloud mode detection
 */

export const isCloudEnabled = (): boolean => {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
}

export const getAdminEmails = (): string[] => {
  const emails = import.meta.env.VITE_ADMIN_EMAILS || import.meta.env.ADMIN_EMAILS
  if (!emails) return []
  return emails.split(',').map((email: string) => email.trim()).filter(Boolean)
}

