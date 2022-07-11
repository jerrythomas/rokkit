import { writable } from 'svelte/store'
import { Router } from './router.js'
import cookie from './cookie.js'

export let isAuthorizing = writable(false)

function createSentry() {
	const { subscribe, set } = writable({
		user: {},
		token: null
	})

	let adapter
	let router
	let providers

	function init(config) {
		router = new Router(config.routes)
		adapter = config.adapter
		providers = config.providers.reduce(
			(obj, cur) => ({
				...obj,
				[cur.provider]: {
					scopes: cur.scopes || [],
					params: cur.params || []
				}
			}),
			{}
		)

		set({ user: adapter.auth.user(), token: null })
	}

	/**
	 * @typedef {AuthParams}
	 * @property {string} [email]
	 * @property {string} [provider]
	 */
	/**
	 *
	 * @param {AuthParams} params
	 * @param {string} baseUrl
	 * @returns
	 */
	async function handleSignIn(params, baseUrl) {
		if (!(params.provider in providers)) {
			return { error: 'Provider has not been configured.', params }
		}
		const credentials =
			params.provider === 'magic'
				? { email: params.email }
				: { provider: params.provider }

		const options = {
			redirectTo: baseUrl + router.login,
			scopes: providers[params.provider].scopes.join(' '),
			params: providers[params.provider].params
		}

		const { error } = await adapter.auth.signIn(credentials, options)
		return { error, params, options }
	}

	async function handleSignOut() {
		await adapter.auth.signOut()
		await updateSession()
		router.authRoles = ''
		window.location.pathname = router.login
	}

	function protectServerRoute(event, response) {
		if (!event.url) return response
		const { status, redirect } = redirectProtectedRoute(event.url, event.locals)

		if (!status) return response

		return new Response('', {
			status,
			headers: new Headers({ location: redirect })
		})
	}

	function redirectProtectedRoute(url, session) {
		router.authRoles = session.role
		const location = router.redirect(url.pathname)
		if (location !== url.pathname) return { status: 302, redirect: location }
		return {}
	}

	async function handleAuthChange(path = '/') {
		if (path !== router.login) {
			window.sessionStorage.setItem('path', path)
		}
		adapter.auth.onAuthStateChange(async (event, session) => {
			isAuthorizing.set(true)
			await updateSession(event, session)

			if (session) {
				set({ user: session.user })
				router.authRoles = session.user.role
			} else {
				set({ user: {} })
				router.authRoles = ''
			}
			isAuthorizing.set(false)
			const detour = router.redirect(window.sessionStorage.getItem('path'))
			if (detour !== window.location.pathname) window.location.pathname = detour
		})
	}

	async function updateSession(event, session) {
		await fetch(router.session, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ event, session })
		})
	}

	async function getUserFromCookie(event, cookieName = 'sb:token') {
		let sessionCookie = event.request.headers.get('cookie')
		if (sessionCookie) {
			const cookies = cookie.parse(sessionCookie)
			// console.log(cookies)
			const { user, error } = await adapter.auth.api.getUser(
				cookies[cookieName]
			)
			if (!error) return user
		}
		return {}
	}

	function routes() {
		return {
			authUrl: router.authUrl,
			loginUrl: router.login
		}
	}

	return {
		subscribe,
		init,
		routes,
		protectServerRoute,
		redirectProtectedRoute,
		handleAuthChange,
		handleSignIn,
		handleSignOut,
		getUserFromCookie
	}
}

export const sentry = createSentry()
