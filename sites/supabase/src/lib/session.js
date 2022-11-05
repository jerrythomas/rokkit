import { env } from '$env/dynamic/public'
import { createKavach } from 'kavach'
import { getAdapter, getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/logger'
// or use the static env
// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
export const config = {
	supabaseUrl: env.PUBLIC_SUPABASE_URL,
	supabaseAnonKey: env.PUBLIC_SUPABASE_ANON_KEY
}
const writer = getLogWriter(config, { table: 'svelte_logs' })
export const logger = getLogger(writer, { level: 'debug' })
export const kavach = createKavach(getAdapter(config), { logger })
