import { describe, expect, it } from 'vitest'
import { get } from 'svelte/store'
import {
	getAttributes,
	fetchImports,
	extractModuleFromImports,
	extractCodeFromImports,
	transform,
	extractStories,
	fileSorter,
	extractCategories,
	createStories
} from './metamodel'

describe('metamodel', () => {
	const modules = {
		'./stories/foo/metadata.js': () =>
			Promise.resolve({
				default: { name: 'Foo', category: 'Group', description: 'Group > Foo' }
			}),
		'./stories/foo/01/App.svelte': () =>
			Promise.resolve({ default: 'The Foo Component' }),
		'./stories/foo/01/guide.svx': () =>
			Promise.resolve({
				default: 'Notes for Foo Component',
				metadata: { title: 'Page 01' }
			}),
		'./stories/foo/02/App.svelte': () =>
			Promise.resolve({ default: 'The Foo Component/02' }),
		'./stories/foo/02/guide.svx': () =>
			Promise.resolve({
				default: 'Notes for Foo Component/02',
				metadata: { title: 'Page 02' }
			}),
		'./stories/bar/metadata.js': () =>
			Promise.resolve({
				default: { name: 'Bar', category: 'Group', description: 'Group > Bar' }
			}),
		'./stories/bar/01/App.svelte': () =>
			Promise.resolve({ default: 'The Bar Component' }),
		'./stories/bar/01/guide.svx': () =>
			Promise.resolve({
				default: 'Notes for Bar Component',
				metadata: { title: 'Page 01' }
			}),
		'./stories/bar/02/App.svelte': () =>
			Promise.resolve({ default: 'The Bar Component/02' }),
		'./stories/bar/02/guide.svx': () =>
			Promise.resolve({
				default: 'Notes for Bar Component/02',
				metadata: { title: 'Page 02' }
			})
	}

	const sources = {
		'./stories/foo/01/App.svelte': () =>
			Promise.resolve('Code for Foo Component/01'),
		'./stories/foo/02/App.svelte': () =>
			Promise.resolve('Code for Foo Component/02'),
		'./stories/foo/01/data.js': () =>
			Promise.resolve('Code for Foo/data.js Page/01'),
		'./stories/bar/01/App.svelte': () =>
			Promise.resolve('Code for Bar Component/01'),
		'./stories/bar/02/App.svelte': () =>
			Promise.resolve('Code for Bar Component/02'),
		'./stories/bar/01/data.js': () =>
			Promise.resolve('Code for Bar/data.js Page/01')
	}
	const stories = {
		bar: {
			name: 'Bar',
			metadata: { name: 'Bar', category: 'Group', description: 'Group > Bar' },
			pages: [
				{
					title: 'Page 01',
					files: [
						{
							file: 'App.svelte',
							language: 'svelte',
							code: 'Code for Bar Component/01'
						},
						{
							file: 'data.js',
							language: 'js',
							code: 'Code for Bar/data.js Page/01'
						}
					],
					preview: 'The Bar Component',
					notes: 'Notes for Bar Component'
				},
				{
					title: 'Page 02',
					files: [
						{
							file: 'App.svelte',
							language: 'svelte',
							code: 'Code for Bar Component/02'
						}
					],
					preview: 'The Bar Component/02',
					notes: 'Notes for Bar Component/02'
				}
			]
		},
		foo: {
			name: 'Foo',
			metadata: { name: 'Foo', category: 'Group', description: 'Group > Foo' },
			pages: [
				{
					title: 'Page 01',
					files: [
						{
							file: 'App.svelte',
							language: 'svelte',
							code: 'Code for Foo Component/01'
						},
						{
							file: 'data.js',
							language: 'js',
							code: 'Code for Foo/data.js Page/01'
						}
					],
					preview: 'The Foo Component',
					notes: 'Notes for Foo Component'
				},
				{
					title: 'Page 02',
					files: [
						{
							file: 'App.svelte',
							language: 'svelte',
							code: 'Code for Foo Component/02'
						}
					],
					preview: 'The Foo Component/02',
					notes: 'Notes for Foo Component/02'
				}
			]
		}
	}
	const categories = [
		{ name: 'Bar', category: 'Group', description: 'Group > Bar', path: 'bar' },
		{ name: 'Foo', category: 'Group', description: 'Group > Foo', path: 'foo' }
	]
	it('should sort by folder, page, type and name', () => {
		const input = [
			{ folder: 'folder1', name: 'index.js', type: 'js', page: 1 },
			{ folder: 'folder1', name: 'App.svelte', type: 'svelte', page: 1 },
			{ folder: 'folder1', name: 'file.js', type: 'js', page: 2 },
			{ folder: 'folder2', name: 'file.svelte', type: 'svelte', page: null },
			{ folder: 'folder2', name: 'index.js', type: 'js', page: 2 },
			{ folder: 'folder2', name: 'App.svelte', type: 'svelte', page: 2 }
		]
		expect(input.sort(fileSorter)).toEqual([
			{ folder: 'folder1', name: 'App.svelte', type: 'svelte', page: 1 },
			{ folder: 'folder1', name: 'index.js', type: 'js', page: 1 },
			{ folder: 'folder1', name: 'file.js', type: 'js', page: 2 },
			{ folder: 'folder2', name: 'App.svelte', type: 'svelte', page: 2 },
			{ folder: 'folder2', name: 'index.js', type: 'js', page: 2 },
			{ folder: 'folder2', name: 'file.svelte', type: 'svelte', page: null }
		])
	})

	it('should extract file metadata', () => {
		let file = './stories/list/metadata.js'
		expect(getAttributes(file)).toEqual({
			file,
			name: 'metadata.js',
			type: 'js',
			folder: 'list',
			page: undefined
		})
		file = './stories/list/01-intro/data.js'
		expect(getAttributes(file)).toEqual({
			file,
			name: 'data.js',
			type: 'js',
			folder: 'list',
			page: 1
		})
		file = './stories/tree/02/App.svelte'
		expect(getAttributes(file)).toEqual({
			file,
			name: 'App.svelte',
			type: 'svelte',
			folder: 'tree',
			page: 2
		})
	})

	it('should resolve imports', async () => {
		let input = { 'foo.js': () => Promise.resolve({ default: 'foo' }) }
		let result = await fetchImports(input)
		expect(result).toEqual([{ file: 'foo.js', content: { default: 'foo' } }])

		input = {
			'foo.js': () => Promise.resolve({ default: 'foo', metadata: true }),
			'bar.js': () => Promise.resolve({ default: 'bar' })
		}
		result = await fetchImports(input)
		expect(result).toEqual([
			{ file: 'foo.js', content: { default: 'foo', metadata: true } },
			{ file: 'bar.js', content: { default: 'bar' } }
		])
	})

	it('should extract metadata from imports', () => {
		let result = extractModuleFromImports({
			content: {},
			page: null,
			name: 'metadata.js'
		})
		expect(result).toEqual({
			page: null,
			name: 'metadata.js',
			metadata: {}
		})
		result = extractModuleFromImports({
			content: { default: { skin: 'foo' }, metadata: { bar: 'baz' } },
			page: undefined,
			name: 'metadata.js'
		})
		expect(result).toEqual({
			page: undefined,
			name: 'metadata.js',
			metadata: { skin: 'foo' }
		})
		result = extractModuleFromImports({
			content: { default: 'foo', metadata: { bar: 'baz' } },
			page: undefined,
			name: 'meta.js'
		})
		expect(result).toEqual({
			page: undefined,
			name: 'meta.js',
			error: 'Invalid file for import as module'
		})
	})

	it('should extract preview from imports', () => {
		let result = extractModuleFromImports({
			content: { default: 'foo' },
			name: 'App.svelte'
		})
		expect(result).toEqual({
			name: 'App.svelte',
			preview: 'foo'
		})

		result = extractModuleFromImports({
			content: { default: 'foo' },
			name: 'Demo.svelte'
		})
		expect(result).toEqual({
			name: 'Demo.svelte',
			error: 'Invalid file for import as module'
		})
	})

	it('should extract notes from imports', () => {
		let result = extractModuleFromImports({
			content: { default: 'foo' },
			name: 'guide.svx'
		})
		expect(result).toEqual({
			name: 'guide.svx',
			notes: 'foo',
			metadata: {}
		})

		result = extractModuleFromImports({
			content: { default: 'foo', metadata: { title: 'foo-bar' } },
			name: 'guide.svx'
		})
		expect(result).toEqual({
			name: 'guide.svx',
			notes: 'foo',
			metadata: { title: 'foo-bar' }
		})

		result = extractModuleFromImports({
			content: { default: 'foo' },
			name: 'note.svx'
		})
		expect(result).toEqual({
			name: 'note.svx',
			error: 'Invalid file for import as module'
		})
	})

	it('should extract code from imports', () => {
		let result = extractCodeFromImports({
			content: 'code for App.svelte',
			page: 1,
			name: 'App.svelte'
		})
		expect(result).toEqual({
			page: 1,
			name: 'App.svelte',
			code: 'code for App.svelte'
		})

		result = extractCodeFromImports({
			content: 'foo',
			name: 'Demo.svelte'
		})
		expect(result).toEqual({
			name: 'Demo.svelte',
			error: 'Code examples should be within a page.'
		})
	})
	it('should convert array to component page hierarchy', () => {
		const data = [
			{
				folder: 'list',
				page: 1,
				name: 'data.js',
				type: 'js',
				code: 'code for list/data.js'
			},
			{
				folder: 'list',
				page: 1,
				name: 'App.svelte',
				type: 'svelte',
				preview: 'preview for list'
			},
			{
				folder: 'list',
				page: 1,
				name: 'App.svelte',
				type: 'svelte',
				code: 'code for list'
			},
			{
				folder: 'list',
				page: 1,
				name: 'guide.svx',
				type: 'svx',
				notes: 'notes for list/guide.svx',
				metadata: { title: 'page 01' }
			},
			{
				folder: 'list',
				page: 2,
				name: 'App.svelte',
				type: 'svelte',
				code: 'code for list/02'
			},
			{
				folder: 'list',
				page: 2,
				name: 'App.svelte',
				type: 'svelte',
				preview: 'preview for list/02'
			},
			{
				folder: 'list',
				name: 'metadata.js',
				type: 'js',
				metadata: { skin: 'yellow-orange' }
			},
			{
				folder: 'list',
				page: 2,
				name: 'guide.svx',
				type: 'svx',
				notes: 'notes for list/02/guide.svx',
				metadata: { title: 'page 02' }
			},
			{
				folder: 'nested-list',
				page: 1,
				name: 'App.svelte',
				type: 'svelte',
				preview: 'preview for nested-list'
			},
			{
				folder: 'nested-list',
				page: 1,
				name: 'App.svelte',
				type: 'svelte',
				code: 'code for nested-list'
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
		const result = transform(data)
		expect(result).toEqual(expected)
	})

	it('should generate stories object using modules and sources as input', async () => {
		const result = await extractStories(modules, sources)
		expect(result).toEqual(stories)
	})

	it('should generate a list of categorized components', async () => {
		const modules = {
			'./stories/foo/metadata.js': () =>
				Promise.resolve({
					default: {
						category: 'Group',
						description: 'Group > Foo'
					}
				}),
			'./stories/bar/metadata.js': () =>
				Promise.resolve({
					default: {
						name: 'Bar',
						category: 'Group',
						description: 'Group > Bar'
					}
				}),
			'./stories/band-jazz/metadata.js': () =>
				Promise.resolve({
					default: {
						category: 'Band',
						description: 'Band > Jazz'
					}
				}),
			'./stories/band-fizz/metadata.js': () =>
				Promise.resolve({
					default: {
						name: 'Fizz',
						category: 'Band',
						description: 'Band > Fizz'
					}
				})
		}

		const stories = await extractStories(modules, {})
		const result = extractCategories(stories)
		expect(result).toEqual([
			{
				category: 'Band',
				name: 'Fizz',
				description: 'Band > Fizz',
				path: 'band-fizz'
			},
			{
				category: 'Band',
				name: 'BandJazz',
				description: 'Band > Jazz',
				path: 'band-jazz'
			},
			{
				name: 'Bar',
				category: 'Group',
				description: 'Group > Bar',
				path: 'bar'
			},
			{
				name: 'Foo',
				category: 'Group',
				description: 'Group > Foo',
				path: 'foo'
			}
		])
	})

	it('should generate stories & categories using modules and sources as input', async () => {
		const result = createStories(modules, sources)

		expect(result.ready()).toBeFalsy()
		if (!result.ready()) {
			expect(result.stories()).toEqual({})
			expect(result.categories()).toEqual([])
			expect(result.story('foo')).toEqual(null)
		}
		await result.fetch()
		expect(result.ready()).toBeTruthy()
		expect(result.stories()).toEqual(stories)
		expect(result.categories()).toEqual(categories)
		expect(result.story('foo')).toEqual(stories.foo)
		expect(result.story('bar')).toEqual(stories.bar)
	})
})
