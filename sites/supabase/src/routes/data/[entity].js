import { supabase } from '$config/auth'
import { getRequestBody } from '$lib/task'

const actions = {
	get: async (entity, data) => await supabase.from(entity).select().match(data),
	put: async (entity, data) => await supabase.from(entity).insert([data]),
	post: async (entity, data) => await supabase.from(entity).upsert(data),
	delete: async (entity, data) =>
		await supabase.from(entity).delete().match(data)
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ params, request, url }) {
	const { entity } = params

	const { data, error, status } = await actions.get(
		entity,
		Object.fromEntries(url.searchParams.entries())
	)

	if (error) return { status, body: error }
	// console.log('get', entity, data)
	return {
		status: 200,
		body: data
	}
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post({ params, url, request }) {
	const { entity } = params
	const method = (url.searchParams.get('method') || 'POST').toLowerCase()
	let data = await getRequestBody(request)

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
export async function put({ params, request }) {
	const { entity } = params
	const body = await getRequestBody(request)
	const { data, error, status } = await actions.put(entity, body)

	if (error) return { status, body: error }

	return {
		status: 200,
		body: data
	}
}

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function del({ params, request }) {
	const { entity } = params
	// console.log(entity, 'del', request.body)
	const body = await getRequestBody(request)
	const { data, error, status } = await actions.delete(entity, body)

	if (error) return { status, body: error }
	return {
		status: 200,
		body: data
	}
}
