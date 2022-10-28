// import '$lib/db'
const johnDoe = {
	name: 'John Doe',
	id: 112244233434343,
	email: 'john.doe@gmail.com',
	role: 'authenticated'
}
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// event.locals.user = await getUserInformation(event.cookies.get('sessionid'))
	// event.locals = { session: null }

	console.log('hooks.server.handle', event.url.pathname)
	if (event.url.pathname.startsWith('/api/login')) {
		event.locals.user = johnDoe
		console.log('Redirect after login')
		return Response.redirect(`${event.url.origin}/`, 301)
	}

	if (event.url.pathname.startsWith('/api/logout')) {
		event.locals.user = null
		console.log('Redirect after logout')
		return Response.redirect(`${event.url.origin}/auth`, 301)
	}
	const response = await resolve(event)
	// response.headers.set('x-custom-header', 'potato')
	return response

	// console.log('event data on server', event.locals, event.params)
}
