// src/lib/db.ts
import { createClient } from '@supabase/auth-helpers-sveltekit'
import { env } from '$env/dynamic/public'
// or use the static env
// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
export const config = {
	supabaseUrl: env.PUBLIC_SUPABASE_URL,
	supabaseAnonKey: env.PUBLIC_SUPABASE_ANON_KEY
}
export const client = createClient(
	// @ts-ignore
	config.supabaseUrl,
	config.supabaseAnonKey
)
