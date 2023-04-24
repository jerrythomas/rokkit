import { describe, it, expect, beforeEach } from 'vitest'
import {
	getFiles,
	getSequenceAndKey,
	convertData,
	readAndAddMetadata,
	assimilateTutorials,
	toSortedHierarchy
} from '../../tutorial/src/tutorial'
import fs from 'fs'

describe('getFiles', () => {
	const metadataFile = 'src/fixtures/stories.json'
	const folderPath = './src/fixtures/stories'
	let files

	beforeEach(() => {
		files = [
			{
				path: '01-intro',
				file: 'meta.js',
				type: 'js'
			},
			{
				path: '02-bar/03-baz',
				file: 'README.md',
				type: 'md'
			},
			{
				path: '02-bar',
				file: 'meta.json',
				type: 'json'
			},
			{
				file: 'meta.js',
				path: 'xyz',
				type: 'js'
			}
		]
	})
	const nestedData = {
		intro: {
			sequence: 1,
			key: 'intro',
			path: '01-intro',
			title: 'Introduction'
		},
		bar: {
			sequence: 2,
			key: 'bar',
			path: '02-bar',
			title: 'Bar',
			children: {
				baz: {
					sequence: 3,
					key: 'baz',
					path: '02-bar/03-baz',
					file: 'README.md',
					title: 'Baz'
				}
			}
		}
	}

	it('should return an array of meta.json and README.md files with relative path, filename, and extension', async () => {
		// You should replace this path with a folder containing test files
		// const folderPath = './src/fixtures/stories'
		const pattern = /(meta\.js|meta\.json|README\.md)$/
		const result = await getFiles(folderPath, pattern)

		expect(result).toEqual(files)
	})

	it('should return an empty array if no files are found', async () => {
		// const folderPath = './src/fixtures/stories'
		const pattern = /foo\.js$/
		const result = await getFiles(folderPath, pattern)

		expect(result).toEqual([])
	})

	it('should throw an exception if the folder does not exist', async () => {
		const folderPath = './src/fixtures/foo'
		const pattern = /(meta\.js|README\.md)$/

		await expect(getFiles(folderPath, pattern)).rejects.toThrow(
			"ENOENT: no such file or directory, scandir 'src/fixtures/foo'"
		)
	})

	describe('getSequenceAndKey', () => {
		const folderNames = [
			['01-foo', { sequence: 1, key: 'foo' }],
			['2 - bar', { sequence: 2, key: 'bar' }],
			['2', null],
			['foo', null]
		]

		it.each(folderNames)(
			'should split a folder name into number and name',
			(input, expected) => {
				let result = getSequenceAndKey(input)
				expect(result).toEqual(expected)
			}
		)
	})

	it('should add metadata to the files', async () => {
		const folderPath = './src/fixtures/stories'
		const result = await readAndAddMetadata(folderPath, files)

		expect(result).toEqual([
			{
				path: '01-intro',
				title: 'Introduction'
			},
			{
				path: '02-bar/03-baz',
				file: 'README.md',
				title: 'Baz'
			},
			{
				path: '02-bar',
				title: 'Bar'
			},
			{
				path: 'xyz'
			}
		])
		// console.log(JSON.stringify(result, null, 2))
	})

	it('should converted the array of files into a nested structure', async () => {
		const result = convertData([
			{
				path: '01-intro',
				title: 'Introduction'
			},
			{
				path: '02-bar/03-baz',
				file: 'README.md',
				title: 'Baz'
			},
			{
				path: '02-bar',
				title: 'Bar'
			}
		])
		// console.log(JSON.stringify(result, null, 2))
		expect(result).toEqual(nestedData)
	})
	it('should generate the correct JSON file', async () => {
		fs.rmSync(metadataFile, { force: true })
		await assimilateTutorials(folderPath, metadataFile).generate()
		expect(fs.existsSync(metadataFile)).toBeTruthy()
	})

	it('should convert to a nested structure', () => {
		const expected = [
			{
				sequence: 1,
				key: 'intro',
				path: '01-intro',
				title: 'Introduction'
			},
			{
				sequence: 2,
				key: 'bar',
				path: '02-bar',
				title: 'Bar',
				children: [
					{
						sequence: 3,
						key: 'baz',
						path: '02-bar/03-baz',
						file: 'README.md',
						title: 'Baz'
					}
				]
			}
		]
		const result = toSortedHierarchy(nestedData)
		expect(result).toEqual(expected)
		let stories = assimilateTutorials(folderPath, metadataFile)
		stories.read()
		expect(stories.hierarchy()).toEqual(nestedData)
		expect(stories.menu()).toEqual(expected)
	})
})
