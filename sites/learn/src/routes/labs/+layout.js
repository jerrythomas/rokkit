import { error } from '@sveltejs/kit'
import { guide } from '$lib/stories'

/** @type {import('./$types').LayoutLoad} */
export async function load({ params }) {
	if (!['tutorial', 'labs'].includes(params.segment)) {
		error(404, {
			message: 'Page not found'
		})
	}

	const menu = await guide.menu(params.segment === 'labs')

	return { menu }
}
