import { describe, it, expect, beforeEach } from 'vitest'
import {
	// getFiles,
	getSequenceAndKey,
	convertData,
	readAndAddMetadata,
	assimilateTutorials,
	toSortedHierarchy
} from './tutorial'
import fs from 'fs'

describe('tutorial', () => {
	const metadataFile = 'fixtures/stories.json'
	const folderPath = 'fixtures/stories'
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
			route: 'intro',
			title: 'Introduction'
		},
		bar: {
			sequence: 2,
			key: 'bar',
			path: '02-bar',
			title: 'Bar',
			route: 'bar',
			children: {
				baz: {
					sequence: 3,
					key: 'baz',
					route: 'bar/baz',
					path: '02-bar/03-baz',
					file: 'README.md',
					title: 'Baz'
				}
			}
		}
	}

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
		const folderPath = 'fixtures/stories'
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
				// route: 'intro',
				title: 'Introduction'
			},
			{
				sequence: 2,
				key: 'bar',
				path: '02-bar',
				title: 'Bar',
				// route: 'bar',
				children: [
					{
						sequence: 3,
						key: 'baz',
						route: 'bar/baz',
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
