import { invalidate } from '$app/navigation'
export const APP_AUTH_CONTEXT = 'app:context:auth'

export function createKavach(adapter) {
	const { signIn, signOut, verifyOtp, getUser } = adapter

	const getSession = (event) => {
		if (typeof event.depends === 'function') {
			event.depends(APP_AUTH_CONTEXT)
			return adapter.getSession(event)
		}
		return adapter.getSession(event, true)
	}

	const onAuthChange = () => {
		adapter.onAuthChange((event, session) => {
			invalidate(APP_AUTH_CONTEXT)
			console.log(event, session)
		})
	}

	return { signIn, signOut, verifyOtp, getUser, getSession, onAuthChange }
}
