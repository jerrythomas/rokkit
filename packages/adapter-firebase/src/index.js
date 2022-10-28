import { initializeApp, getApps, getApp } from 'firebase/app'
import { omit } from 'ramda'
import {
	signInWithPopup,
	signOut as signOutApp,
	getAuth,
	onAuthStateChanged,
	GoogleAuthProvider,
	GithubAuthProvider,
	TwitterAuthProvider,
	FacebookAuthProvider,
	OAuthProvider,
	sendSignInLinkToEmail
} from 'firebase/auth'

const authProviders = {
	apple: () => new OAuthProvider('apple.com'),
	facebook: () => new FacebookAuthProvider(),
	github: () => new GithubAuthProvider(),
	google: () => new GoogleAuthProvider(),
	twitter: () => new TwitterAuthProvider(),
	microsoft: () => new OAuthProvider('microsoft.com'),
	yahoo: () => new OAuthProvider('yahoo')
}

/**
 * Provides an adapter for performing auth actions using firebase
 *
 * @param {*} config
 * @returns @type {import('kavach').Adapter}
 */
export function adapter(config) {
	const app = getApps().length == 0 ? initializeApp(config) : getApp()
	const handler = getAuth(app)
	let _authUser = null
	let _token = null

	const getUser = () => {
		return getUserInfo(_authUser)
	}
	const getSession = () => {
		return { token: _token, user: getUser() }
	}
	const signIn = async (credentials, options) => {
		const { provider, email, mode, scopes, params } = credentials
		const { redirectTo } = options

		if (provider === 'magic' || mode === 'otp') {
			await sendSignInLinkToEmail(app, email, {
				url: redirectTo,
				handleCodeInApp: true
			})
		} else {
			const authProvider = authProviders[credentials.provider]()
			scopes.map((scope) => authProvider.addScope(scope))
			params.map((param) => authProvider.setCustomParameters(param))

			const result = await signInWithPopup(app, authProvider)
			_authUser = result.user
		}
	}
	const signOut = async () => {
		await signOutApp(handler)
	}
	const onAuthChange = (callback) => {
		onAuthStateChanged(handler, async (user) => {
			const event = user ? 'SIGNED_IN' : 'SIGNED_OUT'
			_authUser = user
			// session info from firebase?
			await callback(event, getSession())
		})
	}

	return { signIn, signOut, onAuthChange, getSession, getUser }
}

function getUserInfo(data) {
	if (!data) return data

	return {
		id: data.uid,
		role: 'authenticated',
		name: data.displayName,
		...omit(['uid', 'displayName'], data)
	}
}
