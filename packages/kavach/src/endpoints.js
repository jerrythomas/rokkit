import { serialize } from './cookie'
import { getRequestData } from './request'
import { pick } from 'ramda'

export async function splitAuthData(event) {
	const data = await getRequestData(event)
	const { mode } = data
	const credentials = pick(['email', 'password', 'token', 'provider'], data)
	const options = {
		...pick(['scopes', 'params', 'redirect'], data),
		redirect: event.url.origin
	}
	// console.log(data, mode, credentials, options)

	return { mode, credentials, options }
}

export async function sessionEndpoint(event, adapter) {
	const data = await getRequestData(event)
	event.locals.session = await adapter.setSession(data.session)
	console.log('Client side session', data.session)
	console.log('Server side session', event.locals.session)
	return Response(200)
}

export async function signInEndpoint(event, adapter, deflector) {
	// let status = 'S001'
	// const credentials = await getRequestData(event)
	const { mode, credentials, options } = await splitAuthData(event)
	const result = await adapter.signIn(mode, credentials, {
		...options,
		redirect: event.url.origin + deflector.page.login
	})

	// if (result.error) {
	// 	status = 'E001'
	// }
	// console.log(
	// 	'Redirect after login',
	// 	result,
	// 	event.request.method,
	// 	event.request.headers
	// )

	if (
		mode === 'otp' &&
		event.request.method !== 'GET' &&
		event.request.headers.get('accept') !== 'application/json'
	) {
		// console.log(Response)
		// Response.Cookies.Add(serialize('error', result.error))
		// Response.Cookies.Add(serialize('data', result.data))
		// Response.Cookies.Add(serialize('email', credentials.email))
		// Response.Cookies.Add(serialize('mode', mode))
		const url =
			event.url.origin +
			deflector.page.login +
			`?email=${credentials.email}&mode=${mode}&error=${result.error}`
		return Response.redirect(url, 303)
		// } else if (event.request.method !== 'GET') {
		// 	return Response({
		// 		status,
		// 		result,
		// 		...pick(['email', 'provider'], credentials)
		// 	})
	}
	return Response.redirect(deflector.homeUrl, 301)
}
