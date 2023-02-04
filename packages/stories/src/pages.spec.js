import { describe, expect, it, beforeEach } from 'vitest'
import { omit } from 'ramda'
import { cleanup, render } from '@testing-library/svelte'
import path from 'path'
import {
	findStoryFiles,
	addImports,
	fromArray,
	sortByPageAndFilename
} from './pages'

describe('import guides', () => {
	const expected = [
		{
			file: process.cwd() + '/fixtures/tree/01/App.svelte',
			folder: 'tree',
			page: 1,
			fileName: 'App.svelte',
			type: 'svelte',
			code:
				'<script>\n' +
				"\timport { List } from '@rokkit/core'\n" +
				"\timport { items } from './data.js'\n" +
				'</script>\n' +
				'\n' +
				'<List {items} />\n'
		},
		{
			file: process.cwd() + '/fixtures/tree/01/data.js',
			folder: 'tree',
			page: 1,
			fileName: 'data.js',
			type: 'js',
			code: "export let items = ['alpha', 'beta', 'gamma']\n"
		},
		{
			file: process.cwd() + '/fixtures/tree/01/guide.svx',
			folder: 'tree',
			page: 1,
			fileName: 'guide.svx',
			type: 'svx',
			metadata: { title: 'Page 01' }
		},
		{
			file: process.cwd() + '/fixtures/tree/02/App.svelte',
			folder: 'tree',
			page: 2,
			fileName: 'App.svelte',
			type: 'svelte',
			code:
				'<script>\n' +
				"\timport { List } from '@rokkit/core'\n" +
				'</script>\n' +
				'\n' +
				"<List items={['charlie', 'delta']} />\n"
		},
		{
			file: process.cwd() + '/fixtures/tree/02/guide.svx',
			folder: 'tree',
			page: 2,
			fileName: 'guide.svx',
			type: 'svx',
			metadata: { title: 'Page 02' }
		},
		{
			file: process.cwd() + '/fixtures/tree/metadata.js',
			folder: 'tree',
			fileName: 'metadata.js',
			type: 'js',
			metadata: { skin: 'yellow-orange' }
		}
	]

	beforeEach(() => cleanup())

	it('Should provide the right sort order', () => {
		expect(
			sortByPageAndFilename(
				{ folder: 'list', page: 1, type: 'js', fileName: 'data.js' },
				{ folder: 'list', page: 1, type: 'svelte', fileName: 'App.svelte' }
			)
		).toEqual(1)
		expect(
			sortByPageAndFilename(
				{ folder: 'list', page: 1, type: 'svelte', fileName: 'App.svelte' },
				{ folder: 'list', page: 1, type: 'svelte', fileName: 'Person.svelte' }
			)
		).toEqual(-1)
		expect(
			sortByPageAndFilename(
				{ folder: 'list', page: 1, type: 'svelte', fileName: 'Person.svelte' },
				{ folder: 'list', page: 1, type: 'svelte', fileName: 'App.svelte' }
			)
		).toEqual(1)
		expect(
			sortByPageAndFilename(
				{ folder: 'list', page: 1, type: 'svelte', fileName: 'App.svelte' },
				{ folder: 'list', page: 1, type: 'js', fileName: 'data.js' }
			)
		).toEqual(-1)
	})
	it('should scan all folders recursively and categorize them', async () => {
		const files = findStoryFiles('./fixtures')
		expect(files).toEqual(expected.map((f) => omit(['metadata', 'code'], f)))
	})

	it('should get all guides', async () => {
		const files = findStoryFiles('./fixtures')
		const result = await addImports(files)
		expect(result.map((r) => omit(['preview', 'notes'], r))).toEqual(expected)

		result
			.filter((x) => 'preview' in x)
			.map((x) => {
				const { container } = render(x.preview)
				expect(container).toBeTruthy()
				expect(container).toMatchSnapshot(
					[x.folder, x.page, x.fileName].join('-')
				)
			})
		result
			.filter((x) => 'notes' in x)
			.map((x) => {
				const { container } = render(x.notes)
				expect(container).toBeTruthy()
				expect(container).toMatchSnapshot(
					[x.folder, x.page, x.fileName].join('-')
				)
			})
	})

	it('should convert array to component page hierarchy', () => {
		const data = [
			{
				folder: 'list',
				page: 1,
				fileName: 'data.js',
				type: 'js',
				code: 'code for list/data.js'
			},
			{
				folder: 'list',
				page: 1,
				fileName: 'App.svelte',
				type: 'svelte',
				code: 'code for list',
				preview: 'preview for list'
			},
			{
				folder: 'list',
				page: 1,
				fileName: 'guide.svx',
				type: 'svx',
				notes: 'notes for list/guide.svx',
				metadata: { title: 'page 01' }
			},
			{
				folder: 'list',
				page: 2,
				fileName: 'App.svelte',
				type: 'svelte',
				code: 'code for list/02',
				preview: 'preview for list/02'
			},
			{
				folder: 'list',
				fileName: 'metadata.js',
				type: 'js',
				metadata: { skin: 'yellow-orange' }
			},
			{
				folder: 'list',
				page: 2,
				fileName: 'guide.svx',
				type: 'svx',
				notes: 'notes for list/02/guide.svx',
				metadata: { title: 'page 02' }
			},
			{
				folder: 'nested-list',
				page: 1,
				fileName: 'App.svelte',
				type: 'svelte',
				code: 'code for nested-list',
				preview: 'preview for nested-list'
			}
		]
		const expected = {
			list: {
				name: 'List',
				metadata: {
					skin: 'yellow-orange'
				},
				pages: [
					{
						files: [
							{ file: 'App.svelte', language: 'svelte', code: 'code for list' },
							{ file: 'data.js', language: 'js', code: 'code for list/data.js' }
						],
						preview: 'preview for list',
						notes: 'notes for list/guide.svx',
						title: 'page 01'
					},
					{
						files: [
							{
								file: 'App.svelte',
								language: 'svelte',
								code: 'code for list/02'
							}
						],
						preview: 'preview for list/02',
						notes: 'notes for list/02/guide.svx',
						title: 'page 02'
					}
				]
			},
			'nested-list': {
				name: 'NestedList',
				pages: [
					{
						files: [
							{
								file: 'App.svelte',
								language: 'svelte',
								code: 'code for nested-list'
							}
						],
						preview: 'preview for nested-list',
						notes: null
					}
				]
			}
		}
		const result = fromArray(data)
		expect(result).toEqual(expected)
	})
})
