import { readFolderContent, getFolder, getTutorials } from './hierarchy'
import { describe, it, expect } from 'vitest'

describe('readFolderContent', () => {
	it('should return the correct file objects with content', async () => {
		const result = await readFolderContent('fixtures/test-folder')

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

describe('getFolder', () => {
	it('should return null when folder is empty', async () => {
		const result = await getFolder('fixtures', 'empty-folder')
		expect(result).toBeNull()
	})
	it('should provide result when App.svelte does not exist', async () => {
		const result = await getFolder('fixtures', 'without-app')
		expect(result).toEqual({
			preview: null,
			files: [
				{
					name: 'without-app',
					type: 'folder',
					children: [
						{
							path: 'without-app',
							name: 'file1.txt',
							type: 'txt',
							content: 'File 1 Content'
						}
					]
				}
			]
		})
	})
	it('should return the correct folder object', async () => {
		const result = await getFolder('fixtures', 'test-folder')
		expect(result).toEqual({
			preview: 'fixtures/test-folder/App.svelte',
			files: [
				{
					name: 'test-folder',
					type: 'folder',
					children: [
						{
							path: 'test-folder',
							name: 'App.svelte',
							type: 'svelte',
							content: '<h1>hello</h1>\n'
						},
						{
							path: 'test-folder',
							name: 'file1.txt',
							type: 'txt',
							content: 'File 1 Content'
						},
						{
							path: 'test-folder',
							name: 'file2.txt',
							type: 'txt',
							content: 'File 2 Content'
						}
					]
				}
			]
		})
	})
})

describe('getTutorials', () => {
	it('should return the correct folder object', async () => {
		const content = await getTutorials({
			rootFolder: 'fixtures/sample',
			partialFolder: 'test-folder',
			solutionFolder: 'src',
			tutorialMetadata: 'fixtures/tutorials-metadata.json'
		})

		// console.log(JSON.stringify(content.tutorials))
		// console.log(content.hierarchy)
		// let a = await content.get('xyz')
		// console.log(a)
		let b = await content.get('intro/overview')
		console.log(JSON.stringify(b, null, 2))
		// expect(content.tutorials).toEqual([
		// 	{
		// 		name: 'test-folder',
		// 		type: 'folder',
		// 		children: [
		// 			{
		// 				path: 'test-folder',
		// 				name: 'App.svelte',
		// 				type: 'svelte',
		// 				content: '<h1>hello</h1>\n'
		// 			},
		// 			{
		// 				path: 'test-folder',
		// 				name: 'file1.txt',
		// 				type: 'txt',
		// 				content: 'File 1 Content'
		// 			},
		// 			{
		// 				path: 'test-folder',
		// 				name: 'file2.txt',
		// 				type: 'txt',
		// 				content: 'File 2 Content'
		// 			}
		// 		]
		// 	}
		// ])
	})
})
