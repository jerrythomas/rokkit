import { guide } from '$lib'

/** @type {import('./$types').LayoutLoad} */
export function load() {
	guide.assimilate()
	return {
		version: __APP_VERSION__
	}
}
