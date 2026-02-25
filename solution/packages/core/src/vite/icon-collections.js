import { createRequire } from 'module'
import { resolve, isAbsolute } from 'path'
import { readFileSync } from 'fs'

const require = createRequire(import.meta.url)

/**
 * Creates icon collection loaders for UnoCSS presetIcons from a simple config.
 *
 * This function transforms a map of collection names to JSON package paths
 * into the format expected by UnoCSS's presetIcons.
 *
 * Supports three types of paths:
 * - Package paths (e.g., '@rokkit/icons/ui.json') - resolved via require
 * - Absolute paths (e.g., '/path/to/icons.json') - used directly
 * - Relative paths (e.g., './static/icons.json') - resolved from process.cwd()
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
 *         solar: '@iconify-json/solar/icons.json',
 *         custom: './static/icons/custom.json'
 *       })
 *     })
 *   ]
 * })
 *
 * @param {Record<string, string>} config - Map of collection alias to JSON path
 * @returns {Record<string, () => any>} Collections object for presetIcons
 */
export function iconCollections(config) {
	if (!config || typeof config !== 'object') {
		return {}
	}

	return Object.entries(config).reduce((acc, [alias, jsonPath]) => {
		acc[alias] = () => {
			// Check if it's a relative path (starts with ./ or ../)
			if (jsonPath.startsWith('./') || jsonPath.startsWith('../')) {
				// Resolve relative to current working directory (where the config is)
				const absolutePath = resolve(process.cwd(), jsonPath)
				return JSON.parse(readFileSync(absolutePath, 'utf-8'))
			}

			// Check if it's an absolute path
			if (isAbsolute(jsonPath)) {
				return JSON.parse(readFileSync(jsonPath, 'utf-8'))
			}

			// Otherwise treat as a package path and use require
			return require(jsonPath)
		}
		return acc
	}, {})
}
