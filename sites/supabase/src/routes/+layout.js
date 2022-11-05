// src/routes/+layout.ts
// import type { LayoutLoad } from './$types';
// import { getSupabase } from '@supabase/auth-helpers-sveltekit'
import { kavach, logger } from '$lib/session'

/** @type {import('./$types').LayoutLoad} */
export async function load(event) {
	const params = Object.fromEntries(event.url.searchParams.entries())

	await logger.debug({
		path: event.url.pathname,
		file: './layout.js',
		method: 'load',
		message: 'auth changed',
		data: { params }
	})
	return { session: kavach.getSession(event), params }
}
