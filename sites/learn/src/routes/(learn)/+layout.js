import { sections, fields } from './sections.js'

/**
 * Layout load function that provides sections data to all child routes
 * @returns {Object} Layout data including sections and field mappings
 */
export function load() {
	return {
		sections,
		fields
	}
}
