import { sessionFromCookies } from '@jerrythomas/sentry'
import { sentry } from '$config'

export const handle = async ({ request, resolve }) => {
	const session = sessionFromCookies(request)

	// TODO https://github.com/sveltejs/kit/issues/1046
	if (request.query.has('_method')) {
		request.method = request.query.get('_method').toUpperCase()
	}

	const response = await resolve(request)
	return sentry.protect(request.path, session, response)
}

/** @type {import('@sveltejs/kit').GetSession} */
export function getSession(request) {
	return sessionFromCookies(request)
}
