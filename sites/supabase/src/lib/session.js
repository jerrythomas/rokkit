import { env } from '$env/dynamic/public'
import { createKavach } from 'kavach'
import { getAdapter } from '@kavach/adapter-supabase'

// or use the static env
// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
export const config = {
	supabaseUrl: env.PUBLIC_SUPABASE_URL,
	supabaseAnonKey: env.PUBLIC_SUPABASE_ANON_KEY
}

export const kavach = createKavach(getAdapter(config))
