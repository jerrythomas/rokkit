import { guide } from '$lib'
/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	let tutorial = await guide.find(params.slug, params.segment == 'labs')
	if (!tutorial) return { status: 404 }

	tutorial.src.files[0]._open = true
	return { tutorial }
}
