// src/routes/+layout.ts
// import type { LayoutLoad } from './$types';
// import { getSupabase } from '@supabase/auth-helpers-sveltekit'
import { kavach } from '$lib/session'

/** @type {import('./$types').LayoutLoad} */
export async function load(event) {
	// depends('app:session')
	console.log('In layout', event.data, event.params)
	//await getSupabase(event)
	return { session: await kavach.getSession(event) }
}
