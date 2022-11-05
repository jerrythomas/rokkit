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

export async function sessionEndpoint(event, adapter, logger) {
	const data = await getRequestData(event)
	event.locals.session = await adapter.setSession(data.session)
	await logger.debug({
		path: event.url.pathname,
		module: 'kavach/endpoints',
		method: 'sessionEndpoint',
		data: {
			client_session: data.session,
			server_session: event.locals.session
		}
	})

	return Response(200)
}

export async function signInEndpoint(event, adapter, deflector, logger) {
	const { mode, credentials, options } = await splitAuthData(event)
	await logger.debug({
		path: event.url.pathname,
		module: 'kavach/endpoints',
		method: 'signInEndpoint',
		data: {
			mode,
			credentials,
			options,
			redirect: event.url.origin + deflector.page.login
		}
	})
	const result = await adapter.signIn(mode, credentials, {
		...options,
		redirect: event.url.origin + deflector.page.login
	})

	if (
		mode === 'otp' &&
		event.request.method !== 'GET' &&
		event.request.headers.get('accept') !== 'application/json'
	) {
		const url =
			event.url.origin +
			deflector.page.login +
			`?email=${credentials.email}&mode=${mode}&error=${result.error}`
		return Response.redirect(url, 303)
	}
	return Response.redirect(deflector.homeUrl, 301)
}
