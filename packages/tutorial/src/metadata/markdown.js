import { promises as fs } from 'fs'
import { BaseMetadataReader } from './base.js'
import frontmatter from 'frontmatter'

/**
 * Reads story metadata from Markdown files using frontmatter
 * @extends BaseMetadataReader
 */
export class MarkdownMetadata extends BaseMetadataReader {
	/**
	 * Reads and extracts frontmatter metadata from markdown file
	 * @returns {Promise<object>} Story metadata
	 * @throws {Error} If file cannot be read
	 */
	async read() {
		try {
			const content = await fs.readFile(this.filePath, 'utf-8')
			const { data = {} } = frontmatter(content)
			return data ?? {}
		} catch (error) {
			throw error
		}
	}
}
