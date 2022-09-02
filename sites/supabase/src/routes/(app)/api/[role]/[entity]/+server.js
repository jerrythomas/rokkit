import { error } from '@sveltejs/kit'
import { getter, setter } from '$lib/auth.js'

const allowed = { roles: ['admin', 'user'], entities: ['todo'] }

/**
 * @param {{ role: any; entity: any; }} params
 */
function isAllowed(params) {
	return allowed.roles.includes(params.role) && allowed.entities.includes(params.entity)
}
/** @type {import('./$types').RequestHandler} */
export async function GET({ url, params }) {
	if (isAllowed(params)) {
		return getter(params.entity, url)
	}
	throw error(400)
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, params }) {
	if (isAllowed(params)) {
		return setter('POST', params.entity, request)
	}
	throw error(400)
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, params }) {
	if (isAllowed(params)) {
		return setter('PUT', params.entity, request)
	}
	throw error(400)
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ request, params }) {
	if (isAllowed(params)) {
		return setter('DELETE', params.entity, request)
	}
	throw error(400)
}
