import { authy } from '$config/auth'

const actions = {
	get: async (entity, data) => {}, //await supabase.from(entity).select().match(data),
	put: async (entity, data) => {}, //await supabase.from(entity).insert([data]),
	post: async (entity, data) => {}, //await supabase.from(entity).upsert(data),
	delete: async (entity, data) => {} //
	// 		await supabase.from(entity).delete().match(data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get(request) {
	const { entity } = request.params

	const { data, error, status } = await actions.get(
		entity,
		Object.fromEntries(request.query.entries())
	)

	if (error) return { status, body: error }
	// console.log('get', entity, data)
	return {
		status: 200,
		body: { data }
	}
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post(request) {
	const { entity } = request.params
	const method = (request.query.get('method') || 'POST').toLowerCase()
	let data

	try {
		data = Object.fromEntries(request.body.entries())
	} catch (err) {
		console.error('post', method, entity, err)
		data = request.body
	}

	const result = await actions[method](entity, data)

	if (
		!result.error &&
		request.method !== 'GET' &&
		request.headers.accept !== 'application/json'
	) {
		return {
			status: 303,
			headers: {
				location: request.headers.referer.replace(request.headers.origin, '')
			}
		}
	}

	return {
		status: result.status,
		statusText: result.statusText,
		body: result.body
	}
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function put(request) {
	const { entity } = request.params
	const { data, error, status } = await actions.put(entity, request.body)

	if (error) return { status, body: error }

	return {
		status: 200,
		body: { data }
	}
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function del(request) {
	const { entity } = request.params
	console.log(entity, 'del', request.body)
	const { data, error, status } = await actions.delete(entity, request.body)

	if (error) return { status, body: error }
	return {
		status: 200,
		body: { data }
	}
}
