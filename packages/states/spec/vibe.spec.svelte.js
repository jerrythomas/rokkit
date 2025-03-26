import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest'
import { vibe } from '../src/vibe.svelte.js'
import { themeRules } from '@rokkit/core'
import { flushSync } from 'svelte'
import { defaultColors } from '@rokkit/core'

describe('vibe', () => {
	beforeAll(() => {
		// eslint-disable-next-line no-console
		console.warn = vi.fn()
	})
	afterAll(() => {
		vi.resetAllMocks()
	})
	it('should provide a default value', () => {
		expect(vibe.style).toEqual('rokkit')
		expect(vibe.mode).toEqual('dark')
		expect(vibe.density).toEqual('comfortable')
		expect(vibe.palette).toEqual(themeRules(vibe.style)[1][1])
	})

	it('should validate style updates', () => {
		vibe.style = 'minimal'
		expect(vibe.style).toEqual('minimal')
		expect(vibe.palette).toEqual(themeRules(vibe.style)[1][1])
		vibe.style = 'unknown'
		expect(vibe.style).toEqual('minimal')
	})

	it('should validate mode updates', () => {
		vibe.mode = 'light'
		expect(vibe.mode).toEqual('light')
		expect(vibe.palette).toEqual(themeRules(vibe.style)[0][1])
		vibe.mode = 'unknown'
		expect(vibe.mode).toEqual('light')
	})

	it('should validate density updates', () => {
		vibe.density = 'compact'
		expect(vibe.density).toEqual('compact')
		vibe.density = 'cozy'
		expect(vibe.density).toEqual('cozy')
		vibe.density = 'comfortable'
		expect(vibe.density).toEqual('comfortable')
		vibe.density = 'unknown'
		expect(vibe.density).toEqual('comfortable')
	})

	it('should update palette when colors change', () => {
		expect(() => (vibe.colorMap = { primary: 'ambrosia' })).toThrow(
			'Did you forget to define "ambrosia"?'
		)
		expect(vibe.palette).toEqual(themeRules(vibe.style)[0][1])
		vibe.colors = { ambrosia: defaultColors.amber }
		flushSync()
		let expected = themeRules(vibe.style, {}, { ambrosia: defaultColors.amber })
		expect(vibe.palette).toEqual(expected[0][1])
		vibe.colorMap = { primary: 'ambrosia' }
		flushSync()
		expected = themeRules(vibe.style, { primary: 'ambrosia' }, { ambrosia: defaultColors.amber })
		expect(vibe.palette).toEqual(expected[0][1])
	})

	it('should update palette when color map changes', () => {
		vibe.colorMap = { primary: 'rose', secondary: 'green' }
		flushSync()
		const expected = themeRules(vibe.style, { primary: 'rose', secondary: 'green' })
		expect(vibe.palette).toEqual(expected[0][1])
	})

	it('should save theme configuration to storage', () => {
		vibe.update({
			style: 'minimal',
			mode: 'light',
			density: 'compact'
		})
		flushSync()

		vibe.save('theme')

		const stored = JSON.parse(localStorage.getItem('theme'))
		expect(stored).toEqual({
			style: 'minimal',
			mode: 'light',
			density: 'compact'
		})
	})

	it('should load theme configuration from storage', () => {
		const storedTheme = {
			style: 'minimal',
			mode: 'light',
			density: 'compact'
		}
		localStorage.setItem('theme', JSON.stringify(storedTheme))

		vibe.load('theme')
		flushSync()

		expect(vibe.style).toBe('minimal')
		expect(vibe.mode).toBe('light')
		expect(vibe.density).toBe('compact')
	})

	it('should update theme with partial configuration', () => {
		vibe.update({
			style: 'minimal',
			mode: 'light'
			// density omitted
		})
		flushSync()

		expect(vibe.style).toBe('minimal')
		expect(vibe.mode).toBe('light')
		expect(vibe.density).toBe('compact') // unchanged
	})

	it('should ignore invalid values during update', () => {
		vibe.update({
			style: 'invalid',
			mode: 'invalid',
			density: 'invalid'
		})
		flushSync()

		expect(vibe.style).toBe('minimal')
		expect(vibe.mode).toBe('light')
		expect(vibe.density).toBe('compact')
	})

	it('should handle invalid stored data gracefully', () => {
		localStorage.setItem('theme', 'invalid json')

		vibe.load('theme')
		// eslint-disable-next-line no-console
		expect(console.warn).toHaveBeenCalledWith(
			'Failed to load theme from storage for key "theme"',
			'Unexpected token \'i\', "invalid json" is not valid JSON'
		)
		flushSync()

		expect(vibe.style).toBe('minimal')
		expect(vibe.mode).toBe('light')
		expect(vibe.density).toBe('compact')
	})

	describe('mocked', () => {
		const localStorageMock = {
			getItem: vi.fn(),
			setItem: vi.fn().mockImplementation(() => {
				throw new Error('Mocked error')
			})
		}
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
				writable: true
			})
		})
		it('should handle exceptions on save', () => {
			expect(() => vibe.save()).toThrow('Key is required')
			vibe.save('invalid')
			// eslint-disable-next-line no-console
			expect(console.warn).toHaveBeenCalledWith(
				'Failed to save theme to storage for key "invalid"',
				'Mocked error'
			)
		})
	})
})
