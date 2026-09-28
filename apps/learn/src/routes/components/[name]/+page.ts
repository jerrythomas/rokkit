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
			docs: comp.docs ?? null,
			// Both are plain serialisable data (no component refs), so they survive
			// prerendering. Without them the page showed only prose — the curated examples
			// and the documented API surface, which is what a consumer actually comes for,
			// were sitting in the meta unused.
			snippets: comp.snippets ?? null,
			api: comp.api ?? null
		},
		seo: {
			title: `${comp.title} — Rokkit Components`,
			description: comp.description,
			type: 'article' as const
		}
	}
}
