import { guide } from '$lib'

/** @type {import('./$types').LayoutLoad} */
export async function load() {
	guide.assimilate()
	return {
		// eslint-disable-next-line no-undef
		version: __APP_VERSION__
	}
}
