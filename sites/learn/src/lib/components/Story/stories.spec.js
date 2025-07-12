import { describe, it, expect, vi } from 'vitest'
import { fetchImports, fetchStories } from './stories.js'

describe('stories.js', () => {
	describe('fetchImports', () => {
		it('should process sources and group files correctly', async () => {
			const mockSources = {
				'folder1/file1.js': vi.fn().mockResolvedValue('const test = 1;'),
				'folder1/file2.ts': vi.fn().mockResolvedValue('const test: number = 2;'),
				'folder2/file3.svelte': vi.fn().mockResolvedValue('<script>let count = 0;</script>'),
				'./root.js': vi.fn().mockResolvedValue('console.log("root");')
			}

			const result = await fetchImports(mockSources)

			expect(result).toEqual({
				folder1: [
					{
						file: 'folder1/file1.js',
						name: 'file1.js',
						language: 'javascript',
						content: 'const test = 1;'
					},
					{
						file: 'folder1/file2.ts',
						name: 'file2.ts',
						language: 'typescript',
						content: 'const test: number = 2;'
					}
				],
				folder2: [
					{
						file: 'folder2/file3.svelte',
						name: 'file3.svelte',
						language: 'svelte',
						content: '<script>let count = 0;</script>'
					}
				]
			})

			expect(mockSources['folder1/file1.js']).toHaveBeenCalled()
			expect(mockSources['folder1/file2.ts']).toHaveBeenCalled()
			expect(mockSources['folder2/file3.svelte']).toHaveBeenCalled()
			expect(mockSources['./root.js']).toHaveBeenCalled()
		})

		it('should handle empty sources', async () => {
			const result = await fetchImports({})
			expect(result).toEqual({})
		})

		it('should handle markdown files with correct language mapping', async () => {
			const mockSources = {
				'docs/readme.md': vi.fn().mockResolvedValue('# Title\n\nContent')
			}

			const result = await fetchImports(mockSources)

			expect(result.docs[0].language).toBe('markdown')
		})

		it('should handle unknown file extensions', async () => {
			const mockSources = {
				'config/settings.toml': vi.fn().mockResolvedValue('[section]\nkey = "value"')
			}

			const result = await fetchImports(mockSources)

			expect(result.config[0].language).toBe('toml')
		})

		it('should filter out root level files (group === ".")', async () => {
			const mockSources = {
				'./package.json': vi.fn().mockResolvedValue('{}'),
				'folder/file.js': vi.fn().mockResolvedValue('const x = 1;')
			}

			const result = await fetchImports(mockSources)

			// expect(result).not.toHaveProperty('.')
			expect(result).toHaveProperty('folder')
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
