import { logger } from '$lib/session'
import { browser } from '$app/environment'
/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
	const hash = browser ? url.hash : '?'
	await logger.debug({
		file: './auth/layout.svelte',
		method: 'onMount',
		path: url.pathname,
		data: { hash }
	})

	return { hash }
}
