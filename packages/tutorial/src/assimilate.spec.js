import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { assimilateTutorials } from './assimilate'

describe('assimilate', () => {
	let modules, sources, options
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
			'./stories/01-intro/01-foo/src/App.svelte': () =>
				Promise.resolve('<h1>Foo Component</h1>')
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

	it('should assimilate tutorials', async () => {
		const tutorials = assimilateTutorials(modules, sources, options)
		expect(typeof tutorials).toBe('object')
		expect(tutorials.assimilated()).toBeFalsy()
		await tutorials.assimilate()
		expect(tutorials.assimilated()).toBeTruthy()
		expect(console.info).toHaveBeenCalledTimes(2)
		expect(console.info).toHaveBeenCalledWith('Assimilating tutorials...')
		expect(console.info).toHaveBeenCalledWith('Assimilation complete.')
		expect(tutorials.content()).toEqual({
			experiment: {
				key: 'experiment',
				labs: true,
				sequence: 2,
				title: 'Experimental'
			},
			intro: {
				key: 'intro',
				sequence: 1,
				title: 'Intro',
				children: {
					foo: {
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
										}
									]
								}
							],
							preview: 'The Foo Component'
						}
					}
				}
			}
		})
	})

	it('should find a tutorial', async () => {
		const tutorials = assimilateTutorials(modules, sources, options)
		const tutorial = await tutorials.find('intro/foo')
		expect(tutorial).toEqual({
			key: 'foo',
			sequence: 1,
			title: 'Page 01',
			readme: 'Notes for Foo Component',
			route: 'intro/foo',
			crumbs: ['Intro', 'Page 01'],
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
							}
						]
					}
				],
				preview: 'The Foo Component'
			}
		})
		// expect(tutorial.name).toBe('Tutorial')
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
