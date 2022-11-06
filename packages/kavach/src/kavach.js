// import { invalidate } from '$app/navigation'
import { browser } from '$app/environment'
import { createDeflector, ZERO_LOGGER } from '@kavach/core'
import { signInEndpoint, sessionEndpoint } from './endpoints'
import { APP_AUTH_CONTEXT } from './constants'

export function createKavach(adapter, options = {}) {
	const deflector = createDeflector(options)
	const logger = options?.logger ?? ZERO_LOGGER

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
		await logger.debug({
			path: where,
			module: 'kavach',
			method: 'onAuthChange',
			message: 'auth changed'
		})

		if (browser) {
			const result = await fetch(endpoint.session, {
				method: 'POST',
				body: JSON.stringify({
					session: {}
				})
			})
			await logger.debug({
				path: where,
				module: 'kavach',
				method: 'onAuthChange',
				action: `post session to ${endpoint.session}`,
				result
			})
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
		await logger.debug({
			path: event.url.pathname,
			module: 'kavach',
			method: 'handleSignIn'
		})
		if (event.url.pathname.startsWith(endpoint.login)) {
			return signInEndpoint(event, adapter, deflector, logger)
		}
		return resolve(event)
	}

	async function handleSignOut({ event, resolve }) {
		await logger.debug({
			path: event.url.pathname,
			module: 'kavach',
			method: 'handleSignOut'
		})
		if (event.url.pathname.startsWith(endpoint.logout)) {
			await adapter.signOut()
			event.locals.session = null
			await logger.debug({
				path: event.url.pathname,
				module: 'kavach',
				method: 'handleSignOut',
				message: 'Redirect after logout',
				data: event.url.origin + page.login
			})

			return Response.redirect(event.url.origin + page.login, 301)
		}
		return resolve(event)
	}

	async function handleSession({ event, resolve }) {
		await logger.debug({
			path: event.url.pathname,
			module: 'kavach',
			method: 'handleSession'
		})
		if (event.url.pathname.startsWith(endpoint.session)) {
			return await sessionEndpoint(event, adapter, logger)
		}
		return resolve(event)
	}

	async function handleUnauthorizedAccess({ event, resolve }) {
		const pathname = deflector.redirect(event.url.pathname)
		await logger.debug({
			path: event.url.pathname,
			module: 'kavach',
			method: 'handleUnauthorizedAccess',
			data: { deflectedTo: pathname }
		})
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
