import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { theme } from '../stores/theme'
import { themable } from './themeable'

describe('themable', () => {
	let node, action
	beforeEach(() => {
		node = {
			style: {
				setProperty: vi.fn()
			},
			classList: {
				remove: vi.fn(),
				add: vi.fn()
			}
		}
	})
	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should set safe-area-height variable on node', () => {
		let node = document.createElement('body')
		theme.set({ name: 'test', mode: 'light' })
		expect(node.style.getPropertyValue('--viewport-height')).toEqual('')
		themable(node)
		expect(node.style.getPropertyValue('--viewport-height')).toEqual(
			window.innerHeight.toString() + 'px'
		)
		// expect(node.classList.add).toHaveBeenCalledWith('test')
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
