/**
 * Base class for reading story metadata from files
 * @abstract
 */
export class BaseMetadataReader {
	/**
	 * @param {string} filePath - Path to the file containing metadata
	 * @throws {Error} If filePath is not provided or empty
	 */
	constructor(filePath) {
		if (this.constructor === BaseMetadataReader) {
			throw new Error('Cannot instantiate abstract class')
		}

		if (!filePath || filePath.trim() === '') {
			throw new Error('filePath is required')
		}

		this.filePath = filePath
	}

	/**
	 * Reads metadata from the file
	 * @abstract
	 * @returns {Promise<object>} Story metadata
	 * @throws {Error} If not implemented by child class
	 */
	read() {
		// skipcq: JS-0105 - abstract method not implemented
		throw new Error('read() method must be implemented')
	}
}
