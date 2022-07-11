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
