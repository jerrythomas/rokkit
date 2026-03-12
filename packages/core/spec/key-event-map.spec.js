import { describe, it, expect } from 'vitest'
import { KeyEventMap } from '../src/key-event-map'

describe('KeyEventMap', () => {
	it('should add a new key mapping and find the event for a given key', () => {
		const keyEventMap = new KeyEventMap()
		keyEventMap.add('event1', ['a', 'b', 'c'])
		keyEventMap.add('event2', /^d|e$/i)

		expect(keyEventMap.getEventForKey('a')).toBe('event1')
		expect(keyEventMap.getEventForKey('d')).toBe('event2')
		expect(keyEventMap.getEventForKey('E')).toBe('event2')
		expect(keyEventMap.getEventForKey('z')).toBe(null)
	})

	it('should throw an error if an invalid keymap is provided', () => {
		const keyEventMap = new KeyEventMap()
		expect(() => keyEventMap.add('event1', 'a')).toThrow(
			'Keys must be an array or a regular expression'
		)
	})

	it('should return null if no matching event is found', () => {
		const keyEventMap = new KeyEventMap()
		keyEventMap.add('event1', ['a', 'b', 'c'])

		expect(keyEventMap.getEventForKey('z')).toBe(null)
	})

	it('should handle multiple mappings correctly', () => {
		const keyEventMap = new KeyEventMap()
		keyEventMap.add('event1', ['a', 'b', 'c'])
		keyEventMap.add('event2', ['d', 'e', 'f'])
		keyEventMap.add('event3', /^g$/)

		expect(keyEventMap.getEventForKey('a')).toBe('event1')
		expect(keyEventMap.getEventForKey('d')).toBe('event2')
		expect(keyEventMap.getEventForKey('g')).toBe('event3')
		expect(keyEventMap.getEventForKey('z')).toBe(null)
	})
})
