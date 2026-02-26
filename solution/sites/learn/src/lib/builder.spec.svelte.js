// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StoryBuilder } from './builder.svelte.js'

describe('StoryBuilder', () => {
	let mockSources, mockModules

	beforeEach(() => {
		vi.clearAllMocks()
		mockSources = {
			'intro/file1.js': vi.fn().mockResolvedValue('const intro = true;'),
			'intro/App.svelte': vi.fn().mockResolvedValue('<script>let intro = true;</script>'),
			'fragments/01-basic.svelte': vi.fn().mockResolvedValue('<Component />'),
			'fragments/02-advanced.svelte': vi.fn().mockResolvedValue('<Component prop="value" />')
		}
		mockModules = {
			'intro/App.svelte': vi.fn().mockResolvedValue({ default: 'IntroComponent' })
		}
	})

	it('should initialize with loading state', () => {
		const builder = new StoryBuilder(mockSources, mockModules)

		expect(builder.loading).toBe(true)
		expect(builder.error).toBe(null)
		expect(builder.examples).toEqual({})
		expect(builder.fragments).toEqual([])
	})

	it('should provide helper methods for checking existence', () => {
		const builder = new StoryBuilder({}, {})

		expect(builder.hasExample('nonexistent')).toBe(false)
		expect(builder.hasFragment(0)).toBe(false)
		expect(builder.getExample('nonexistent')).toBe(undefined)
		expect(builder.getFragment(0)).toBe(undefined)
	})

	it('should process stories and update reactive state', async () => {
		const builder = new StoryBuilder(mockSources, mockModules)

		// Wait for processing to complete
		await new Promise((resolve) => {
			const checkLoading = () => {
				if (!builder.loading) {
					resolve()
				} else {
					setTimeout(checkLoading, 10)
				}
			}
			checkLoading()
		})

		expect(builder.loading).toBe(false)
		expect(builder.error).toBe(null)
		expect(builder.hasExample('intro')).toBe(true)
		expect(builder.getExample('intro')).toBeDefined()
		expect(builder.getExample('intro').App).toBeDefined()
	})

	it('should handle fragments correctly', async () => {
		const builder = new StoryBuilder(mockSources, mockModules)

		// Wait for processing
		await new Promise((resolve) => {
			const checkLoading = () => {
				if (!builder.loading) {
					resolve()
				} else {
					setTimeout(checkLoading, 10)
				}
			}
			checkLoading()
		})

		expect(builder.hasFragment(0)).toBe(true)
		expect(builder.hasFragment(1)).toBe(true)
		expect(builder.hasFragment(2)).toBe(false)

		const fragment0 = builder.getFragment(0)
		expect(fragment0).toBeDefined()
		expect(fragment0.content).toBe('<Component />')
		expect(fragment0.language).toBe('svelte')
	})

	it('should handle errors gracefully', async () => {
		const errorSources = {
			'broken/file.js': vi.fn().mockRejectedValue(new Error('Failed to load'))
		}

		const builder = new StoryBuilder(errorSources, {})

		// Wait for processing
		await new Promise((resolve) => {
			const checkLoading = () => {
				if (!builder.loading) {
					resolve()
				} else {
					setTimeout(checkLoading, 10)
				}
			}
			checkLoading()
		})

		expect(builder.loading).toBe(false)
		expect(builder.error).toBeInstanceOf(Error)
	})

	it('should handle empty sources and modules', () => {
		const builder = new StoryBuilder({}, {})

		expect(builder.loading).toBe(true)
		expect(builder.examples).toEqual({})
		expect(builder.fragments).toEqual([])
	})
})
