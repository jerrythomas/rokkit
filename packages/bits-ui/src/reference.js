/**
 * @rokkit/bits-ui
 * Reference file for documentation paths
 *
 * This file provides paths to the llms.txt documentation files used
 * by AI assistants to provide better help with this library.
 */

export const DOCS = {
	// Main documentation entry point
	main: '/docs/llms.txt',

	// Components
	list: '/docs/list/llms.txt',

	// URLs for remote access (replace with actual URLs when deployed)
	urls: {
		main: 'https://rokkit.bits-ui.com/docs/llms.txt',
		list: 'https://rokkit.bits-ui.com/docs/list/llms.txt'
	}
}

/**
 * Gets the documentation path for a specific component
 * @param {string} component - The component name
 * @returns {string} The path to the documentation
 */
export function getDocPath(component) {
	return DOCS[component] || DOCS.main
}

/**
 * Gets the documentation URL for a specific component
 * @param {string} component - The component name
 * @returns {string} The URL to the documentation
 */
export function getDocUrl(component) {
	return DOCS.urls[component] || DOCS.urls.main
}
