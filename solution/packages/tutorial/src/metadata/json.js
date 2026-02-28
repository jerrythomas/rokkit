import fs from 'fs/promises'
import { BaseMetadataReader } from './base.js'

/**
 * Reads story metadata from JSON files
 * @extends BaseMetadataReader
 */
export class JsonMetadata extends BaseMetadataReader {
	/**
	 * Reads and parses JSON file content
	 * @returns {Promise<object>} Story metadata
	 * @throws {Error} If file cannot be read or parsed
	 */
	async read() {
		try {
			const content = await fs.readFile(this.filePath, 'utf-8')
			return JSON.parse(content)
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new SyntaxError(`Invalid JSON in file: ${this.filePath}`)
			}
			throw error
		}
	}
}
