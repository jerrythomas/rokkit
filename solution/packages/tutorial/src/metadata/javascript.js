import { BaseMetadataReader } from './base.js'

/**
 * Reads story metadata from JavaScript files
 * @extends BaseMetadataReader
 */
export class JavaScriptMetadata extends BaseMetadataReader {
	/**
	 * Imports and returns metadata from JavaScript file
	 * @returns {Promise<object>} Story metadata
	 * @throws {Error} If file cannot be imported or has no default export
	 */
	async read() {
		const module = await import(/* @vite-ignore */ this.filePath)

		if (!('default' in module)) {
			throw new Error('No default export found')
		}

		return module.default
	}
}
