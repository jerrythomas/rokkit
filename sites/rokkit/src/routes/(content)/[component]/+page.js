import { error } from '@sveltejs/kit'
import { data } from './examples'

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	if (Object.keys(data).includes(params.component)) {
		return {
			examples: data[params.component]
		}
	}

	throw error(404, 'Not found')
}
