import { describe, expect, it, beforeEach, vi } from 'vitest'
import { theme } from '../stores/theme'
import { themable } from './themeable'

describe('themable', () => {
	let node
	beforeEach(() => {
		node = {
			classList: {
				remove: vi.fn(),
				add: vi.fn()
			}
		}
	})

	it('should add the new theme name class to the node', () => {
		theme.set({ name: 'test', mode: 'light' })
		themable(node)
		expect(node.classList.add).toHaveBeenCalledWith('test')
	})

	it('should remove the previous theme name class from the node', () => {
		theme.set({ name: 'test', mode: 'light' })
		themable(node)
		theme.set({ name: 'newtest', mode: 'light' })
		expect(node.classList.remove).toHaveBeenCalledWith('test')
	})

	it('should add the new theme mode class to the node', () => {
		theme.set({ name: 'test', mode: 'light' })
		themable(node)
		expect(node.classList.add).toHaveBeenCalledWith('light')
	})

	it('should remove the previous theme mode class from the node', () => {
		theme.set({ name: 'test', mode: 'light' })
		themable(node)
		theme.set({ name: 'test', mode: 'dark' })
		expect(node.classList.remove).toHaveBeenCalledWith('light')
	})
})