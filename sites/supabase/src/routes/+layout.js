import { authorizedUser } from '$lib/index.js'

/** @type {import('./$types').LayoutLoad} */
export function load({ request, locals }) {
	return { session: locals || {} }
}
