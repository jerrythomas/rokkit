import fs from 'fs'
import { describe, it, expect, beforeAll } from 'vitest'
import { getTutorials, toSortedHierarchy } from '../src/tutorial'
import { collectTutorials } from '../src/collector'

describe('getTutorials', () => {
	const options = {
		rootFolder: 'fixtures/sample',
		tutorialMetadata: 'fixtures/tutorials-metadata.json'
	}
	beforeAll(async () => {
		const options = {
			rootFolder: 'fixtures/sample',
			tutorialMetadata: 'fixtures/tutorials-metadata.json'
		}
		await collectTutorials(options)
	})
	it('should return the correct folder object', async () => {
		const tutorials = JSON.parse(fs.readFileSync(options.tutorialMetadata))

		const content = getTutorials(options)
		expect(content.tutorials()).not.toBeDefined()
		expect(content.hierarchy()).not.toBeDefined()

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
				preview: 'fixtures/sample/01-intro/01-overview/src/App.svelte',
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
		expect(content.tutorials()).not.toBeDefined()
		expect(content.hierarchy()).not.toBeDefined()

		let tutorial = await content.get('missing')
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
