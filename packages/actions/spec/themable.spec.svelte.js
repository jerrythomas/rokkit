import { it, expect, describe, vi, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { themable } from '../src/themable.svelte.js'
import { vibe } from '@rokkit/states'

describe('themable', () => {
	const theme = $state({
		style: 'rokkit',
		mode: 'dark',
		density: 'comfortable'
	})

	describe('memory', () => {
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

	describe('persisted', () => {
		const data = {
			style: 'rokkit',
			mode: 'dark',
			density: 'comfortable'
		}
		const localStorageMock = {
			getItem: vi.fn().mockReturnValue(JSON.stringify(data)),
			setItem: vi.fn()
		}

		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
				writable: true
			})
		})
		afterEach(() => {
			vi.clearAllMocks()
		})

		it('should apply persisted theme attributes', () => {
			const root = document.createElement('div')

			const cleanup = $effect.root(() =>
				themable(root, { theme: vibe, storageKey: 'rokkit-theme' })
			)
			flushSync()
			expect(localStorageMock.getItem).toHaveBeenCalledWith('rokkit-theme')
			expect(root.dataset.style).toBe('rokkit')
			expect(root.dataset.mode).toBe('dark')
			expect(root.dataset.density).toBe('comfortable')

			cleanup()
		})

		it('should save persisted theme attributes', () => {
			const root = document.createElement('div')

			const cleanup = $effect.root(() =>
				themable(root, { theme: vibe, storageKey: 'rokkit-theme' })
			)
			expect(localStorageMock.setItem).not.toHaveBeenCalled()
			expect(localStorageMock.getItem).toHaveBeenCalled()

			vibe.style = 'material'
			flushSync()
			expect(root.dataset.style).toBe('material')
			expect(root.dataset.mode).toBe('dark')
			expect(root.dataset.density).toBe('comfortable')

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'rokkit-theme',
				JSON.stringify({
					style: 'material',
					mode: 'dark',
					density: 'comfortable'
				})
			)

			vibe.mode = 'light'
			flushSync()
			expect(root.dataset.style).toBe('material')
			expect(root.dataset.mode).toBe('light')
			expect(root.dataset.density).toBe('comfortable')

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'rokkit-theme',
				JSON.stringify({
					style: 'material',
					mode: 'light',
					density: 'comfortable'
				})
			)

			vibe.density = 'compact'
			flushSync()
			expect(root.dataset.style).toBe('material')
			expect(root.dataset.mode).toBe('light')
			expect(root.dataset.density).toBe('compact')

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'rokkit-theme',
				JSON.stringify({
					style: 'material',
					mode: 'light',
					density: 'compact'
				})
			)

			cleanup()
		})

		it('should handle storage events', () => {
			const root = document.createElement('div')
			const cleanup = $effect.root(() =>
				themable(root, { theme: vibe, storageKey: 'rokkit-theme' })
			)

			flushSync()
			expect(root.dataset.style).toBe('rokkit')
			expect(root.dataset.mode).toBe('dark')
			expect(root.dataset.density).toBe('comfortable')
			expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)

			const event = new Event('storage')
			event.key = 'rokkit-theme'
			event.newValue = JSON.stringify({
				style: 'material',
				mode: 'light',
				density: 'compact'
			})
			window.dispatchEvent(event)
			flushSync()
			expect(localStorageMock.setItem).toHaveBeenCalledTimes(2)

			cleanup()
		})
	})
})
