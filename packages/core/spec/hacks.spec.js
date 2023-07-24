import { describe, it, expect, vi } from 'vitest'
import { adjustViewport } from '../src/hacks'

describe('hacks', () => {
	describe('adjustViewport', () => {
		it('should set the viewport height to 100vh', () => {
			adjustViewport(true, true)
			expect(document.body.style.getPropertyValue('--viewport-height')).toBe(
				'100vh'
			)
			adjustViewport(true, false)
			expect(document.body.style.getPropertyValue('--viewport-height')).toBe(
				'100vh'
			)
		})
		it('should set the viewport height to window.innerHeight + "px"', () => {
			window.innerHeight = 100
			adjustViewport(true, true)
			expect(document.body.style.getPropertyValue('--viewport-height')).toBe(
				window.innerHeight + 'px'
			)
		})
		it('should not call setProperty', () => {
			document.body.style.setProperty = vi.fn()
			adjustViewport(false, true)
			expect(document.body.style.setProperty).not.toHaveBeenCalled()
		})
	})
})
