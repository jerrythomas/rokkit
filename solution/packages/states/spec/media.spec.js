import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defaultBreakpoints } from '../src/media.svelte.js'

beforeEach(() => {
	window.matchMedia = vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	}))
})

describe('defaultBreakpoints', () => {
	it('has expected breakpoint keys', () => {
		const keys = Object.keys(defaultBreakpoints)
		expect(keys).toContain('small')
		expect(keys).toContain('medium')
		expect(keys).toContain('large')
		expect(keys).toContain('extraLarge')
		expect(keys).toContain('short')
		expect(keys).toContain('landscape')
		expect(keys).toContain('tiny')
		expect(keys).toContain('dark')
		expect(keys).toContain('noanimations')
	})

	it('values are valid media query strings', () => {
		for (const query of Object.values(defaultBreakpoints)) {
			expect(typeof query).toBe('string')
			expect(query).toMatch(/^\(/)
		}
	})
})

describe('watchMedia', () => {
	it('returns object with keys matching default breakpoints', async () => {
		const { watchMedia } = await import('../src/media.svelte.js')
		const media = watchMedia()
		for (const key of Object.keys(defaultBreakpoints)) {
			expect(media).toHaveProperty(key)
		}
	})

	it('each value has a current property', async () => {
		const { watchMedia } = await import('../src/media.svelte.js')
		const media = watchMedia()
		for (const value of Object.values(media)) {
			expect(value).toHaveProperty('current')
			expect(typeof value.current).toBe('boolean')
		}
	})

	it('uses custom breakpoints when provided', async () => {
		const { watchMedia } = await import('../src/media.svelte.js')
		const custom = { wide: '(min-width: 1600px)', narrow: '(max-width: 480px)' }
		const media = watchMedia(custom)

		expect(Object.keys(media)).toEqual(['wide', 'narrow'])
		expect(media).not.toHaveProperty('small')
	})

	it('passes query strings to MediaQuery', async () => {
		const { watchMedia } = await import('../src/media.svelte.js')
		watchMedia()

		for (const query of Object.values(defaultBreakpoints)) {
			expect(window.matchMedia).toHaveBeenCalledWith(query)
		}
	})
})
