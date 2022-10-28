import { createClient } from '@supabase/supabase-js'
import { pick } from 'ramda'

/** @type {import('kavach').GetAdapter}  */
export function getAdapter(config) {
	const handler = createClient(config.supabaseUrl, config.supabaseAnonKey)
	const auth = {
		otp: async (handler, credentials) =>
			await handler.auth.signInWithOtp(credentials),
		oauth: async (handler, credentials) =>
			await handler.auth.signInWithOAuth(credentials),
		password: async (handler, credentials) =>
			await handler.auth.signInWithPassword(credentials)
	}
	let _authSession = null

	function getUser() {
		return pick(['id', 'name', 'email', 'role'], _authSession.user)
	}

	async function getSession(event, refresh = false) {
		let { data, error } = await handler.auth.getSession()

		if (refresh) {
			console.info(
				'While fetching session on client',
				error,
				event.locals,
				event.data
			)
			_authSession = data.session
		} else {
			console.info(
				'While fetching session on server',
				error,
				event.locals,
				event.data
			)
			_authSession = refreshSession(handler, data.session)
		}
		return _authSession
	}

	async function signIn(credentials, options) {
		const { mode } = credentials
		const input = {
			...pick(['email', 'password', 'token', 'provider'], credentials),
			options: { ...pick(['scopes', 'params']), ...options }
		}
		console.log('data sent to sign in', credentials)
		await auth[mode](handler, input)
	}

	async function verifyOtp(credentials) {
		const { data, error } = await handler.auth.verifyOtp(credentials)
		return { data, error }
	}

	const signOut = handler.auth.signOut
	const onAuthChange = (callback) => {
		handler.auth.onAuthStateChange((event, session) => {
			_authSession = session
			callback(event, session)
		})
	}

	return { getUser, getSession, signIn, signOut, verifyOtp, onAuthChange }
}

async function refreshSession(handler, session, margin = 60) {
	if (session?.expires_at && session.expires_at + margin <= Date.now() / 1000) {
		const refreshed = await handler.auth.setSession(session)
		session = refreshed.data.session
	}
	return session
}
