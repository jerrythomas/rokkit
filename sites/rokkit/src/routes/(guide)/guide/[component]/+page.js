import { extractStories } from '@rokkit/utils'
import { storyFiles } from '$lib'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ params, url }) {
	const stories = await extractStories(storyFiles.modules, storyFiles.samples)

	if (Object.keys(stories).includes(params.component)) {
		const story = stories[params.component]
		return {
			story
		}
	}
	throw error(404, 'Not found')
}
