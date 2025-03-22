import { describe, it, expect, beforeEach } from 'vitest'
import {
	getClosestAncestorWithAttribute,
	getEventForKey,
	getKeyboardAction,
	getClickAction
} from '../src/utils.js'

describe('utils', () => {
	describe('getClosestAncestorWithAttribute', () => {
		it('should return null if element does not have the given attribute and is orphan', () => {
			const element = document.createElement('div')
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(null)
		})
		it('should return the element if it has the given attribute', () => {
			const element = document.createElement('div')
			element.setAttribute('data-test', 'test')
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(element)
		})
		it('should return the element if it has the given attribute and is nested', () => {
			const parent = document.createElement('div')
			const element = document.createElement('div')
			element.setAttribute('data-test', 'test')
			parent.appendChild(element)
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(element)
		})
		it('should return the closest ancestor if it has the given attribute', () => {
			const element = document.createElement('div')
			const parent = document.createElement('div')
			parent.setAttribute('data-test', 'test')
			parent.appendChild(element)
			expect(getClosestAncestorWithAttribute(element, 'data-test')).toBe(parent)
		})
	})

	describe('getEventForKey', () => {
		const keyMapping = {
			event1: ['a', 'b', 'c'],
			event2: /d/,
			event3: ['e', 'f'],
			event4: /g/
		}

		it('should return the correct event name for a key in an array', () => {
			expect(getEventForKey(keyMapping, 'a')).toBe('event1')
			expect(getEventForKey(keyMapping, 'f')).toBe('event3')
		})

		it('should return the correct event name for a key matching a regex', () => {
			expect(getEventForKey(keyMapping, 'd')).toBe('event2')
			expect(getEventForKey(keyMapping, 'g')).toBe('event4')
		})

		it('should return null for a key that does not match any event', () => {
			expect(getEventForKey(keyMapping, 'z')).toBeNull()
		})
	})

	describe('getKeyboardAction', () => {
		const options = {}

		beforeEach(() => {
			options.horizontal = true
			options.nested = false
		})

		describe('shared', () => {
			it('should return "select" for Enter key press', () => {
				const event = new KeyboardEvent('keydown', { key: 'Enter' })

				expect(getKeyboardAction(event, options)).toBe('select')
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('select')
				options.horizontal = true
				expect(getKeyboardAction(event, options)).toBe('select')
				options.nested = false
				expect(getKeyboardAction(event, options)).toBe('select')
			})

			it('should return "select" for Space key press', () => {
				const event = new KeyboardEvent('keydown', { key: ' ' })

				expect(getKeyboardAction(event, options)).toBe('select')
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('select')
				options.horizontal = true
				expect(getKeyboardAction(event, options)).toBe('select')
				options.nested = false
				expect(getKeyboardAction(event, options)).toBe('select')
			})

			it('should return "extend" when Space+Ctrl key is pressed', () => {
				const event = new KeyboardEvent('keydown', { key: ' ', ctrlKey: true })

				expect(getKeyboardAction(event, options)).toBe('extend')
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('extend')
				options.horizontal = true
				expect(getKeyboardAction(event, options)).toBe('extend')
				options.nested = false
				expect(getKeyboardAction(event, options)).toBe('extend')
			})
			it('should return "extend" when Space+Meta key is pressed', () => {
				const event = new KeyboardEvent('keydown', { key: ' ', metaKey: true })

				expect(getKeyboardAction(event, options)).toBe('extend')
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('extend')
				options.horizontal = true
				expect(getKeyboardAction(event, options)).toBe('extend')
				options.nested = false
				expect(getKeyboardAction(event, options)).toBe('extend')
			})

			it('should return null if key is not mapped', () => {
				let event = new KeyboardEvent('keydown', { key: 'x' })
				expect(getKeyboardAction(event, options)).toBeNull()
				event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true })
				expect(getKeyboardAction(event, options)).toBeNull()
				event = new KeyboardEvent('keydown', { key: 'x', metaKey: true })
				expect(getKeyboardAction(event, options)).toBeNull()

				options.nested = true
				expect(getKeyboardAction(event, options)).toBeNull()
				event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true })
				expect(getKeyboardAction(event, options)).toBeNull()
				event = new KeyboardEvent('keydown', { key: 'x', metaKey: true })
				expect(getKeyboardAction(event, options)).toBeNull()
			})
		})
		describe('vertical', () => {
			beforeEach(() => {
				options.horizontal = false
				options.nested = false
			})

			it('should return null if key is not mapped', () => {
				let event = new KeyboardEvent('keydown', { key: 'x' })
				expect(getKeyboardAction(event, options)).toBeNull()
				event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true })
				expect(getKeyboardAction(event, options)).toBeNull()
				event = new KeyboardEvent('keydown', { key: 'x', metaKey: true })
				expect(getKeyboardAction(event, options)).toBeNull()

				options.nested = true
				expect(getKeyboardAction(event, options)).toBeNull()
				event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true })
				expect(getKeyboardAction(event, options)).toBeNull()
				event = new KeyboardEvent('keydown', { key: 'x', metaKey: true })
				expect(getKeyboardAction(event, options)).toBeNull()
			})
			it('should return "previous" for ArrowUp key in vertical mode', () => {
				const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })

				expect(getKeyboardAction(event, options)).toBe('previous')
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('previous')
			})

			it('should return "next" for ArrowDown key in vertical mode', () => {
				const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

				const options = { horizontal: false, nested: false }
				expect(getKeyboardAction(event, options)).toBe('next')
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('next')
			})

			it('should return "collapse" for ArrowLeft key in vertical nested mode', () => {
				const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })

				expect(getKeyboardAction(event, options)).toBeNull()
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('collapse')
			})

			it('should return "expand" for ArrowRight key in vertical nested mode', () => {
				const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })

				expect(getKeyboardAction(event, options)).toBeNull()
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('expand')
			})
		})

		describe('horizontal', () => {
			beforeEach(() => {
				options.horizontal = true
				options.nested = false
			})
			it('should return "previous" for ArrowLeft key in horizontal mode', () => {
				const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })

				expect(getKeyboardAction(event, options)).toBe('previous')
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('previous')
			})

			it('should return "next" for ArrowRight key in horizontal mode', () => {
				const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })

				expect(getKeyboardAction(event, options)).toBe('next')
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('next')
			})
			it('should return "collapse" for ArrowUp key in horizontal nested mode', () => {
				const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })

				expect(getKeyboardAction(event, options)).toBeNull()
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('collapse')
			})

			it('should return "expand" for ArrowDown key in horizontal nested mode', () => {
				const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

				expect(getKeyboardAction(event, options)).toBeNull()
				options.nested = true
				expect(getKeyboardAction(event, options)).toBe('expand')
			})
		})
	})

	describe('getClickAction', () => {
		it('should return "extend" when Ctrl key is pressed', () => {
			const event = new MouseEvent('click', { ctrlKey: true })
			expect(getClickAction(event)).toBe('extend')
		})

		it('should return "extend" when Meta key is pressed', () => {
			const event = new MouseEvent('click', { metaKey: true })
			expect(getClickAction(event)).toBe('extend')
		})

		// it('should return "toggle" when clicked on a collapsed icon', () => {
		// 	const mockTarget = document.createElement('div')
		// 	mockTarget.setAttribute('data-tag', 'icon')
		// 	mockTarget.setAttribute('data-state', 'collapsed')

		// 	const event = new MouseEvent('click')
		// 	// Mock target property since we can't set it directly on the event
		// 	Object.defineProperty(event, 'target', {
		// 		get: () => mockTarget
		// 	})

		// 	expect(getClickAction(event)).toBe('toggle')
		// })

		// it('should return "toggle" when clicked on an expanded icon', () => {
		// 	const mockTarget = document.createElement('div')
		// 	mockTarget.setAttribute('data-tag', 'icon')
		// 	mockTarget.setAttribute('data-state', 'expanded')

		// 	const event = new MouseEvent('click')
		// 	Object.defineProperty(event, 'target', {
		// 		get: () => mockTarget
		// 	})

		// 	expect(getClickAction(event)).toBe('toggle')
		// })

		it('should return "select" when clicked on a regular element', () => {
			const mockTarget = document.createElement('div')

			const event = new MouseEvent('click')
			Object.defineProperty(event, 'target', {
				get: () => mockTarget
			})

			expect(getClickAction(event)).toBe('select')
		})
	})
})
