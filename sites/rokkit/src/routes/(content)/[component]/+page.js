import { error } from '@sveltejs/kit'
import { components } from '$lib'
import { pages } from './list'
const allowed = ['list', 'docs']

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const current = components.filter(
		({ name }) => params.component === name.toLowerCase()
	)

	if (current.length === 1 && allowed.includes(params.component)) {
		// const file = current[0].name.toLowerCase()
		// const pages = (await import(/* @vite-ignore */ `./${file}`)).pages
		return {
			pages
		}
	}

	throw error(404, 'Not found')
}
