import { describe, it, expect, vi } from 'vitest'
import { ThemeStore } from '../src/theme'

describe('ThemeStore', () => {
	global.console = {
		error: vi.fn()
	}

	it('should set the store with valid input', () => {
		const themeStore = ThemeStore()
		let currentValue = null
		themeStore.set({ name: 'test', mode: 'light' })
		themeStore.subscribe((val) => (currentValue = val))
		expect(currentValue).toEqual({ name: 'test', mode: 'light' })
	})

	it('should throw an error if input is not valid', () => {
		const themeStore = ThemeStore()
		themeStore.set({ name: 'test', mode: 123 })
		expect(console.error).toHaveBeenCalled()
		expect(console.error).toHaveBeenCalledWith('Both "name" and "mode" must be strings', {
			name: 'test',
			mode: 123
		})
		themeStore.set({ name: 123, mode: 'test' })
		expect(console.error).toHaveBeenCalledWith('Both "name" and "mode" must be strings', {
			name: 123,
			mode: 'test'
		})
	})
})
