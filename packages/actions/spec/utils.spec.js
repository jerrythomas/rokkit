import { describe, it, expect, beforeEach } from 'vitest'
import { getClosestAncestorWithAttribute, getEventForKey, getClickAction } from '../src/utils.js'

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

	// Keyboard tests moved to kbd.spec.js

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
