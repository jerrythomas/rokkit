import { initializeApp, getApps, getApp } from 'firebase/app'
import {
	signInWithPopup,
	signOut,
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

export function adapter(config) {
	const firebaseApp = getApps().length == 0 ? initializeApp(config) : getApp()
	const firebaseAuth = getAuth(firebaseApp)

	let currentUser = {}

	const adapterFirebase = {
		auth: {
			user: () => currentUser,
			signIn: async (credentials, options) => {
				if (credentials.provider === 'magic') {
					await sendSignInLinkToEmail(firebaseAuth, credentials.email, {
						url: options.redirectTo,
						handleCodeInApp: true
					})
				} else {
					const authProvider = authProviders[credentials.provider]()
					options.scopes.split(' ').map((scope) => authProvider.addScope(scope))
					options.params.map((param) => authProvider.setCustomParameters(param))

					const result = await signInWithPopup(firebaseAuth, authProvider)
					currentUser = getUserInfo(result.user)
				}
			},
			signOut: async () => await signOut(firebaseAuth),
			onAuthStateChange: async (cb) => {
				// console.log('auth change called', cb)
				onAuthStateChanged(firebaseAuth, async (user) => {
					const event = user ? 'SIGNED_IN' : 'SIGNED_OUT'
					let userData = getUserInfo(user)
					if (currentUser !== userData) {
						// console.log('Firebase auth changed', currentUser, userData, cb)
						currentUser = userData
						await cb(event, userData ? { user: userData } : null)
					}
				})
			}
		}
	}

	return adapterFirebase
}

function getUserInfo(data) {
	if (!data) return data

	let user = {
		role: 'authenticated',
		...data,
		id: data.uid,
		name: data.displayName
	}

	delete user.displayName
	delete user.uid
	return user
}
