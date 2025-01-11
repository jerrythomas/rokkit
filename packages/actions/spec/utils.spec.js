import { describe, it, expect } from 'vitest'
import { getClosestAncestorWithAttribute, getEventForKey } from '../src/utils.js'

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
})
