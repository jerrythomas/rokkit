import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JsonMetadata } from '../../src/metadata/json.js'
import fs from 'fs/promises'

vi.mock('fs/promises')

describe('JsonMetadata', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should read and parse JSON file', async () => {
		const mockData = { title: 'Test Story', description: 'A test story' }
		fs.readFile.mockResolvedValue(JSON.stringify(mockData))

		const reader = new JsonMetadata('./test.json')
		const metadata = await reader.read()

		expect(metadata).toEqual(mockData)
		expect(fs.readFile).toHaveBeenCalledWith('./test.json', 'utf-8')
	})

	it('should throw error when JSON is invalid', async () => {
		fs.readFile.mockResolvedValue('invalid json')

		const reader = new JsonMetadata('./test.json')
		await expect(reader.read()).rejects.toThrow(SyntaxError)
	})

	it('should throw error when file read fails', async () => {
		const error = new Error('File not found')
		fs.readFile.mockRejectedValue(error)

		const reader = new JsonMetadata('./test.json')
		await expect(reader.read()).rejects.toThrow('File not found')
	})
})
