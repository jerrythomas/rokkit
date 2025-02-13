import { describe, it, expect } from 'vitest'
import { MarkdownMetadata } from '../../src/metadata/markdown.js'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('MarkdownMetadata', () => {
	it('should extract frontmatter metadata from markdown file', async () => {
		const filePath = path.join(__dirname, '../../fixtures/metadata/story.md')
		const reader = new MarkdownMetadata(filePath)
		const metadata = await reader.read()

		expect(metadata).toEqual({
			title: 'Test Story',
			description: 'A test story',
			tags: ['test', 'example']
		})
	})

	it('should return empty object when no frontmatter exists', async () => {
		const filePath = path.join(__dirname, '../../fixtures/metadata/invalid.md')
		const reader = new MarkdownMetadata(filePath)
		const metadata = await reader.read()

		expect(metadata).toEqual({})
	})

	it('should throw error when file cannot be read', async () => {
		const filePath = path.join(__dirname, '../../fixtures/metadata/non-existent.md')
		const reader = new MarkdownMetadata(filePath)
		await expect(reader.read()).rejects.toThrow()
	})
})
