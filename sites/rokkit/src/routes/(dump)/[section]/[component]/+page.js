import { guide } from '$lib'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	if (!guide.ready()) await guide.fetch()
	console.log(JSON.stringify(guide.stories()['overview']), null, 2)
	const story = guide.story(params.component)

	if (story) return { story }
	else throw error(404, 'Not found')
}
