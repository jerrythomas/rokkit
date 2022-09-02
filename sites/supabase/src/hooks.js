// import { handleAuth } from '@supabase/auth-helpers-sveltekit';
// import type { GetSession, Handle } from '@sveltejs/kit';
import { initiateSignIn, initiateSignOut, setAuthCookies, supabase } from '$lib/auth'
import { sequence } from '@sveltejs/kit/hooks'

export const getSession = async (event) => {
	const { user, accessToken, error } = event.locals
	return {
		user,
		accessToken,
		error
	}
}

/** @type {import('@sveltejs/kit').Handle} */
async function handleSession({ event, resolve }) {
	console.log('start: handle session auth', event.url.pathname)

	if (event.url.pathname.startsWith('/api/auth/login')) {
		initiateSignIn(event)
		return new Response('Logging in...')
	}

	if (event.url.pathname.startsWith('/api/auth/logout')) {
		initiateSignOut(event)
		return new Response('Logging out...')
	}

	if (event.url.pathname.startsWith('/api/auth/cookie')) {
		setAuthCookies(event, session)
		return new Response('Setting session...')
	}

	const response = await resolve(event)
	console.log('finish: handle session auth', event.url.pathname)
	return response
}

/** @type {import('@sveltejs/kit').Handle} */
async function handleRouting({ event, resolve }) {
	console.log('start: handle routing based on ACL', event.url.pathname)
	const result = await resolve(event)
	console.log('finish: handle routing based on ACL', event.url.pathname)
	return result
}

export const handle = sequence(handleSession, handleRouting)
