// @ts-nocheck
import { getSections, fetchImports } from '$lib/stories.js'
const metadataList = import.meta.glob('./**/meta.json', { import: 'default' })

/**
 * Layout load function that provides sections data to all child routes
 * @returns {Object} Layout data including sections and field mappings
 */
export async function load() {
	const importedItems = await fetchImports(metadataList)
	const sections = getSections(importedItems)

	return {
		sections,
		fields: { text: 'title', href: 'slug', icon: 'icon', description: 'none' }
	}
}
