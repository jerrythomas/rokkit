import { extractStories } from '@rokkit/utils'
// import { storyFiles } from '$lib'
import { guide } from '$lib'
import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	// const stories = await extractStories(storyFiles.modules, storyFiles.samples)
	console.log(guide.ready())
	if (!guide.ready()) await guide.fetch()

	// if (Object.keys(guide.stories()).includes(params.component)) {
	const story = guide.story(params.component)
	if (story)
		return {
			story
		}
	// }
	else throw error(404, 'Not found')
}
