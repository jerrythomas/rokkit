import { kavach } from '$lib/session'
import { sequence } from '@sveltejs/kit/hooks'

/** @type {import('@sveltejs/kit').Handle} */
export const handle = sequence(...kavach.handlers())
// // export const handle = sequence(one, two, three)

// async function one({ event, resolve }) {
// 	console.log('one - enter')
// 	if (event.url.pathname === '/auth/signin') {
// 		return resolve(event)
// 	}
// 	const result = await resolve(event)
// 	console.log('one - exit')
// 	return result
// }
// async function two({ event, resolve }) {
// 	console.log('two - enter')
// 	if (event.url.pathname === '/auth/signout') {
// 		return resolve(event)
// 	}
// 	const result = await resolve(event)
// 	console.log('two - exit')
// 	return result
// }

// async function three({ event, resolve }) {
// 	console.log('three - enter')
// 	if (event.url.pathname === '/auth/signup') {
// 		return resolve(event)
// 	}
// 	const result = await resolve(event)
// 	console.log('three - exit')
// 	return result
// }
// export async function handle({ event, resolve }) {
// 	// event.locals.user = await getUserInformation(event.cookies.get('sessionid'))
// 	// event.locals = { session: null }

// 	console.log('hooks.server.handle', event.url.pathname)

// 	const response = await resolve(event)
// 	// response.headers.set('x-custom-header', 'potato')
// 	return response

// 	// console.log('event data on server', event.locals, event.params)
// }
