import { createClient } from '@supabase/supabase-js'

export const config = {
	supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
	supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
}

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
