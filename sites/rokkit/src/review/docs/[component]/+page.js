import { error } from '@sveltejs/kit'
import { components } from '$lib'

const allowed = ['list']

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	const current = components.filter(
		({ name }) => params.component === name.toLowerCase()
	)

	if (current.length === 1 && allowed.includes(params.component)) {
		return {
			current: { ...current[0], path: current[0].name.toLowerCase() }
		}
	}

	throw error(404, 'Not found')
}
