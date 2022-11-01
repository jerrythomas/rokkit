import { error } from '@sveltejs/kit'
import { browser } from '$app/environment'
/** @type {import('./$types').PageLoad} */
export function load({ url }) {
	const hash = browser ? url.hash : '?'
	return { hash }
}
