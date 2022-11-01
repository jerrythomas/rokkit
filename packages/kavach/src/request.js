export async function getRequestBody(request) {
	let body
	try {
		body = await request.formData()
		body = Object.fromEntries(body.entries())
	} catch (err) {
		body = await request.json()
	}

	return body
}

export async function getRequestData({ request, url }) {
	const body = await getRequestBody(request)
	const data = Object.assign(
		Object.fromEntries(url.searchParams.entries()),
		body
	)
	return data
}
