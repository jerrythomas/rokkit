import { describe, it, expect } from 'vitest'
import '../../src/mocks/animate'

describe('animate', () => {
	it('should mock global.Element.prototype.animate', () => {
		// Verify the mock is attached
		expect(typeof global.Element.prototype.animate).toBe('function')

		// Create an element and call animate
		const el = document.createElement('div')
		const animation = el.animate([{ opacity: 0 }, { opacity: 1 }], 1000)

		// Check that animate was called
		expect(global.Element.prototype.animate).toHaveBeenCalledTimes(1)

		// animation should be the mock return object
		expect(animation).toHaveProperty('play')
		expect(animation.play).toBeInstanceOf(Function)

		// Optional: you could further exercise the mock
		animation.play()
		expect(animation.play).toHaveBeenCalledTimes(1)
	})
})
