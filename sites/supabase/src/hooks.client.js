// import '$lib/db'
import { invalidate } from '$app/navigation'
const authRoutes = ['/auth/login', '/auth/logout']

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	console.log('hooks.client.handle', event.url.pathname)
	// console.log('event data on client', event.locals, event.params, event.cookies)
	// if (event.url.pathname.startsWith('/custom')) {
	//   return new Response('custom response');
	// }
	// if (authRoutes.includes(event.url.pathname)) {
	// 	invalidate('app:session')
	// }
	// if (event.url.pathname.startsWith('/api/auth/cookie')) {
	// 	// setAuthCookies(event, session)
	// 	return new Response('Setting session...')
	// }
	const response = await resolve(event)
	return response
}
