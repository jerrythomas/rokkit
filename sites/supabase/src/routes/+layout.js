// src/routes/+layout.ts
// import type { LayoutLoad } from './$types';
// import { getSupabase } from '@supabase/auth-helpers-sveltekit'
import { kavach } from '$lib/session'

/** @type {import('./$types').LayoutLoad} */
export async function load(event) {
	console.log('layout.client', event.data, event.params)
	const params = Object.fromEntries(event.url.searchParams.entries())
	return { session: kavach.getSession(event), params }
}
