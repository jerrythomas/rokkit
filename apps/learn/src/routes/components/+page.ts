import { catalog } from '$lib/koan/catalog'

// Static, indexable component index — content counterpart to the interactive
// /app catalog (which is noindex). Prerendered to plain HTML.
export const prerender = true

export const load = () => ({
	components: catalog.map(({ id, title, description, category }) => ({
		id,
		title,
		description,
		category
	})),
	seo: {
		title: 'Components — Rokkit',
		description: `Browse all ${catalog.length} Rokkit components — data-driven Svelte 5 building blocks with field mapping, selection, validation, theming, and accessibility built in.`
	}
})
