import { BaseMetadataReader } from './base.js'

/**
 * Registry for story metadata readers
 */
export class MetadataRegistry {
	/**
	 * @private
	 * @type {Map<string, typeof BaseMetadataReader>}
	 */
	#readers = new Map()

	/**
	 * Register a metadata reader for a file type
	 * @param {string} fileType - The file type (extension)
	 * @param {typeof BaseMetadataReader} ReaderClass - The metadata reader class
	 * @throws {Error} If reader class is invalid
	 */
	register(fileType, ReaderClass) {
		if (!ReaderClass) {
			throw new Error('Reader class is required')
		}

		if (!(ReaderClass.prototype instanceof BaseMetadataReader)) {
			throw new Error('Reader must extend BaseMetadataReader')
		}

		this.#readers.set(fileType.toLowerCase(), ReaderClass)
	}

	/**
	 * Get a metadata reader for a file type
	 * @param {string} fileType - The file type (extension)
	 * @returns {typeof BaseMetadataReader|undefined} The metadata reader class or undefined if not found
	 */
	getReader(fileType) {
		return this.#readers.get(fileType.toLowerCase())
	}

	/**
	 * Check if a reader exists for a file type
	 * @param {string} fileType - The file type (extension)
	 * @returns {boolean} True if a reader exists
	 */
	hasReader(fileType) {
		return this.#readers.has(fileType.toLowerCase())
	}
}
