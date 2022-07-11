import { cookiesFromSession } from '@jerrythomas/sentry'

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ request }) {
	const body = await request.json()
	console.log('body: ', body)
	console.log(request.headers.get('cookie'))
	return cookiesFromSession(body.session)
}
