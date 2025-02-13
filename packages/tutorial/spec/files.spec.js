import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getFiles } from '../src/files'
import files from '../fixtures/files.json'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
describe('getFiles', () => {
	const folderPath = path.join(__dirname, '../fixtures/tutorials')

	it('should return an array of meta.json and README.md files with relative path, filename, and extension', async () => {
		const pattern = /(meta\.js|meta\.json|README\.md)$/
		const result = await getFiles(folderPath, pattern)

		expect(result).toEqual(files)
	})

	it('should return all files if pattern is not specified', async () => {
		const result = await getFiles(folderPath)

		expect(result).toEqual([
			...files.slice(0, 3),
			{
				name: 'x.yml',
				path: '',
				type: 'yml'
			},
			...files.slice(3)
		])
	})
	it('should return an empty array if no files are found', async () => {
		const pattern = /foo\.js$/
		const result = await getFiles(folderPath, pattern)

		expect(result).toEqual([])
	})

	it('should throw an exception if the folder does not exist', async () => {
		const folderPath = path.join(__dirname, '../fixtures/foo')
		const pattern = /(meta\.js|README\.md)$/

		await expect(getFiles(folderPath, pattern)).rejects.toThrow(
			`ENOENT: no such file or directory, scandir '${folderPath}'`
		)
	})
})
