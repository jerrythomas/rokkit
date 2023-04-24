import {
	getSequenceAndKey,
	enrich,
	transform,
	collectTutorials
} from '../src/collector'
import { getFiles } from '../src/files'
import fs from 'fs/promises'
import { describe, it, expect } from 'vitest'

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
			path: 'xyz',
			parts: [null],
			route: null
		}
	]
	describe('getSequenceAndKey', () => {
		it('should return the sequence and key from the given text', () => {
			const input = '01 - Introduction'
			const expected = { sequence: 1, key: 'Introduction' }
			expect(getSequenceAndKey(input)).toEqual(expected)
		})

		it('should return null if the input does not match the pattern', () => {
			const input = 'Invalid Text'
			expect(getSequenceAndKey(input)).toBeNull()
		})
	})

	describe('enrich', () => {
		it('should read and add metadata for each item in the data array', async () => {
			const rootFolder = 'fixtures/tutorials'
			const data = await getFiles(
				rootFolder,
				/(meta\.json|meta\.js|README.md)$/
			)
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

	describe('collectTutorials', () => {
		it('should collect tutorials and write them to the specified file', async () => {
			const options = {
				rootFolder: 'fixtures/tutorials',
				metadataFilename: 'meta.json',
				readmeFilename: 'README.md',
				partialFolder: 'partials',
				solutionFolder: 'solutions',
				tutorialMetadata: 'fixtures/tutorials.json'
			}

			await collectTutorials(options)

			const writtenData = await fs.readFile(options.tutorialMetadata, 'utf-8')
			const writtenTutorials = JSON.parse(writtenData)
			const expectedTutorials = {
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
