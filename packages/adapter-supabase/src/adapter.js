import { createClient } from '@supabase/supabase-js'
import { omit, pick } from 'ramda'

/** @type {import('@kavach/core').GetAdapter}  */
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

	/**
	 * This is used to set the server side auth session using the client side auth session
	 *
	 * @param {*} session the session object from client side auth
	 * @param {*} margin  minimum time limit for expiry
	 * @returns
	 */
	async function setSession(session, margin = 60) {
		if (
			session?.expires_at &&
			session.expires_at + margin <= Date.now() / 1000
		) {
			_authSession = await handler.auth.setSession(session)
		} else {
			_authSession = null
		}
		return _authSession
	}

	function getSession() {
		return _authSession
	}

	async function signIn(mode, credentials, options) {
		console.log('data sent to sign in', credentials, options)
		options = {
			...omit(['redirect'], options),
			emailRedirectTo: options.redirect
		}
		const result = await auth[mode](handler, { ...credentials, options })
		return result
	}

	async function verifyOtp(credentials) {
		const { data, error } = await handler.auth.verifyOtp(credentials)
		return { data, error }
	}

	const signOut = async () => await handler.auth.signOut()
	// const onAuthChange = (callback) => {
	// 	const {
	// 		data: { subscription }
	// 	} = handler.auth.onAuthStateChange(async (event, session) => {
	// 		console.log('auth state change', event, session)
	// 		_authSession = session
	// 		await callback(event, session)
	// 	})

	// 	return () => {
	// 		subscription.unsubscribe()
	// 	}
	// }

	return {
		getUser,
		signIn,
		signOut,
		verifyOtp,
		// onAuthChange,
		getSession,
		setSession,
		auth: handler.auth
	}
}
