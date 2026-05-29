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
		it('should return a separator followed by pre-initialised GROUPS when given empty metadata', () => {
			const result = getSections([])
			expect(result[0]).toEqual({ type: 'separator' })
			// The 5 GROUPS are always present regardless of metadata
			expect(result.length).toBe(6) // separator + 5 GROUPS
		})

		it('should inject a separator between guide items and groups', () => {
			const metadata = [
				{
					content: { title: 'Introduction', category: 'guide', order: 1 },
					file: './introduction/meta.json'
				},
				{
					content: { title: 'Welcome', category: 'welcome', order: 1 },
					file: './welcome/meta.json'
				},
				{
					content: { title: 'Getting Started', category: 'welcome', order: 2 },
					file: './welcome/get/meta.json'
				}
			]
			const result = getSections(metadata)
			const separatorIndex = result.findIndex((item) => item.type === 'separator')
			expect(separatorIndex).toBeGreaterThan(0)
			// guides come before separator
			expect(result[separatorIndex - 1].title).toBe('Introduction')
			// groups come after separator
			expect(result[separatorIndex + 1].title).toBe('Welcome')
		})

		it('should pre-initialise GROUPS with correct titles and orders', () => {
			const result = getSections([])
			// With no metadata, only the separator is present (GROUPS are filtered because they have
			// no children from metadata, but they have titles from GROUPS config)
			// Actually GROUPS are always present since they have titles — check they are returned
			// with empty children when no matching metadata
			const groupTitles = result.filter((item) => !item.type).map((item) => item.title)
			expect(groupTitles).toContain('Navigation & Selection')
			expect(groupTitles).toContain('Inputs')
			expect(groupTitles).toContain('Display')
			expect(groupTitles).toContain('Layout')
			expect(groupTitles).toContain('Effects')
		})

		it('should sort GROUPS by their configured order', () => {
			const result = getSections([])
			const groups = result.filter((item) => !item.type)
			const orders = groups.map((g) => g.order)
			expect(orders).toEqual([...orders].sort((a, b) => a - b))
		})

		it('should add children to pre-initialised GROUPS when metadata matches', () => {
			const metadata = [
				{
					content: { title: 'List', category: 'navigation-selection', order: 1 },
					file: './navigation-selection/list/meta.json'
				}
			]
			const result = getSections(metadata)
			const navGroup = result.find((item) => item.title === 'Navigation & Selection')
			expect(navGroup).toBeDefined()
			expect(navGroup.children).toHaveLength(1)
			expect(navGroup.children[0].title).toBe('List')
		})

		it('should handle depth-based categories (forms, charts) as before', () => {
			const metadata = [
				{
					content: { title: 'Forms', category: 'forms', order: 5 },
					file: './forms/meta.json'
				},
				{
					content: { title: 'Checkbox', category: 'forms', order: 1 },
					file: './forms/checkbox/meta.json'
				},
				{
					content: { title: 'Charts', category: 'charts', order: 6 },
					file: './charts/meta.json'
				}
			]
			const result = getSections(metadata)
			const formsGroup = result.find((item) => item.title === 'Forms')
			expect(formsGroup).toBeDefined()
			expect(formsGroup.children).toHaveLength(1)
			expect(formsGroup.children[0].title).toBe('Checkbox')
			const chartsGroup = result.find((item) => item.title === 'Charts')
			expect(chartsGroup).toBeDefined()
		})

		it('should group by categories', () => {
			const metadata = [
				{
					content: { title: 'Elements', category: 'elements', order: 2 },
					file: './elements/meta.json'
				},
				{
					content: { title: 'List', category: 'elements', order: 2 },
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
			// Result now includes a separator — find the groups after it
			const separatorIndex = result.findIndex((item) => item.type === 'separator')
			expect(separatorIndex).toBe(0) // no guides in this dataset
			const groups = result.slice(separatorIndex + 1)
			expect(groups.find((g) => g.title === 'Welcome')).toMatchObject({
				title: 'Welcome',
				category: 'welcome',
				order: 1,
				depth: 1,
				slug: '/docs/welcome',
				children: [
					{
						title: 'Introduction',
						category: 'welcome',
						order: 1,
						depth: 2,
						slug: '/docs/welcome/introduction'
					},
					{
						title: 'Getting Started',
						category: 'welcome',
						depth: 2,
						slug: '/docs/welcome/get',
						order: 2
					}
				]
			})
			expect(groups.find((g) => g.title === 'Elements')).toMatchObject({
				title: 'Elements',
				category: 'elements',
				order: 2,
				depth: 1,
				slug: '/docs/elements',
				children: [
					{
						title: 'Components',
						order: 1,
						depth: 2,
						category: 'elements',
						slug: '/docs/elements/components'
					},
					{
						title: 'List',
						order: 2,
						depth: 2,
						category: 'elements',
						slug: '/docs/elements/list'
					}
				]
			})
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
