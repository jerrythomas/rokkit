import { sentry } from '$config'
import { getRequestBody } from '$lib/task'

/**
 *
 * @param {*} request
 * @returns
 */
/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ url, request }) {
	let status = 'S001'
	const { loginUrl } = sentry.routes()
	const body = await getRequestBody(request)
	const params = Object.assign(
		Object.fromEntries(url.searchParams.entries()),
		body
	)

	const result = await sentry.handleSignIn(params, url.origin)

	if (result.error) {
		status = 'E001'
		console.error(params, result.error)
	}

	if (
		request.method !== 'GET' &&
		request.headers.accept !== 'application/json'
	) {
		return {
			status: 303,
			headers: {
				location: `${loginUrl}?email=${params.email}&provider=${params.provider}&status=${status}`
			}
		}
	}
}
