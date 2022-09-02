export { default as Auth } from './Auth.svelte'
export { supabase, actions } from './auth'
// import { createWriteStream } from 'pino-http-send'
export function authorizedUser() {
	return {
		user: { name: 'Jerry Thomas', role: 'admin' }
	}
}

import pino from 'pino'

// const stream = createWriteStream({
// 	url: 'http://localhost:5173/api/logger'
// })
export const logger = {
	web: pino({ level: 'info' }),
	server: pino({ level: 'info' })
}
