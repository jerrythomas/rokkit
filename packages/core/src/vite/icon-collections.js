import { createRequire } from 'module'

const require = createRequire(import.meta.url)

/**
 * Creates icon collection loaders for UnoCSS presetIcons from a simple config.
 *
 * This function transforms a map of collection names to JSON package paths
 * into the format expected by UnoCSS's presetIcons. It uses Node's require
 * to resolve and load the JSON files synchronously at config time.
 *
 * @example
 * // uno.config.js
 * import { iconCollections } from '@rokkit/core/vite'
 *
 * export default defineConfig({
 *   presets: [
 *     presetIcons({
 *       collections: iconCollections({
 *         rokkit: '@rokkit/icons/ui.json',
 *         logo: '@rokkit/icons/auth.json',
 *         solar: '@iconify-json/solar/icons.json'
 *       })
 *     })
 *   ]
 * })
 *
 * @param {Record<string, string>} config - Map of collection alias to JSON package path
 * @returns {Record<string, () => any>} Collections object for presetIcons
 */
export function iconCollections(config) {
	if (!config || typeof config !== 'object') {
		return {}
	}

	return Object.entries(config).reduce((acc, [alias, jsonPath]) => {
		acc[alias] = () => require(jsonPath)
		return acc
	}, {})
}
