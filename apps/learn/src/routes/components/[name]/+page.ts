import { error } from '@sveltejs/kit'
import { catalog } from '$lib/koan/catalog'
import type { EntryGenerator, PageLoad } from './$types'

export const prerender = true

// Prerender a static page for every catalog component.
export const entries: EntryGenerator = () => catalog.map((c) => ({ name: c.id }))

export const load: PageLoad = ({ params }) => {
	const comp = catalog.find((c) => c.id === params.name)
	if (!comp) error(404, `Component "${params.name}" not found`)
	return {
		component: {
			id: comp.id,
			title: comp.title,
			description: comp.description,
			docs: comp.docs ?? null
		},
		seo: {
			title: `${comp.title} — Rokkit Components`,
			description: comp.description,
			type: 'article' as const
		}
	}
}
