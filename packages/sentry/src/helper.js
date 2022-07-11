import cookie from './cookie.js'

/**
 * Extracts session attributes from cookies
 *
 * @param {*} request
 * @returns
 */
export function sessionFromCookies(event) {
	let session = event.locals
	let sessionCookie = event.request.headers.get('cookie')

	if (sessionCookie) {
		const cookies = cookie.parse(sessionCookie)
		const keys = ['id', 'email', 'role']

		keys.map((key) => {
			session[key] = key in cookies ? cookies[key] : ''
		})
	}

	return session
}

/**
 * Converts session information into cookies
 *
 * @param {s} session
 * @returns
 */
export function cookiesFromSession(session) {
	const keys = ['id', 'email', 'role']
	const user = session?.user || null
	const cookies = keys.map((key) =>
		cookie.serialize(key, user ? user[key] : '', {
			path: '/',
			httpOnly: true,
			sameSite: true,
			maxAge: 3600
		})
	)

	return {
		status: 200,
		headers: {
			'content-type': 'application/json',
			'set-cookie': cookies
		}
	}
}

/**
 * Checks if the url begins with # after the page path.
 *
 * @param {String} url
 * @returns {boolean}
 */
export function hasAuthParams(url) {
	const params = url.href.slice(`${url.origin}${url.pathname}`.length)

	if (params.startsWith('#') && params.length > 1) {
		const tokens = Object.fromEntries(
			params.split('&').map((kv) => kv.replace(/^#/, '').split('='))
		)

		return 'access_token' in tokens
	}
	return false
}
