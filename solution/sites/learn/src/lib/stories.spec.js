// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSections, getSlug, fetchImports, fetchStories, groupFiles } from './stories.js'

describe('stories.js', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getSlug', () => {
		it('should return the slug from a file path', () => {
			const file = './welcome/introduction/meta.json'
			const slug = getSlug(file)
			expect(slug).toBe('/welcome/introduction')
		})
	})

	describe('getSections', () => {
		it('should combine metadata from categories and components', () => {
			const result = getSections([])
			expect(result).toEqual([])
		})
		it('should group by categories', () => {
			const metadata = [
				,
				{
					content: { title: 'Elements', category: 'elements', order: 2 },
					file: './elements/meta.json'
				},
				{
					content: { title: 'List', order: 2 },

					group: 'elements',
					file: './elements/list/meta.json'
				},
				{
					content: { title: 'Components', category: 'elements', order: 1 },
					group: 'elements',
					file: './elements/components/meta.json'
				},
				{
					content: { title: 'Welcome', category: 'welcome', order: 1 },
					file: './welcome/meta.json'
				},
				{
					content: { title: 'Getting Started', category: 'welcome', order: 2 },
					file: './welcome/get/meta.json'
				},
				{
					content: { title: 'Introduction', category: 'welcome', order: 1 },
					file: './welcome/introduction/meta.json'
				}
			]
			const result = getSections(metadata)
			expect(result).toEqual([
				{
					title: 'Welcome',
					category: 'welcome',
					order: 1,
					depth: 1,
					slug: '/welcome',
					children: [
						{
							title: 'Introduction',
							category: 'welcome',
							order: 1,
							depth: 2,
							slug: '/welcome/introduction'
						},
						{
							title: 'Getting Started',
							category: 'welcome',
							depth: 2,
							slug: '/welcome/get',
							order: 2
						}
					]
				},
				{
					title: 'Elements',
					category: 'elements',
					order: 2,
					depth: 1,
					slug: '/elements',
					children: [
						{
							title: 'Components',
							order: 1,
							depth: 2,
							category: 'elements',
							slug: '/elements/components'
						},
						{
							title: 'List',
							order: 2,
							depth: 2,
							category: 'elements',
							slug: '/elements/list'
						}
					]
				}
			])
		})
	})

	describe('fetchImports', () => {
		it('should process sources and group files correctly', async () => {
			const mockSources = {
				'folder1/file1.js': vi.fn().mockResolvedValue('const test = 1;'),
				'folder1/file2.ts': vi.fn().mockResolvedValue('const test: number = 2;'),
				'folder2/file3.svelte': vi.fn().mockResolvedValue('<script>let count = 0;</script>'),
				'./root.js': vi.fn().mockResolvedValue('console.log("root");')
			}

			const result = await fetchImports(mockSources)

			expect(result).toEqual([
				{
					file: 'folder1/file1.js',
					name: 'file1.js',
					group: 'folder1',
					language: 'javascript',
					content: 'const test = 1;'
				},
				{
					file: 'folder1/file2.ts',
					name: 'file2.ts',
					group: 'folder1',
					language: 'typescript',
					content: 'const test: number = 2;'
				},

				{
					file: 'folder2/file3.svelte',
					name: 'file3.svelte',
					group: 'folder2',
					language: 'svelte',
					content: '<script>let count = 0;</script>'
				},
				{
					file: './root.js',
					name: 'root.js',
					group: '.',
					language: 'javascript',
					content: 'console.log("root");'
				}
			])

			expect(mockSources['folder1/file1.js']).toHaveBeenCalled()
			expect(mockSources['folder1/file2.ts']).toHaveBeenCalled()
			expect(mockSources['folder2/file3.svelte']).toHaveBeenCalled()
			expect(mockSources['./root.js']).toHaveBeenCalled()
		})

		it('should handle empty sources', async () => {
			const result = await fetchImports({})
			expect(result).toEqual([])
		})
		it('should handle unknown file extensions', async () => {
			const mockSources = {
				'config/settings.toml': vi.fn().mockResolvedValue('[section]\nkey = "value"')
			}

			const result = await fetchImports(mockSources)

			expect(result[0].language).toBe('toml')
		})
		it('should handle markdown files with correct language mapping', async () => {
			const mockSources = {
				'docs/readme.md': vi.fn().mockResolvedValue('# Title\n\nContent')
			}

			const result = await fetchImports(mockSources)

			expect(result[0].language).toBe('markdown')
		})
	})
	describe('groupFiles', () => {
		it('should filter out root level files (group === ".")', () => {
			const mockFiles = [
				{
					file: 'folder1/file1.js',
					name: 'file1.js',
					group: 'folder1',
					language: 'javascript',
					content: 'const test = 1;'
				},
				{
					file: 'folder1/file2.ts',
					name: 'file2.ts',
					group: 'folder1',
					language: 'typescript',
					content: 'const test: number = 2;'
				},

				{
					file: 'folder2/file3.svelte',
					name: 'file3.svelte',
					group: 'folder2',
					language: 'svelte',
					content: '<script>let count = 0;</script>'
				},
				{
					file: './root.js',
					name: 'root.js',
					group: '.',
					language: 'javascript',
					content: 'console.log("root");'
				}
			]

			const result = groupFiles(mockFiles)

			expect(result).toEqual({
				folder1: [
					{
						content: 'const test = 1;',
						file: 'folder1/file1.js',
						language: 'javascript',
						name: 'file1.js'
					},
					{
						content: 'const test: number = 2;',
						file: 'folder1/file2.ts',
						language: 'typescript',
						name: 'file2.ts'
					}
				],
				folder2: [
					{
						content: '<script>let count = 0;</script>',
						file: 'folder2/file3.svelte',
						language: 'svelte',
						name: 'file3.svelte'
					}
				]
			})
		})
	})

	describe('fetchStories', () => {
		it('should combine sources and modules into stories', async () => {
			const mockSources = {
				'story1/file1.js': vi.fn().mockResolvedValue('const test = 1;'),
				'story1/file2.svelte': vi.fn().mockResolvedValue('<h1>Hello</h1>')
			}

			const mockModules = {
				'story1/App.svelte': vi.fn().mockResolvedValue({ default: 'MockComponent' })
			}

			const result = await fetchStories(mockSources, mockModules)

			expect(result).toEqual({
				story1: {
					files: [
						{
							file: 'story1/file1.js',
							name: 'file1.js',
							language: 'javascript',
							content: 'const test = 1;'
						},
						{
							file: 'story1/file2.svelte',
							name: 'file2.svelte',
							language: 'svelte',
							content: '<h1>Hello</h1>'
						}
					],
					App: { default: 'MockComponent' }
				}
			})
		})

		it('should handle multiple stories', async () => {
			const mockSources = {
				'story1/file1.js': vi.fn().mockResolvedValue('const a = 1;'),
				'story2/file2.js': vi.fn().mockResolvedValue('const b = 2;')
			}

			const mockModules = {
				'story1/App.svelte': vi.fn().mockResolvedValue({ default: 'Component1' }),
				'story2/App.svelte': vi.fn().mockResolvedValue({ default: 'Component2' })
			}

			const result = await fetchStories(mockSources, mockModules)

			expect(result).toHaveProperty('story1')
			expect(result).toHaveProperty('story2')
			expect(result.story1.App).toEqual({ default: 'Component1' })
			expect(result.story2.App).toEqual({ default: 'Component2' })
		})

		it('should handle empty sources and modules', async () => {
			const result = await fetchStories({}, {})
			expect(result).toEqual({})
		})
	})
})
