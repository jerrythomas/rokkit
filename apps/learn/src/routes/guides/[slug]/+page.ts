import { error } from '@sveltejs/kit'
import { findGuide } from '$lib/guides'
import type { PageLoad } from './$types'

export const load: PageLoad = ({ params }) => {
	const guide = findGuide(params.slug)
	if (!guide) error(404, `Guide "${params.slug}" not found`)
	return {
		guide,
		seo: {
			title: `${guide.title} — Rokkit Guides`,
			description: guide.description,
			type: 'article' as const
		}
	}
}
