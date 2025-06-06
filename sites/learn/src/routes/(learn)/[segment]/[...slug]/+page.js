export const prerender = 'auto'

// import { error } from '@sveltejs/kit'
import { guide } from '$lib/stories'

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const tutorial = await guide.find(params.slug, params.segment === 'labs')
	// if (!tutorial)
	// 	error(404, {
	// 		message: `No tutorial found for ${params.slug}`
	// 	})
	// tutorial.src.files[0]._open = true
	return { params, tutorial }
}
