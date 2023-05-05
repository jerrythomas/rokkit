import { error } from '@sveltejs/kit'
import { guide } from '$lib'

/** @type {import('./$types').LayoutLoad} */
export async function load({ params }) {
	if (!['tutorial', 'labs'].includes(params.segment)) {
		throw error(404, {
			message: 'Page not found'
		})
	}

	return {
		menu: await guide.menu(params.segment === 'labs')
	}
}
