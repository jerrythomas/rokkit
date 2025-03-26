import { describe, it, expect } from 'vitest'
import { JavaScriptMetadata } from '../../src/metadata/javascript.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('JavaScriptMetadata', () => {
	it('should import and return default export from JS file', async () => {
		const reader = new JavaScriptMetadata(path.join(__dirname, '../../fixtures/metadata/story.js'))
		const metadata = await reader.read()
		expect(metadata).toEqual({ title: 'Test Story', description: 'A test story' })
	})

	it('should throw error when JS file has no default export', async () => {
		const reader = new JavaScriptMetadata(
			path.join(__dirname, '../../fixtures/metadata/no-default.js')
		)
		await expect(reader.read()).rejects.toThrow('No default export found')
	})

	it('should throw error when import fails to parse', async () => {
		const folder = path.join(__dirname, '../../fixtures/metadata')
		fs.copyFileSync(path.join(folder, 'invalid.js.txt'), path.join(folder, 'invalid.js'))
		const reader = new JavaScriptMetadata(path.join(folder, 'invalid.js'))
		await expect(reader.read()).rejects.toThrow('Failed to parse')
		fs.unlinkSync(path.join(folder, 'invalid.js'))
	})
})
