import { getSections, metadataList, fetchImports } from './sections.js'
/**
 * Layout load function that provides sections data to all child routes
 * @returns {Object} Layout data including sections and field mappings
 */
export async function load() {
	const importedItems = await fetchImports(metadataList)
	const sections = getSections(importedItems)

	return {
		sections,
		fields: { text: 'title', href: 'slug' }
	}
}
