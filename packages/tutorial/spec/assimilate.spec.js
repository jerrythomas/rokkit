import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { filterMenuItems, assimilateTutorials, findTutorial } from '../src/assimilate'

describe('assimilate', () => {
	describe('filterMenuItems', () => {
		it('should filter menu items', () => {
			const data = [
				{
					route: 'alpha',
					children: [
						{ route: 'foo' },
						{ route: 'bar', labs: true, children: [{ route: 'gamma' }] },
						{ route: 'alpha', labs: true }
					]
				},
				{ route: 'beta', labs: true },
				{ route: 'delta', labs: true, children: [{ route: 'epsilon' }] },
				{ route: 'zeta', children: [{ route: 'eta', labs: true }] }
			]
			let result = filterMenuItems(data, true)
			expect(result).toEqual(data)
			result = filterMenuItems(data)
			expect(result).toEqual([{ route: 'alpha', children: [{ route: 'foo' }] }])
		})
	})

	describe('findTutorial', () => {
		const data = [
			{
				title: 'Alpha',
				level: 0
			},
			{
				route: 'alpha/one',
				title: 'One',
				level: 1
			},
			{
				route: 'alpha/two',
				title: 'Two',
				level: 1
			},
			{ title: 'Beta', level: 0 },
			{
				route: 'beta/one',
				title: 'One',
				level: 1
			}
		]
		it('should find a tutorial', () => {
			const result = findTutorial(data, 'alpha/two')
			expect(result).toEqual({
				route: 'alpha/two',
				title: 'Two',
				level: 1,
				previous: 'alpha/one',
				next: 'beta/one',
				crumbs: ['Alpha', 'Two']
			})
		})
		it('should find a tutorial where next is null', () => {
			const result = findTutorial(data, 'beta/one')
			expect(result).toEqual({
				route: 'beta/one',
				title: 'One',
				level: 1,
				previous: 'alpha/two',
				next: null,
				crumbs: ['Beta', 'One']
			})
		})
		it('should find a tutorial where previous is null', () => {
			const result = findTutorial(data, 'alpha/one')
			expect(result).toEqual({
				route: 'alpha/one',
				title: 'One',
				level: 1,
				previous: null,
				next: 'alpha/two',
				crumbs: ['Alpha', 'One']
			})
		})
	})

	describe('assimilateTutorials', () => {
		let modules = null,
			sources = null,
			options = null
		beforeEach(() => {
			modules = {
				'./stories/01-intro/meta.json': () => Promise.resolve({ title: 'Intro' }),
				'./stories/01-intro/01-foo/README.md': () =>
					Promise.resolve({
						default: 'Notes for Foo Component',
						metadata: { title: 'Page 01' }
					}),
				'./stories/01-intro/01-foo/src/App.svelte': () =>
					Promise.resolve({ default: 'The Foo Component' }),
				'./stories/02-experiment/meta.json': () =>
					Promise.resolve({ title: 'Experimental', labs: true })
				// './stories/foo/01/README.md': () =>
				// 	Promise.resolve({
				// 		default: 'Notes for Foo Component',
				// 		metadata: { title: 'Page 01' }
				// 	}),
				// './stories/foo/02/App.svelte': () =>
				// 	Promise.resolve({ default: 'The Foo Component/02' }),
				// './stories/foo/02/README.md': () =>
				// 	Promise.resolve({
				// 		default: 'Notes for Foo Component/02',
				// 		metadata: { title: 'Page 02' }
				// 	}),
				// './stories/bar/meta.js': () =>
				// 	Promise.resolve({
				// 		default: { name: 'Bar', category: 'Group', description: 'Group > Bar' }
				// 	}),
				// './stories/bar/01/App.svelte': () =>
				// 	Promise.resolve({ default: 'The Bar Component' }),
				// './stories/bar/01/README.md': () =>
				// 	Promise.resolve({
				// 		default: 'Notes for Bar Component',
				// 		metadata: { title: 'Page 01' }
				// 	}),
				// './stories/bar/02/App.svelte': () =>
				// 	Promise.resolve({ default: 'The Bar Component/02' }),
				// './stories/bar/02/README.md': () =>
				// 	Promise.resolve({
				// 		default: 'Notes for Bar Component/02',
				// 		metadata: { title: 'Page 02' }
				// 	})
			}

			sources = {
				'./stories/01-intro/01-foo/src/App.svelte': () => Promise.resolve('<h1>Foo Component</h1>'),
				'./stories/01-intro/01-foo/src/data.js': () => Promise.resolve('{ "foo": "bar" }')
				// './stories/foo/02/App.svelte': () =>
				// 	Promise.resolve('Code for Foo Component/02'),
				// './stories/foo/01/data.js': () =>
				// 	Promise.resolve('Code for Foo/data.js Page/01'),
				// './stories/bar/01/App.svelte': () =>
				// 	Promise.resolve('Code for Bar Component/01'),
				// './stories/bar/02/App.svelte': () =>
				// 	Promise.resolve('Code for Bar Component/02'),
				// './stories/bar/01/data.js': () =>
				// 	Promise.resolve('Code for Bar/data.js Page/01')
			}
			options = {
				root: './stories/',
				previewFilename: 'App.svelte',
				readmeFilename: 'README.md',
				metadataFilename: 'meta.json',
				partialFolder: 'pre',
				solutionFolder: 'src'
			}
			console.info = vi.fn()
		})

		afterEach(() => {
			vi.resetAllMocks()
		})

		it('should handle empty options', async () => {
			const tutorials = assimilateTutorials(modules, sources)
			expect(typeof tutorials).toBe('object')
			await tutorials.assimilate()
			expect(console.info).toHaveBeenCalledTimes(2)
		})

		it('should not repeat assimilation tasks', async () => {
			const tutorials = assimilateTutorials(modules, sources, options)
			expect(typeof tutorials).toBe('object')
			await tutorials.assimilate()
			expect(console.info).toHaveBeenCalledTimes(2)
			await tutorials.assimilate()
			expect(console.info).toHaveBeenCalledTimes(2)
		})

		it('should assimilate tutorials', async () => {
			const tutorials = assimilateTutorials(modules, sources, options)
			expect(typeof tutorials).toBe('object')
			expect(tutorials.assimilated()).toBeFalsy()
			await tutorials.assimilate()
			expect(tutorials.assimilated()).toBeTruthy()
			expect(console.info).toHaveBeenCalledTimes(2)
			expect(console.info).toHaveBeenCalledWith('Assimilating tutorials...')
			expect(console.info).toHaveBeenCalledWith('Assimilation complete.')
			expect(tutorials.content()).toEqual([
				{
					key: 'intro',
					sequence: 1,
					title: 'Intro',
					children: [
						{
							key: 'foo',
							sequence: 1,
							title: 'Page 01',
							readme: 'Notes for Foo Component',
							route: 'intro/foo',
							src: {
								files: [
									{
										name: 'src',
										type: 'folder',
										path: '',
										children: [
											{
												content: '<h1>Foo Component</h1>',
												name: 'App.svelte',
												path: 'src',
												type: 'svelte'
											},
											{
												content: '{ "foo": "bar" }',
												name: 'data.js',
												path: 'src',
												type: 'js'
											}
										]
									}
								],
								preview: 'The Foo Component'
							}
						}
					]
				},
				{
					key: 'experiment',
					labs: true,
					sequence: 2,
					title: 'Experimental'
				}
			])
		})

		it('should find a tutorial', async () => {
			const tutorials = assimilateTutorials(modules, sources, options)
			let tutorial = await tutorials.find('xxx-xxx')
			expect(tutorial).toBeNull()

			tutorial = await tutorials.find('intro/foo')
			expect(tutorial).toEqual({
				key: 'foo',
				sequence: 1,
				title: 'Page 01',
				readme: 'Notes for Foo Component',
				route: 'intro/foo',
				crumbs: ['Intro', 'Page 01'],
				level: 1,
				next: null,
				parent: false,
				previous: null,
				src: {
					files: [
						{
							name: 'src',
							type: 'folder',
							path: '',
							children: [
								{
									content: '<h1>Foo Component</h1>',
									name: 'App.svelte',
									path: 'src',
									type: 'svelte'
								},
								{
									content: '{ "foo": "bar" }',
									name: 'data.js',
									path: 'src',
									type: 'js'
								}
							]
						}
					],
					preview: 'The Foo Component'
				}
			})
		})
		it('should get all route entries', async () => {
			const tutorials = assimilateTutorials(modules, sources, options)
			const entries = await tutorials.entries()
			expect(entries).toEqual(['intro/foo'])
		})

		it('should get hierarchical menu', async () => {
			const tutorials = assimilateTutorials(modules, sources, options)
			const menu = await tutorials.menu()
			expect(menu).toEqual([
				{
					key: 'intro',
					sequence: 1,
					title: 'Intro',
					children: [
						{
							key: 'foo',
							sequence: 1,
							title: 'Page 01',
							readme: 'Notes for Foo Component',
							route: 'intro/foo',
							src: {
								files: [
									{
										name: 'src',
										type: 'folder',
										path: '',
										children: [
											{
												content: '<h1>Foo Component</h1>',
												name: 'App.svelte',
												path: 'src',
												type: 'svelte'
											},
											{
												content: '{ "foo": "bar" }',
												name: 'data.js',
												path: 'src',
												type: 'js'
											}
										]
									}
								],
								preview: 'The Foo Component'
							}
						}
					]
				}
			])
		})

		it('should get hierarchical menu including lab items', async () => {
			const tutorials = assimilateTutorials(modules, sources, options)
			const menu = await tutorials.menu(true)
			expect(menu).toEqual([
				{
					key: 'intro',
					sequence: 1,
					title: 'Intro',
					children: [
						{
							key: 'foo',
							sequence: 1,
							title: 'Page 01',
							readme: 'Notes for Foo Component',
							route: 'intro/foo',
							src: {
								files: [
									{
										name: 'src',
										type: 'folder',
										path: '',
										children: [
											{
												content: '<h1>Foo Component</h1>',
												name: 'App.svelte',
												path: 'src',
												type: 'svelte'
											},
											{
												content: '{ "foo": "bar" }',
												name: 'data.js',
												path: 'src',
												type: 'js'
											}
										]
									}
								],
								preview: 'The Foo Component'
							}
						}
					]
				},
				{
					key: 'experiment',
					labs: true,
					sequence: 2,
					title: 'Experimental'
				}
			])
		})
	})
})
