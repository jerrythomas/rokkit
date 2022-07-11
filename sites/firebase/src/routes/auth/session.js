import { cookiesFromSession } from '@jerrythomas/sentry'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post(request) {
	console.log('received', request.body.session)
	return cookiesFromSession(request.body.session)
}
