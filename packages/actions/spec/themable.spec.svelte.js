import { it, expect, describe } from 'vitest'
import { flushSync } from 'svelte'
import { themable } from '../src/themable.svelte.js'

describe('themable', () => {
	const theme = $state({
		style: 'rokkit',
		mode: 'dark',
		density: 'comfortable'
	})
	it('should apply default theme attributes', () => {
		const root = document.createElement('div')

		const cleanup = $effect.root(() => themable(root))
		flushSync()

		expect(root.dataset.style).toBe('rokkit')
		expect(root.dataset.mode).toBe('dark')
		expect(root.dataset.density).toBe('comfortable')

		cleanup()
	})

	it('should update attributes on change', () => {
		const root = document.createElement('div')
		const cleanup = $effect.root(() => themable(root, { theme }))
		flushSync()

		expect(root.dataset.style).toBe('rokkit')
		expect(root.dataset.mode).toBe('dark')
		expect(root.dataset.density).toBe('comfortable')

		theme.style = 'material'
		flushSync()
		expect(root.dataset.style).toBe('material')
		expect(root.dataset.mode).toBe('dark')
		expect(root.dataset.density).toBe('comfortable')

		theme.mode = 'light'
		flushSync()
		expect(root.dataset.style).toBe('material')
		expect(root.dataset.mode).toBe('light')
		expect(root.dataset.density).toBe('comfortable')

		theme.density = 'compact'
		flushSync()
		expect(root.dataset.style).toBe('material')
		expect(root.dataset.mode).toBe('light')
		expect(root.dataset.density).toBe('compact')

		cleanup()
	})
})
