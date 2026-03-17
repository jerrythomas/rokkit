// @ts-nocheck
import { getSlug } from '@rokkit/stories'
export {
	fetchImports,
	getSlug,
	groupFiles,
	fetchStories,
	findSection,
	findGroupForSection,
	getAllSections
} from '@rokkit/stories'

const GROUPS = {
	'navigation-selection': {
		title: 'Navigation & Selection',
		icon: 'i-glyph:list-check',
		order: 10
	},
	inputs: { title: 'Inputs', icon: 'i-glyph:keyboard', order: 11 },
	display: { title: 'Display', icon: 'i-glyph:gallery-wide', order: 12 },
	layout: { title: 'Layout', icon: 'i-glyph:layers-minimalistic', order: 13 },
	effects: { title: 'Effects', icon: 'i-glyph:magic-stick', order: 14 }
}

/**
 * Converts the input content into a group by category.
 * Guide pages (category: "guide") become flat top-level items.
 * Other categories (components, utilities) become collapsible groups.
 *
 * @param {import('@rokkit/stories').ModuleFile[]} metadata - The metadata to convert.
 * @returns {import('@rokkit/stories').Metadata[]} Array of section objects
 */
export function getSections(metadata) {
	/** @type {import('@rokkit/stories').Metadata[]} */
	const guideItems = []
	/** @type Object<string, import('@rokkit/stories').Metadata> */
	const groups = {}

	// Pre-initialise GROUPS so they exist even with no depth-1 header file
	Object.entries(GROUPS).forEach(([key, def]) => {
		groups[key] = { ...def, children: [] }
	})

	metadata.forEach(({ content, file }) => {
		const item = {
			order: 99,
			...content,
			slug: `/docs${getSlug(file)}`,
			depth: file.split('/').length - 2
		}

		const category = (item.category ?? '').toLowerCase()

		if (category === 'guide') {
			guideItems.push(item)
			return
		}

		if (!groups[category]) {
			groups[category] = { children: [] }
		}
		if (item.depth === 1) {
			groups[category] = { ...groups[category], ...item }
		} else {
			groups[category].children.push(item)
		}
		groups[category].children = groups[category].children.sort((a, b) => a.order - b.order)
	})

	const sortedGuides = guideItems.sort((a, b) => a.order - b.order)
	const sortedGroups = Object.values(groups)
		.filter((g) => g.title)
		.sort((a, b) => a.order - b.order)

	// Inject separator between flat guides and groups
	return [...sortedGuides, { type: 'separator' }, ...sortedGroups]
}
