// @ts-nocheck
import { fetchImports, getSlug } from '$lib/stories.js'

const metadataList = import.meta.glob('./**/meta.json', { import: 'default' })

const GROUPS = {
	'navigation-selection': { title: 'Navigation & Selection', icon: 'i-glyph:list-check', order: 10 },
	inputs: { title: 'Inputs', icon: 'i-glyph:keyboard', order: 11 },
	display: { title: 'Display', icon: 'i-glyph:gallery-wide', order: 12 },
	layout: { title: 'Layout', icon: 'i-glyph:layers-minimalistic', order: 13 },
	charts: { title: 'Charts', icon: 'i-glyph:chart', order: 14 },
	design: { title: 'Design Resources', icon: 'i-glyph:stars', order: 15 },
	themes: { title: 'Themes', icon: 'i-glyph:palette-manager', order: 16 },
	effects: { title: 'Effects', icon: 'i-glyph:magic-stick', order: 17 }
}

function getPlaygroundSections(metadata) {
	const groups = {}

	Object.entries(GROUPS).forEach(([key, def]) => {
		groups[key] = { ...def, children: [] }
	})

	metadata.forEach(({ content, file }) => {
		const item = {
			order: 99,
			...content,
			slug: `/playground${getSlug(file)}`
		}

		const category = (item.category ?? '').toLowerCase()
		if (!category || !groups[category]) return

		groups[category].children.push(item)
		groups[category].children.sort((a, b) => a.order - b.order)
	})

	return Object.values(groups)
		.filter((g) => g.title && g.children.length > 0)
		.sort((a, b) => a.order - b.order)
}

export async function load() {
	const importedItems = await fetchImports(metadataList)
	const sections = getPlaygroundSections(importedItems)

	return {
		sections,
		fields: { label: 'title', href: 'slug', icon: 'icon', value: 'slug' }
	}
}
