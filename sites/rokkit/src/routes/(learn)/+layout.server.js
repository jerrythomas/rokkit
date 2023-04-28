import tutorials from '$lib/tutorials.json'
import { toSortedHierarchy } from '@rokkit/tutorial'

function filterBySection(data, fields, section) {
	return data
		.map((item) => {
			if (!section(item)) return null

			if (item[fields.children]) {
				item[fields.children] = filterBySection(
					item[fields.children],
					fields,
					section
				)
				if (item[fields.children].length == 0) return null
			}

			return item
		})
		.filter((item) => item !== null)
}

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params }) {
	let menu = toSortedHierarchy(tutorials)

	if (params.segment !== 'labs') {
		menu = filterBySection(menu, { children: 'children' }, (x) => !x['labs'])
	}

	return {
		menu
	}
}
