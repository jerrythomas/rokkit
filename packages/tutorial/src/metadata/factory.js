import { MetadataRegistry } from './registry.js'
import path from 'path'

/**
 * Factory for creating story metadata readers
 */
export class MetadataFactory {
	/**
	 * @param {MetadataRegistry} registry - Registry of metadata readers
	 * @throws {Error} If registry is not provided
	 */
	constructor(registry) {
		if (!(registry instanceof MetadataRegistry)) {
			throw new Error('Registry is required')
		}
		this.registry = registry
	}

	/**
	 * Creates a metadata reader for the given file type
	 * @param {string} filePath - Path to the file
	 * @returns {import('./base.js').BaseMetadataReader} A metadata reader instance
	 * @throws {Error} If no reader found for file type or if filePath is not provided
	 */
	create(filePath) {
		if (!filePath) {
			throw new Error('File path is required')
		}
		if (!filePath.startsWith('/')) {
			throw new Error('File path must be absolute')
		}
		const fileType = path.extname(filePath).slice(1).toLowerCase()
		const ReaderClass = this.registry.getReader(fileType)

		if (!ReaderClass) {
			throw new Error(`No metadata reader found for file type: ${fileType}`)
		}

		return new ReaderClass(filePath)
	}
}
