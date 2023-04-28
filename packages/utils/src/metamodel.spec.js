import { describe, expect, it } from 'vitest'

import {
	getSequenceAndTitle,
	getAttributes,
	fetchImports,
	extractModuleFromImports,
	extractCodeFromImports,
	// transform,
	extractStories,
	// fileSorter,
	toSortedHierarchy,
	extractCategories,
	createStories
	// extractNestedItems
} from './metamodel'

describe('metamodel', () => {
	describe('file metadata', () => {
		const folderNames = [
			['01-foo', { sequence: 1, title: 'foo' }],
			['2 - bar', { sequence: 2, title: 'bar' }],
			['2', null],
			['foo', null]
		]

		it.each(folderNames)(
			'should split a folder name into number and name',
			(input, expected) => {
				let result = getSequenceAndTitle(input)
				expect(result).toEqual(expected)
			}
		)

		it('should extract metadata at page level', () => {
			let result = getAttributes(
				'02-basic-components/01-list/01-intro/README.md'
			)
			expect(result).toEqual({
				file: '02-basic-components/01-list/01-intro/README.md',
				section: { sequence: 2, title: 'basic-components' },
				element: { sequence: 1, title: 'list' },
				page: { sequence: 1, title: 'intro' },
				name: 'README.md',
				type: 'md'
			})
		})

		it('should extract metadata at page level', () => {
			let result = getAttributes('02-intro/01-list/01-overview/README.md')
			expect(result).toEqual({
				file: '02-intro/01-list/01-overview/README.md',
				section: { sequence: 2, title: 'intro' },
				element: { sequence: 1, title: 'list' },
				page: { sequence: 1, title: 'overview' },
				name: 'README.md',
				type: 'md'
			})
		})

		it('should extract metadata at element level', () => {
			let result = getAttributes('01-intro/01-overview/README.md')
			expect(result).toEqual({
				file: '01-intro/01-overview/README.md',
				section: { sequence: 1, title: 'intro' },
				element: null,
				page: { sequence: 1, title: 'overview' },
				name: 'README.md',
				type: 'md'
			})
			result = getAttributes('01-intro/01-overview/meta.js')
			// expect(result).toEqual({
			// 	section: { sequence: 1, title: 'intro' },
			// 	element: {
			// 		file: '01-intro/01-overview/meta.js',
			// 		page: null,
			// 		name: 'meta.js',
			// 		type: 'js',
			// 		sequence: 1,
			// 		title: 'overview'
			// 	}
			// })
		})

		it('should extract metadata at segment level', () => {
			let result = getAttributes('01-intro/meta.js')
			// expect(result).toEqual({
			// 	file: '01-intro/meta.js',
			// 	section: { sequence: 1, title: 'intro' },
			// 	element: null,
			// 	page: null,
			// 	name: 'meta.js',
			// 	type: 'js'
			// })
			// result = getAttributes('01-intro/README.md')
			// expect(result).toEqual(null)
		})
	})

	describe('grouping and sorting', () => {
		it('should group data by section, element and pages', () => {
			const folderPaths = [
				'01-overview/meta.js',
				'01-overview/01-intro/README.md',
				'01-overview/02-getting-started/README.md',
				'02-basic-components/meta.js',
				'02-basic-components/01-list/meta.js',
				'02-basic-components/01-list/01-intro/README.md',
				'02-basic-components/01-list/02-fields/README.md',
				'02-basic-components/01-list/03-using/README.md',
				'02-basic-components/02-tree/meta.js',
				'02-basic-components/02-tree/01-intro/README.md',
				'02-basic-components/02-tree/02-fields/README.md',
				'02-basic-components/02-tree/03-using/README.md'
			]

			const result = folderPaths.map(getAttributes).filter(Boolean)
			expect(result).toEqual([
				{
					section: { sequence: 1, title: 'overview' },
					element: null,
					page: { sequence: 1, title: 'intro' },
					file: '01-overview/01-intro/README.md',
					name: 'README.md',
					type: 'md'
				},
				{
					section: { sequence: 1, title: 'overview' },
					element: null,
					page: { sequence: 2, title: 'getting-started' },
					file: '01-overview/02-getting-started/README.md',
					name: 'README.md',
					type: 'md'
				},
				{
					section: { sequence: 2, title: 'basic-components' },
					element: null,
					page: { sequence: 1, title: 'list' },
					file: '02-basic-components/01-list/meta.js',
					name: 'meta.js',
					type: 'js'
				},
				{
					section: { sequence: 2, title: 'basic-components' },
					element: { sequence: 1, title: 'list' },
					page: { sequence: 1, title: 'intro' },
					file: '02-basic-components/01-list/01-intro/README.md',
					name: 'README.md',
					type: 'md'
				},
				{
					section: { sequence: 2, title: 'basic-components' },
					element: { sequence: 1, title: 'list' },
					page: { sequence: 2, title: 'fields' },
					file: '02-basic-components/01-list/02-fields/README.md',
					name: 'README.md',
					type: 'md'
				},
				{
					section: { sequence: 2, title: 'basic-components' },
					element: { sequence: 1, title: 'list' },
					page: { sequence: 3, title: 'using' },
					file: '02-basic-components/01-list/03-using/README.md',
					name: 'README.md',
					type: 'md'
				},
				{
					section: { sequence: 2, title: 'basic-components' },
					element: null,
					page: { sequence: 2, title: 'tree' },
					file: '02-basic-components/02-tree/meta.js',
					name: 'meta.js',
					type: 'js'
				},
				{
					section: { sequence: 2, title: 'basic-components' },
					element: { sequence: 2, title: 'tree' },
					page: { sequence: 1, title: 'intro' },
					file: '02-basic-components/02-tree/01-intro/README.md',
					name: 'README.md',
					type: 'md'
				},
				{
					section: { sequence: 2, title: 'basic-components' },
					element: { sequence: 2, title: 'tree' },
					page: { sequence: 2, title: 'fields' },
					file: '02-basic-components/02-tree/02-fields/README.md',
					name: 'README.md',
					type: 'md'
				},
				{
					section: { sequence: 2, title: 'basic-components' },
					element: { sequence: 2, title: 'tree' },
					page: { sequence: 3, title: 'using' },
					file: '02-basic-components/02-tree/03-using/README.md',
					name: 'README.md',
					type: 'md'
				}
			])
			// console.log(js.stringify(convertToSections(result)))
		})
		// 	it('should sort by folder, page, type and name', () => {
		// 		const input = [
		// 			{ folder: 'folder1', name: 'index.js', type: 'js', page: 1 },
		// 			{ folder: 'folder1', name: 'App.svelte', type: 'svelte', page: 1 },
		// 			{ folder: 'folder1', name: 'file.js', type: 'js', page: 2 },
		// 			{ folder: 'folder2', name: 'file.js', type: 'js', page: 2 },
		// 			{ folder: 'folder2', name: 'file.svelte', type: 'svelte', page: 2 },
		// 			// { folder: 'folder2', name: 'index.js', type: 'js', page: 2 },
		// 			{ folder: 'folder2', name: 'App.svelte', type: 'svelte', page: 2 }
		// 		]
		// 		expect(input.sort(fileSorter)).toEqual([
		// 			{ folder: 'folder1', name: 'App.svelte', type: 'svelte', page: 1 },
		// 			{ folder: 'folder1', name: 'index.js', type: 'js', page: 1 },
		// 			{ folder: 'folder1', name: 'file.js', type: 'js', page: 2 },
		// 			{ folder: 'folder2', name: 'App.svelte', type: 'svelte', page: 2 },
		// 			// { folder: 'folder2', name: 'index.js', type: 'js', page: 2 },
		// 			{ folder: 'folder2', name: 'file.svelte', type: 'svelte', page: 2 },
		// 			{ folder: 'folder2', name: 'file.js', type: 'js', page: 2 }
		// 		])
		// 	})
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

	// it('should extract metadata from imports', () => {
	// 	let result = extractModuleFromImports({
	// 		content: { default: { title: 'foo' } },
	// 		section: {},
	// 		name: 'meta.js'
	// 	})
	// 	expect(result).toEqual({
	// 		name: 'meta.js',
	// 		section: { title: 'foo' }
	// 	})
	// 	result = extractModuleFromImports({
	// 		content: { default: { metadata: { bar: 'baz' } } },
	// 		element: {},
	// 		name: 'meta.js'
	// 	})
	// 	expect(result).toEqual({
	// 		name: 'meta.js',
	// 		element: { metadata: { bar: 'baz' } }
	// 	})
	// 	result = extractModuleFromImports({
	// 		content: { default: 'foo', metadata: { bar: 'baz' } },
	// 		name: 'other.js'
	// 	})
	// 	expect(result).toEqual({
	// 		name: 'other.js',
	// 		error: 'Invalid file for import as module'
	// 	})
	// })

	it('should extract preview from imports', () => {
		let result = extractModuleFromImports({
			content: { default: 'foo' },
			name: 'App.svelte',
			page: {}
		})
		expect(result).toEqual({
			name: 'App.svelte',
			page: { preview: 'foo' }
		})

		result = extractModuleFromImports({
			content: { default: 'foo' },
			name: 'Demo.svelte',
			element: {}
		})
		expect(result).toEqual({
			name: 'Demo.svelte',
			element: {},
			error: 'Invalid file for import as module'
		})
	})

	it('should extract notes from imports', () => {
		let result = extractModuleFromImports({
			content: { default: 'foo' },
			name: 'README.md',
			section: {}
		})
		expect(result).toEqual({
			name: 'README.md',
			section: { notes: 'foo' }
		})

		result = extractModuleFromImports({
			content: { default: 'foo', metadata: { title: 'foo-bar' } },
			name: 'README.md',
			page: {}
		})
		expect(result).toEqual({
			name: 'README.md',
			page: { notes: 'foo', title: 'foo-bar' }
		})

		result = extractModuleFromImports({
			content: { default: 'foo' },
			name: 'note.md'
		})
		expect(result).toEqual({
			name: 'note.md',
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
	// it('should convert array to component page hierarchy', () => {
	// 	const data = [
	// 		{
	// 			folder: 'list',
	// 			page: 1,
	// 			name: 'data.js',
	// 			type: 'js',
	// 			code: 'code for list/data.js'
	// 		},
	// 		{
	// 			folder: 'list',
	// 			page: 1,
	// 			name: 'App.svelte',
	// 			type: 'svelte',
	// 			preview: 'preview for list'
	// 		},
	// 		{
	// 			folder: 'list',
	// 			page: 1,
	// 			name: 'App.svelte',
	// 			type: 'svelte',
	// 			code: 'code for list'
	// 		},
	// 		{
	// 			folder: 'list',
	// 			page: 1,
	// 			name: 'README.md',
	// 			type: 'md',
	// 			notes: 'notes for list/README.md',
	// 			metadata: { title: 'page 01' }
	// 		},
	// 		{
	// 			folder: 'list',
	// 			page: 2,
	// 			name: 'App.svelte',
	// 			type: 'svelte',
	// 			code: 'code for list/02'
	// 		},
	// 		{
	// 			folder: 'list',
	// 			page: 2,
	// 			name: 'App.svelte',
	// 			type: 'svelte',
	// 			preview: 'preview for list/02'
	// 		},
	// 		{
	// 			folder: 'list',
	// 			name: 'meta.js',
	// 			type: 'js',
	// 			metadata: { skin: 'yellow-orange' }
	// 		},
	// 		{
	// 			folder: 'list',
	// 			page: 2,
	// 			name: 'README.md',
	// 			type: 'md',
	// 			notes: 'notes for list/02/README.md',
	// 			metadata: { title: 'page 02' }
	// 		},
	// 		{
	// 			folder: 'nested-list',
	// 			page: 1,
	// 			name: 'App.svelte',
	// 			type: 'svelte',
	// 			preview: 'preview for nested-list'
	// 		},
	// 		{
	// 			folder: 'nested-list',
	// 			page: 1,
	// 			name: 'App.svelte',
	// 			type: 'svelte',
	// 			code: 'code for nested-list'
	// 		}
	// 	]
	// 	const expected = {
	// 		list: {
	// 			name: 'List',
	// 			metadata: {
	// 				skin: 'yellow-orange'
	// 			},
	// 			pages: [
	// 				{
	// 					files: [
	// 						{ file: 'App.svelte', language: 'svelte', code: 'code for list' },
	// 						{ file: 'data.js', language: 'js', code: 'code for list/data.js' }
	// 					],
	// 					preview: 'preview for list',
	// 					notes: 'notes for list/README.md',
	// 					title: 'page 01'
	// 				},
	// 				{
	// 					files: [
	// 						{
	// 							file: 'App.svelte',
	// 							language: 'svelte',
	// 							code: 'code for list/02'
	// 						}
	// 					],
	// 					preview: 'preview for list/02',
	// 					notes: 'notes for list/02/README.md',
	// 					title: 'page 02'
	// 				}
	// 			]
	// 		},
	// 		'nested-list': {
	// 			name: 'NestedList',
	// 			pages: [
	// 				{
	// 					files: [
	// 						{
	// 							file: 'App.svelte',
	// 							language: 'svelte',
	// 							code: 'code for nested-list'
	// 						}
	// 					],
	// 					preview: 'preview for nested-list',
	// 					notes: null
	// 				}
	// 			]
	// 		}
	// 	}
	// 	const result = transform(data)
	// 	expect(result).toEqual(expected)
	// })

	// describe('Consolidate', () => {
	// 	const modules = {
	// 		'./stories/01-intro/meta.js': () =>
	// 			Promise.resolve({
	// 				default: { title: 'Intro', description: 'Group > Foo' }
	// 			}),
	// 		'./stories/01-intro/01-foo/README.md': () =>
	// 			Promise.resolve({
	// 				default: 'Notes for Foo Component',
	// 				metadata: { title: 'Page 01' }
	// 			})
	// 		// './stories/foo/01/App.svelte': () =>
	// 		// 	Promise.resolve({ default: 'The Foo Component' }),
	// 		// './stories/foo/01/README.md': () =>
	// 		// 	Promise.resolve({
	// 		// 		default: 'Notes for Foo Component',
	// 		// 		metadata: { title: 'Page 01' }
	// 		// 	}),
	// 		// './stories/foo/02/App.svelte': () =>
	// 		// 	Promise.resolve({ default: 'The Foo Component/02' }),
	// 		// './stories/foo/02/README.md': () =>
	// 		// 	Promise.resolve({
	// 		// 		default: 'Notes for Foo Component/02',
	// 		// 		metadata: { title: 'Page 02' }
	// 		// 	}),
	// 		// './stories/bar/meta.js': () =>
	// 		// 	Promise.resolve({
	// 		// 		default: { name: 'Bar', category: 'Group', description: 'Group > Bar' }
	// 		// 	}),
	// 		// './stories/bar/01/App.svelte': () =>
	// 		// 	Promise.resolve({ default: 'The Bar Component' }),
	// 		// './stories/bar/01/README.md': () =>
	// 		// 	Promise.resolve({
	// 		// 		default: 'Notes for Bar Component',
	// 		// 		metadata: { title: 'Page 01' }
	// 		// 	}),
	// 		// './stories/bar/02/App.svelte': () =>
	// 		// 	Promise.resolve({ default: 'The Bar Component/02' }),
	// 		// './stories/bar/02/README.md': () =>
	// 		// 	Promise.resolve({
	// 		// 		default: 'Notes for Bar Component/02',
	// 		// 		metadata: { title: 'Page 02' }
	// 		// 	})
	// 	}

	// 	const sources = {
	// 		'./stories/02-foo/01-bar/01-pg/App.svelte': () =>
	// 			Promise.resolve('Code for Foo Component/01')
	// 		// './stories/foo/02/App.svelte': () =>
	// 		// 	Promise.resolve('Code for Foo Component/02'),
	// 		// './stories/foo/01/data.js': () =>
	// 		// 	Promise.resolve('Code for Foo/data.js Page/01'),
	// 		// './stories/bar/01/App.svelte': () =>
	// 		// 	Promise.resolve('Code for Bar Component/01'),
	// 		// './stories/bar/02/App.svelte': () =>
	// 		// 	Promise.resolve('Code for Bar Component/02'),
	// 		// './stories/bar/01/data.js': () =>
	// 		// 	Promise.resolve('Code for Bar/data.js Page/01')
	// 	}
	// 	// const stories = {
	// 	// 	bar: {
	// 	// 		name: 'Bar',
	// 	// 		metadata: { name: 'Bar', category: 'Group', description: 'Group > Bar' },
	// 	// 		pages: [
	// 	// 			{
	// 	// 				title: 'Page 01',
	// 	// 				files: [
	// 	// 					{
	// 	// 						file: 'App.svelte',
	// 	// 						language: 'svelte',
	// 	// 						code: 'Code for Bar Component/01'
	// 	// 					},
	// 	// 					{
	// 	// 						file: 'data.js',
	// 	// 						language: 'js',
	// 	// 						code: 'Code for Bar/data.js Page/01'
	// 	// 					}
	// 	// 				],
	// 	// 				preview: 'The Bar Component',
	// 	// 				notes: 'Notes for Bar Component'
	// 	// 			},
	// 	// 			{
	// 	// 				title: 'Page 02',
	// 	// 				files: [
	// 	// 					{
	// 	// 						file: 'App.svelte',
	// 	// 						language: 'svelte',
	// 	// 						code: 'Code for Bar Component/02'
	// 	// 					}
	// 	// 				],
	// 	// 				preview: 'The Bar Component/02',
	// 	// 				notes: 'Notes for Bar Component/02'
	// 	// 			}
	// 	// 		]
	// 	// 	},
	// 	// 	foo: {
	// 	// 		name: 'Foo',
	// 	// 		metadata: { name: 'Foo', category: 'Group', description: 'Group > Foo' },
	// 	// 		pages: [
	// 	// 			{
	// 	// 				title: 'Page 01',
	// 	// 				files: [
	// 	// 					{
	// 	// 						file: 'App.svelte',
	// 	// 						language: 'svelte',
	// 	// 						code: 'Code for Foo Component/01'
	// 	// 					},
	// 	// 					{
	// 	// 						file: 'data.js',
	// 	// 						language: 'js',
	// 	// 						code: 'Code for Foo/data.js Page/01'
	// 	// 					}
	// 	// 				],
	// 	// 				preview: 'The Foo Component',
	// 	// 				notes: 'Notes for Foo Component'
	// 	// 			},
	// 	// 			{
	// 	// 				title: 'Page 02',
	// 	// 				files: [
	// 	// 					{
	// 	// 						file: 'App.svelte',
	// 	// 						language: 'svelte',
	// 	// 						code: 'Code for Foo Component/02'
	// 	// 					}
	// 	// 				],
	// 	// 				preview: 'The Foo Component/02',
	// 	// 				notes: 'Notes for Foo Component/02'
	// 	// 			}
	// 	// 		]
	// 	// 	}
	// 	// }
	// 	// const stories =
	// 	// 'intro':{
	// 	// 			sequence: 1,
	// 	// 			title: 'Intro',
	// 	// 			description: 'Group > Foo',
	// 	// 			slug: 'intro',
	// 	// 	 elements: {}
	// 	// 		pages: {
	// 	// 			files: [file: './stories/01-intro/meta.js',
	// 	// 			name: 'meta.js',
	// 	// 			type: 'js']
	// 	// 		}

	// 	// 	},
	// 	// 	{
	// 	// 		section: { sequence: 1, title: 'intro', slug: 'intro' },
	// 	// 		element: null,
	// 	// 		page: {
	// 	// 			sequence: 1,
	// 	// 			title: 'Page 01',
	// 	// 			slug: 'page-01',
	// 	// 			notes: 'Notes for Foo Component'
	// 	// 		},
	// 	// 		file: './stories/01-intro/01-foo/README.md',
	// 	// 		name: 'README.md',
	// 	// 		type: 'md'
	// 	// 	},
	// 	// 	{
	// 	// 		section: { sequence: 2, title: 'foo', slug: 'foo' },
	// 	// 		element: { sequence: 1, title: 'bar', slug: 'bar' },
	// 	// 		page: { sequence: 1, title: 'pg', slug: 'pg' },
	// 	// 		file: './stories/02-foo/01-bar/01-pg/App.svelte',
	// 	// 		name: 'App.svelte',
	// 	// 		type: 'svelte',
	// 	// 		code: 'Code for Foo Component/01'
	// 	// 	}
	// 	// ]
	// 	const stories = {
	// 		intro: {
	// 			sequence: 1,
	// 			title: 'Intro',
	// 			slug: 'intro',
	// 			description: 'Group > Foo',
	// 			elements: {},
	// 			pages: {
	// 				'page-01': {
	// 					sequence: 1,
	// 					title: 'Page 01',
	// 					slug: 'page-01',
	// 					notes: 'Notes for Foo Component',
	// 					files: [
	// 						{
	// 							file: './stories/01-intro/01-foo/README.md',
	// 							name: 'README.md',
	// 							type: 'md'
	// 						}
	// 					]
	// 				}
	// 			}
	// 		},

	// 		foo: {
	// 			sequence: 2,
	// 			title: 'foo',
	// 			slug: 'foo',
	// 			elements: {
	// 				bar: {
	// 					sequence: 1,
	// 					title: 'bar',
	// 					slug: 'bar',
	// 					pages: {
	// 						pg: {
	// 							sequence: 1,
	// 							title: 'pg',
	// 							slug: 'pg',
	// 							files: [
	// 								{
	// 									file: './stories/02-foo/01-bar/01-pg/App.svelte',
	// 									name: 'App.svelte',
	// 									type: 'svelte',
	// 									code: 'Code for Foo Component/01'
	// 								}
	// 							]
	// 						}
	// 					}
	// 				}
	// 			},
	// 			pages: {
	// 				pg: {
	// 					sequence: 1,
	// 					title: 'pg',
	// 					slug: 'pg',
	// 					files: [
	// 						{
	// 							code: 'Code for Foo Component/01',
	// 							file: './stories/02-foo/01-bar/01-pg/App.svelte',
	// 							name: 'App.svelte',
	// 							type: 'svelte'
	// 						}
	// 					]
	// 				}
	// 			}
	// 		}
	// 	}
	// 	const sections = [
	// 		{
	// 			sequence: 1,
	// 			title: 'Intro',
	// 			slug: 'intro',
	// 			description: 'Group > Foo',
	// 			elements: [],
	// 			pages: [
	// 				{
	// 					sequence: 1,
	// 					title: 'Page 01',
	// 					slug: 'page-01',
	// 					notes: 'Notes for Foo Component',
	// 					files: [
	// 						{
	// 							file: './stories/01-intro/01-foo/README.md',
	// 							name: 'README.md',
	// 							type: 'md'
	// 						}
	// 					]
	// 				}
	// 			]
	// 		},
	// 		{
	// 			sequence: 2,
	// 			title: 'foo',
	// 			slug: 'foo',
	// 			elements: [
	// 				{
	// 					sequence: 1,
	// 					title: 'bar',
	// 					slug: 'bar',
	// 					pages: [
	// 						{
	// 							sequence: 1,
	// 							title: 'pg',
	// 							slug: 'pg',
	// 							files: [
	// 								{
	// 									file: './stories/02-foo/01-bar/01-pg/App.svelte',
	// 									name: 'App.svelte',
	// 									type: 'svelte',
	// 									code: 'Code for Foo Component/01'
	// 								}
	// 							]
	// 						}
	// 					]
	// 				}
	// 			],
	// 			pages: [
	// 				{
	// 					sequence: 1,
	// 					title: 'pg',
	// 					slug: 'pg',
	// 					files: [
	// 						{
	// 							code: 'Code for Foo Component/01',
	// 							file: './stories/02-foo/01-bar/01-pg/App.svelte',
	// 							name: 'App.svelte',
	// 							type: 'svelte'
	// 						}
	// 					]
	// 				}
	// 			]
	// 		}
	// 	]

	// 	it('should generate stories object using modules and sources as input', async () => {
	// 		const result = await extractStories(modules, sources)
	// 		JSON.stringify(result, null, 2)
	// 		expect(result).toEqual(stories)
	// 	})

	// 	it('should generate a list of categorized components', async () => {
	// 		const stories = await extractStories(modules, sources)
	// 		const result = toSortedHierarchy(stories)
	// 		expect(result).toEqual(sections)
	// 	})

	// 	it('should generate stories & categories using modules and sources as input', async () => {
	// 		const result = createStories(modules, sources)

	// 		expect(result.ready()).toBeFalsy()
	// 		if (!result.ready()) {
	// 			expect(result.stories()).toEqual({})
	// 			expect(result.sections()).toEqual([])
	// 			expect(result.story('foo')).toEqual(null)
	// 		}
	// 		await result.fetch()
	// 		expect(result.ready()).toBeTruthy()
	// 		expect(result.stories()).toEqual(stories)
	// 		expect(result.sections()).toEqual(sections)
	// 		// console.log(result.stories())
	// 		expect(result.story('foo')).toEqual(stories.foo)
	// 		// 	expect(result.story('bar')).toEqual(stories.bar)
	// 	})
	// })
	// it('should generate nested menu data from metadata', () => {
	// 	const data = {
	// 		tree: {
	// 			name: 'Tree',
	// 			metadata: {
	// 				category: 'Selection',
	// 				name: 'Tree',
	// 				icon: 'tree',
	// 				description: 'A tree of items that can be expanded and collapsed.'
	// 			}
	// 		},
	// 		tabs: {
	// 			name: 'Tabs',
	// 			metadata: {
	// 				category: 'Selection',
	// 				description: 'A set of tabs that can be navigated.'
	// 			}
	// 		},
	// 		input: {
	// 			name: 'Input',
	// 			metadata: {
	// 				category: 'Form',
	// 				description: 'A form input field.'
	// 			}
	// 		}
	// 	}
	// 	const result = extractNestedItems(data)

	// 	expect(result).toEqual([
	// 		{
	// 			category: 'Selection',
	// 			items: [
	// 				data.tree.metadata,
	// 				{ icon: 'tabs', name: 'Tabs', ...data.tabs.metadata }
	// 			]
	// 		},
	// 		{
	// 			category: 'Form',
	// 			items: [{ icon: 'input', name: 'Input', ...data.input.metadata }]
	// 		}
	// 	])
	// })
})
