import { getRequestData } from '$lib/auth'
import { kavach } from '$lib/session'

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url }) {
	let status = 'S001'
	// const { loginUrl } = sentry.routes()
	const credentials = await getRequestData({ request, url })
	const result = await kavach.signIn(credentials, { redirectTo: url.origin })

	if (result.error) {
		status = 'E001'
		console.error(dacredentialsta, result.error)
	}

	if (
		request.method !== 'GET' &&
		request.headers.get('accept') !== 'application/json'
	) {
		throw redirect(
			`${loginUrl}?email=${data.email}&provider=${data.provider}&status=${status}`,
			303
		)
	}
	return Response(200, {})
}
