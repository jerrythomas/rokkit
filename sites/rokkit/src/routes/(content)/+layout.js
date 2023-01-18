import { components } from '$lib'

/** @type {import('./$types').LayoutLoad} */
export function load() {
	const menu = components.map((m) => ({
		...m,
		url: '/' + m.name.toLowerCase(),
		component: 'link'
	}))
	return {
		menu
	}
}
