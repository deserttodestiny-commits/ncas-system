import { createClient } from '@supabase/supabase-js'

// The publishable key is browser-safe; RLS enforces data access.
// Never put a service-role or secret key in a VITE_ variable.
const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && publishableKey)
export const supabase = isSupabaseConfigured
  ? createClient(url, publishableKey)
  : null
