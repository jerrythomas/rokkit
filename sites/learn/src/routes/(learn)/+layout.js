import { error } from '@sveltejs/kit'
import { guide } from '$lib/stories'
import { FieldMapper } from '@rokkit/core'
import { Item } from '@rokkit/elements'

/** @type {import('./$types').LayoutLoad} */
export async function load({ params }) {
	if (!['tutorial', 'labs'].includes(params.segment)) {
		error(404, {
			message: 'Page not found'
		})
	}
	const mapping = new FieldMapper(
		{
			text: 'title',
			isOpen: 'isOpen',
			key: 'key'
		},
		{ default: Item }
	)
	const menu = await guide.menu(params.segment === 'labs')
	menu[0].isOpen = true
	return { menu, mapping }
}
