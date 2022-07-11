import { sentry } from './config'
import { sessionFromCookies } from '@jerrythomas/sentry'

export const handle = async ({ event, resolve }) => {
	const response = await resolve(event)
	// console.log(event.request.headers.get('cookie'))
	// console.log('user from sb:token', await sentry.getUserFromCookie(event))
	event.locals = sessionFromCookies(event)
	return sentry.protectServerRoute(event, response)
}

/** @type {import('@sveltejs/kit').GetSession} */
export function getSession(event) {
	return sessionFromCookies(event)
}
