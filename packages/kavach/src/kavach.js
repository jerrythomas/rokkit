// import { invalidate } from '$app/navigation'
import { browser } from '$app/environment'
import { createDeflector } from './deflector'
import { signInEndpoint, sessionEndpoint } from './endpoints'

const APP_AUTH_CONTEXT = 'app:context:auth'

export function createKavach(adapter, options = {}) {
	const deflector = createDeflector(options)
	const { endpoint, page } = deflector

	const getSession = (event) => {
		if (event.depends && typeof event.depends === 'function') {
			event.depends(APP_AUTH_CONTEXT)
			// handle client protection
			// const deflected = deflector.redirect(event.url.pathname)
			// if (deflected !== event.url.pathname) throw redirect(307, deflected)
		}
		return adapter.getSession()
	}

	const onAuthChange = async (where) => {
		console.log('on auth change called', where)
		if (browser) {
			const result = await fetch(endpoint.session, {
				method: 'POST',
				body: JSON.stringify({
					session: {}
				})
			})
			console.log(result)
		}
		// adapter.auth.onAuthStateChange(async (event, session) => {
		// 	console.log(event, session)
		// 	// invalidate(APP_AUTH_CONTEXT)
		// 	deflector.setSession(session)
		// 	if (browser) {
		// 		const result = await fetch(endpoint.session, {
		// 			method: 'POST',
		// 			body: JSON.stringify({
		// 				session
		// 			})
		// 		})
		// 	}
		// 	console.log(result)
		// })
	}

	async function handleSignIn({ event, resolve }) {
		console.log('signIn', event.url.pathname, endpoint.login)
		if (event.url.pathname.startsWith(endpoint.login)) {
			return signInEndpoint(event, adapter, deflector)
		}
		return resolve(event)
	}

	async function handleSignOut({ event, resolve }) {
		console.log('signOut', event.url.pathname, endpoint.logout)
		if (event.url.pathname.startsWith(endpoint.logout)) {
			await adapter.signOut()
			event.locals.session = null
			console.log('Redirect after logout', event.url.pathname)
			return Response.redirect(event.url.origin + page.login, 301)
		}
		return resolve(event)
	}

	async function handleSession({ event, resolve }) {
		console.log('session', event.url.pathname, endpoint.session)
		if (event.url.pathname.startsWith(endpoint.session)) {
			return await sessionEndpoint(event, adapter)
		}
		return resolve(event)
	}

	async function handleUnauthorizedAccess({ event, resolve }) {
		const pathname = deflector.redirect(event.url.pathname)
		if (pathname !== event.url.pathname) {
			return Response.redirect(event.url.origin + pathname, 301)
		}
		return resolve(event)
	}

	const handlers = () => {
		return [
			handleSignIn,
			handleSignOut,
			handleSession,
			handleUnauthorizedAccess
		]
	}

	return {
		getSession,
		onAuthChange,
		handlers,
		adapter
	}
}
