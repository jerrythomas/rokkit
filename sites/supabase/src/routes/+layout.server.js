// src/routes/+layout.server.ts
// import type { LayoutServerLoad } from './$types'
// import { getServerSession } from '@supabase/auth-helpers-sveltekit'
// import { redirect } from '@sveltejs/kit'
import { kavach } from '$lib/session'
/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	console.log('layout.server', event.locals, event.url.pathname)
	// if (url.pathname === '/' && !locals.appSession) {
	// 	console.log('redirecting on server layout')
	// 	throw redirect(307, '/auth')
	// }

	return {
		session: kavach.getSession(event)
	}
}
