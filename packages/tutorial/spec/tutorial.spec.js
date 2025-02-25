import fs from 'fs'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getTutorials, toSortedHierarchy } from '../src/tutorial'
import { collectTutorials } from '../src/collector'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('getTutorials', () => {
	const options = {
		rootFolder: path.join(__dirname, '../fixtures/sample'),
		tutorialMetadata: path.join(__dirname, '../fixtures/tutorials-metadata.json')
	}
	beforeAll(async () => {
		// const options = {
		// 	rootFolder: path.join(__dirname, '../fixtures/sample'),
		// 	tutorialMetadata: path.join(__dirname, '../fixtures/tutorials-metadata.json')
		// }
		await collectTutorials(options)
	})
	afterAll(async () => {
		await fs.promises.unlink(options.tutorialMetadata)
	})
	it('should return the correct folder object', async () => {
		const tutorials = JSON.parse(fs.readFileSync(options.tutorialMetadata))

		const content = getTutorials(options)
		expect(content.tutorials()).toBeNull()
		expect(content.hierarchy()).toBeNull()

		await content.load()
		expect(content.tutorials()).toEqual(tutorials)
		expect(content.hierarchy()).toEqual(toSortedHierarchy(tutorials))

		let tutorial = await content.get('xyz')
		expect(tutorial).toBeNull()

		tutorial = await content.get('intro/overview')
		expect(tutorial).toEqual({
			name: 'README.md',
			key: 'overview',
			path: '01-intro/01-overview',
			route: 'intro/overview',
			sequence: 1,
			title: 'Overview',
			// readme: 'fixtures/sample/01-intro/01-overview/README.md',
			before: null,
			crumbs: ['Introduction', 'Overview'],
			after: {
				preview: `${options.rootFolder}/01-intro/01-overview/src/App.svelte`,
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
			}
		})
	})

	it('should load tutorials on demand', async () => {
		const content = getTutorials(options)
		expect(content.tutorials()).toBeNull()
		expect(content.hierarchy()).toBeNull()

		const tutorial = await content.get('missing')
		expect(tutorial).toEqual({
			name: 'README.md',
			key: 'missing',
			path: '02-missing',
			route: 'missing',
			sequence: 2,
			crumbs: ['README.md'],
			after: null,
			before: null
		})
	})
})
