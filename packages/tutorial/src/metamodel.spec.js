import { describe, it, expect } from 'vitest'
import {
	fetchImports,
	addPathMetadata,
	addModuleMetadata,
	generateRouteEntries,
	turorialsToNestedObject,
	convertFilesToFolderHierarchy
} from './metamodel.js'

describe('metamodel', () => {
	describe('fetchImports', () => {
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
	})

	describe('addPathMetadata', () => {
		it('should add metadata from path', async () => {
			let input = [
				{ file: '01-welcome/meta.json' },
				{
					file: '01-welcome/01-overview/README.md'
				},
				{
					file: '01-welcome/01-overview/src/App.svelte'
				},
				{
					file: '01-welcome/01-overview/src/data.js'
				},
				{
					file: '01-welcome/02-component/01-intro/README.md'
				}
			]
			let result = addPathMetadata(input)
			expect(result).toEqual([
				{
					name: 'meta.json',
					parts: [{ sequence: 1, key: 'welcome' }]
				},
				{
					name: 'README.md',
					parts: [
						{ sequence: 1, key: 'welcome' },
						{ sequence: 1, key: 'overview' }
					]
				},
				{
					name: 'App.svelte',
					path: 'src',
					type: 'svelte',
					parts: [
						{ sequence: 1, key: 'welcome' },
						{ sequence: 1, key: 'overview' }
					]
				},
				{
					name: 'data.js',
					path: 'src',
					type: 'js',
					parts: [
						{ sequence: 1, key: 'welcome' },
						{ sequence: 1, key: 'overview' }
					]
				},
				{
					name: 'README.md',
					parts: [
						{ sequence: 1, key: 'welcome' },
						{ sequence: 2, key: 'component' },
						{ sequence: 1, key: 'intro' }
					]
				}
			])
		})
	})
	describe('addMetadata', () => {
		it('should add metadata for modules', async () => {
			let input = [
				{ name: 'meta.json', content: { title: 'Welcome' } },
				{
					name: 'README.md',
					content: {
						default: 'Content for Overview',
						metadata: { title: 'Overview' }
					}
				},
				{
					name: 'App.svelte',
					content: {
						default: 'Preview for Overview'
					}
				},
				{
					name: 'data.js',
					content: 'Source for data.js'
				},
				{
					name: 'README.md',
					content: {
						default: 'Content for What is a component',
						metadata: { title: 'What is a component?' }
					}
				}
			]
			const options = {
				metadataFilename: 'meta.json',
				readmeFilename: 'README.md',
				previewFilename: 'App.svelte'
			}
			let result = addModuleMetadata(input, options)
			expect(result).toEqual([
				{
					name: 'meta.json',
					title: 'Welcome'
				},
				{
					name: 'README.md',
					title: 'Overview',
					readme: 'Content for Overview'
				},
				{
					name: 'App.svelte',
					preview: 'Preview for Overview'
				},
				{
					name: 'data.js',
					content: 'Source for data.js'
				},
				{
					name: 'README.md',
					readme: 'Content for What is a component',
					title: 'What is a component?'
				}
			])
		})
	})

	describe('toNestedObject', () => {
		const input = [
			{
				name: 'meta.json',
				parts: [{ sequence: 1, key: 'welcome' }],
				title: 'Welcome'
			},
			{
				name: 'README.md',
				parts: [
					{ sequence: 1, key: 'welcome' },
					{ sequence: 1, key: 'overview' }
				],
				title: 'Overview',
				readme: 'Content for Overview'
			},
			{
				name: 'App.svelte',
				path: 'src',
				type: 'svelte',
				parts: [
					{ sequence: 1, key: 'welcome' },
					{ sequence: 1, key: 'overview' }
				],
				preview: 'Preview for Overview'
			},
			{
				name: 'App.svelte',
				path: 'src',
				type: 'svelte',
				parts: [
					{ sequence: 1, key: 'welcome' },
					{ sequence: 1, key: 'overview' }
				],
				content: '<h1>Welcome!</h1>'
			},
			{
				name: 'data.js',
				path: 'src',
				type: 'js',
				parts: [
					{ sequence: 1, key: 'welcome' },
					{ sequence: 1, key: 'overview' }
				],
				content: 'export default {}'
			},
			{
				name: 'README.md',
				parts: [
					{ sequence: 1, key: 'welcome' },
					{ sequence: 2, key: 'component' },
					{ sequence: 1, key: 'intro' }
				],
				title: 'What is a component?',
				readme: 'Content for What is a component'
			}
		]
		it('should convert an item to nested object', () => {
			let data = {}
			data = turorialsToNestedObject({}, input[0])
			expect(data).toEqual({
				welcome: {
					sequence: 1,
					key: 'welcome',
					title: 'Welcome'
				}
			})

			data = turorialsToNestedObject({}, input[1])
			expect(data).toEqual({
				welcome: {
					sequence: 1,
					key: 'welcome',
					children: {
						overview: {
							sequence: 1,
							key: 'overview',
							title: 'Overview',
							route: 'welcome/overview',
							readme: 'Content for Overview'
						}
					}
				}
			})

			data = turorialsToNestedObject({}, input[2])
			expect(data).toEqual({
				welcome: {
					sequence: 1,
					key: 'welcome',
					children: {
						overview: {
							sequence: 1,
							key: 'overview',
							src: {
								preview: 'Preview for Overview',
								files: []
							}
						}
					}
				}
			})
			data = turorialsToNestedObject({}, input[3])
			expect(data).toEqual({
				welcome: {
					sequence: 1,
					key: 'welcome',
					children: {
						overview: {
							sequence: 1,
							key: 'overview',
							src: {
								files: [
									{
										name: 'App.svelte',
										path: 'src',
										type: 'svelte',
										content: '<h1>Welcome!</h1>'
									}
								]
							}
						}
					}
				}
			})

			data = turorialsToNestedObject({}, input[4])
			expect(data).toEqual({
				welcome: {
					sequence: 1,
					key: 'welcome',
					children: {
						overview: {
							sequence: 1,
							key: 'overview',
							src: {
								files: [
									{
										name: 'data.js',
										path: 'src',
										type: 'js',
										content: 'export default {}'
									}
								]
							}
						}
					}
				}
			})
		})
		it('should convert an array of items to nested object', () => {
			let data = {}
			input.map((item) => {
				data = turorialsToNestedObject(data, item)
			})
			expect(data).toEqual({
				welcome: {
					sequence: 1,
					key: 'welcome',
					title: 'Welcome',
					children: {
						component: {
							sequence: 2,
							key: 'component',
							children: {
								intro: {
									sequence: 1,
									key: 'intro',
									title: 'What is a component?',
									route: 'welcome/component/intro',
									readme: 'Content for What is a component'
								}
							}
						},
						overview: {
							sequence: 1,
							key: 'overview',
							title: 'Overview',
							route: 'welcome/overview',
							readme: 'Content for Overview',
							src: {
								preview: 'Preview for Overview',
								files: [
									{
										name: 'App.svelte',
										path: 'src',
										type: 'svelte',
										content: '<h1>Welcome!</h1>'
									},
									{
										name: 'data.js',
										path: 'src',
										type: 'js',
										content: 'export default {}'
									}
								]
							}
						}
					}
				}
			})
		})
	})

	describe('convertFilesToFolderHierarchy', () => {
		it('should convert the array of files to folder hierarchy', () => {
			const input = {
				welcome: {
					sequence: 1,
					key: 'welcome',
					title: 'Welcome',
					children: {
						component: {
							sequence: 2,
							key: 'component',
							children: {
								intro: {
									sequence: 1,
									key: 'intro',
									title: 'What is a component?',
									route: 'welcome/component/intro'
								}
							}
						},
						overview: {
							sequence: 1,
							key: 'overview',
							title: 'Overview',
							route: 'welcome/overview',
							readme: 'Content for Overview',
							src: {
								preview: 'Preview for Overview',
								files: [
									{
										name: 'App.svelte',
										path: 'src',
										type: 'svelte',
										content: '<h1>Welcome!</h1>'
									},
									{
										name: 'data.js',
										path: 'src',
										type: 'js',
										content: 'export default {}'
									}
								]
							}
						}
					}
				}
			}
			const options = {
				partialFolder: 'pre',
				solutionFolder: 'src'
			}
			const output = convertFilesToFolderHierarchy(input, options)
			expect(output).toEqual({
				welcome: {
					sequence: 1,
					key: 'welcome',
					title: 'Welcome',
					children: {
						component: {
							sequence: 2,
							key: 'component',
							children: {
								intro: {
									sequence: 1,
									key: 'intro',
									title: 'What is a component?',
									route: 'welcome/component/intro'
								}
							}
						},
						overview: {
							sequence: 1,
							key: 'overview',
							title: 'Overview',
							route: 'welcome/overview',
							readme: 'Content for Overview',
							src: {
								preview: 'Preview for Overview',
								files: [
									{
										name: 'src',
										path: '',
										type: 'folder',
										children: [
											{
												name: 'App.svelte',
												path: 'src',
												type: 'svelte',
												content: '<h1>Welcome!</h1>'
											},
											{
												name: 'data.js',
												path: 'src',
												type: 'js',
												content: 'export default {}'
											}
										]
									}
								]
							}
						}
					}
				}
			})
		})
	})

	describe('generateRouteEntries', () => {
		const input = {
			welcome: {
				sequence: 1,
				key: 'welcome',
				title: 'Welcome',
				children: {
					component: {
						sequence: 2,
						key: 'component',
						children: {
							intro: {
								sequence: 1,
								key: 'intro',
								route: 'welcome/component/intro',
								title: 'What is a component?'
							}
						}
					},
					overview: {
						sequence: 1,
						key: 'overview',
						route: 'welcome/overview'
					}
				}
			}
		}

		it('should generate route entries for the given object', () => {
			const result = generateRouteEntries(input)
			expect(result).toEqual(['welcome/component/intro', 'welcome/overview'])
		})
	})
})
