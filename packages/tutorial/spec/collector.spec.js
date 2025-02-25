/* eslint-disable no-console */
import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'fs/promises'
import { getFiles } from '../src/files'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

import {
	readFolderContent,
	getFolder,
	getMetadata,
	enrich,
	transform,
	removeInvalidEntries,
	collectTutorials
} from '../src/collector'

describe('collector', () => {
	const enriched = [
		{
			title: 'Introduction',
			path: '01-introduction',
			parts: [
				{
					sequence: 1,
					key: 'introduction'
				}
			],
			route: 'introduction'
		},
		{
			name: 'README.md',
			path: '02-bar/03-baz',
			title: 'Baz',
			parts: [
				{
					sequence: 2,
					key: 'bar'
				},
				{
					sequence: 3,
					key: 'baz'
				}
			],
			route: 'bar/baz'
		},
		{
			path: '02-bar',
			title: 'Bar',
			parts: [{ sequence: 2, key: 'bar' }],
			route: 'bar'
		},
		{
			error: 'No default export found',
			path: 'xyz',
			parts: [null],
			route: null
		}
	]

	describe('readFolderContent', () => {
		it('should return the correct file objects with content', async () => {
			const rootFolder = path.join(__dirname, '../fixtures/test-folder')
			const result = await readFolderContent(rootFolder)

			expect(result).toEqual([
				{
					path: '',
					name: 'App.svelte',
					type: 'svelte',
					content: '<h1>hello</h1>\n'
				},
				{
					path: '',
					name: 'file1.txt',
					type: 'txt',
					content: 'File 1 Content'
				},
				{
					path: '',
					name: 'file2.txt',
					type: 'txt',
					content: 'File 2 Content'
				}
			])
		})
	})
	describe('getMetadata', () => {
		console.error = vi.fn()
		const rootFolder = path.join(__dirname, '../fixtures')
		it('should return error for invalid type', async () => {
			const result = await getMetadata(rootFolder, {
				path: 'test-folder',
				name: 'meta.bson',
				type: 'bson'
			})
			expect(result).toEqual({ error: 'No metadata reader found for file type: bson' })
			expect(console.error).toHaveBeenCalledWith('No metadata reader found for file type: bson')
		})
		it('should return empty object when meta.json does not exist', async () => {
			const result = await getMetadata(rootFolder, {
				path: 'empty-folder',
				name: 'meta.json',
				type: 'json'
			})
			expect(result).toEqual({
				error: `ENOENT: no such file or directory, open '${rootFolder}/empty-folder/meta.json'`
			})
			expect(console.error).toHaveBeenCalledWith(
				`ENOENT: no such file or directory, open '${rootFolder}/empty-folder/meta.json'`
			)
		})
		it('should return error message in case of import errors', async () => {
			const result = await getMetadata(rootFolder, {
				path: 'error',
				name: 'meta.js',
				type: 'js'
			})

			expect(result.error.split('\n')[0]).toEqual("Parse failure: Expected ';', '}' or <eof>")
			expect(console.error).toHaveBeenCalledWith(
				[
					"Parse failure: Expected ';', '}' or <eof>",
					`At file: ${rootFolder}/error/meta.js:2:5`
				].join('\n')
			)
		})
	})
	describe('getFolder', () => {
		const rootFolder = path.join(__dirname, '../fixtures')
		it('should return null when folder is empty', async () => {
			const result = await getFolder(rootFolder, 'empty-folder')
			expect(result).toBeNull()
		})
		it('should provide result when App.svelte does not exist', async () => {
			const result = await getFolder(rootFolder, 'without-app')
			expect(result).toEqual({
				preview: null,
				files: [
					{
						path: '',
						name: 'file1.txt',
						type: 'txt',
						content: 'File 1 Content'
					}
				]
			})
		})
		it('should return the correct folder object', async () => {
			const result = await getFolder(rootFolder, 'test-folder')
			expect(result).toEqual({
				preview: `${rootFolder}/test-folder/App.svelte`,
				files: [
					{
						path: '',
						name: 'App.svelte',
						type: 'svelte',
						content: '<h1>hello</h1>\n'
					},
					{
						path: '',
						name: 'file1.txt',
						type: 'txt',
						content: 'File 1 Content'
					},
					{
						path: '',
						name: 'file2.txt',
						type: 'txt',
						content: 'File 2 Content'
					}
				]
			})
		})
	})
	describe('enrich', () => {
		it('should read and add metadata for each item in the data array', async () => {
			const rootFolder = path.join(__dirname, '../fixtures/tutorials')
			const data = await getFiles(rootFolder, /(meta\.json|meta\.js|README.md)$/)
			const enrichedData = await enrich(rootFolder, data)

			expect(enrichedData).toEqual(enriched)
		})
	})

	describe('transform', () => {
		it('should convert the array of file objects into a hierarchical data structure', () => {
			const expected = {
				introduction: {
					sequence: 1,
					key: 'introduction',
					title: 'Introduction',
					path: '01-introduction'
				},
				bar: {
					children: {
						baz: {
							name: 'README.md',
							key: 'baz',
							path: '02-bar/03-baz',
							route: 'bar/baz',
							sequence: 3,
							title: 'Baz'
						}
					},
					key: 'bar',
					path: '02-bar',
					// route: 'bar',
					sequence: 2,
					title: 'Bar'
				}
			}
			expect(transform(enriched)).toEqual(expected)
		})
	})

	describe('removeLeafNodesWithoutReadme', () => {
		it('should remove leaf nodes without a README.md', () => {
			const data = {
				introduction: {
					path: '01-introduction'
				},
				bar: {
					children: {
						baz: {
							name: 'README.md',
							path: '02-bar/03-baz',
							title: 'Baz'
						}
					},
					path: '02-bar',
					title: 'Bar'
				}
			}
			const result = removeInvalidEntries(data, {
				readmeFilename: 'README.md'
			})
			expect(result.errors).toEqual([
				{
					key: 'introduction',
					path: '01-introduction',
					error: 'Each level should have a title or a name property.'
				},
				{
					key: 'introduction',
					path: '01-introduction',
					error: 'Innermost level should have a readme'
				}
			])
			expect(result.data).toEqual({
				bar: {
					children: {
						baz: {
							name: 'README.md',
							path: '02-bar/03-baz',
							title: 'Baz'
						}
					},
					path: '02-bar',
					title: 'Bar'
				}
			})
		})
		it('should remove nested nodes without a README at leaf nodes', () => {
			const data = {
				introduction: {
					path: '01-introduction',
					title: 'Introduction'
				},
				bar: {
					children: {
						baz: {
							path: '02-bar/03-baz',
							title: 'Baz'
						}
					},
					path: '02-bar',
					title: 'Bar'
				}
			}
			const result = removeInvalidEntries(data, {
				readmeFilename: 'README.md'
			})
			expect(result.errors).toEqual([
				{
					key: 'baz',
					path: '02-bar/03-baz',
					error: 'Innermost level should have a readme'
				},
				{
					key: 'introduction',
					path: '01-introduction',
					error: 'Innermost level should have a readme'
				},
				{
					key: 'bar',
					path: '02-bar',
					error: 'Empty folder'
				}
			])
			expect(result.data).toEqual({})
		})
	})
	describe('collectTutorials', () => {
		afterEach(() => {
			vi.resetAllMocks()
		})

		it('should collect tutorials and write them to the specified file', async () => {
			const options = {
				rootFolder: path.join(__dirname, '../fixtures/tutorials'),
				tutorialMetadata: path.join(__dirname, '../fixtures/tutorials.json')
			}

			console.info = vi.fn()
			console.table = vi.fn()

			await collectTutorials(options)
			expect(console.info).toHaveBeenCalledWith('Invalid entries found:')
			expect(console.table).toHaveBeenCalledWith([
				{
					key: 'introduction',
					path: '01-introduction',
					error: 'Innermost level should have a readme'
				}
			])

			const writtenData = await fs.readFile(options.tutorialMetadata, 'utf-8')
			const writtenTutorials = JSON.parse(writtenData)
			const expectedTutorials = {
				bar: {
					children: {
						baz: {
							name: 'README.md',
							key: 'baz',
							path: '02-bar/03-baz',
							route: 'bar/baz',
							sequence: 3,
							title: 'Baz',
							before: null,
							after: null
						}
					},
					key: 'bar',
					path: '02-bar',
					sequence: 2,
					title: 'Bar'
				}
			}

			expect(writtenTutorials).toEqual(expectedTutorials)

			// Clean up the created file after the test
			await fs.unlink(options.tutorialMetadata)
		})
	})
})
