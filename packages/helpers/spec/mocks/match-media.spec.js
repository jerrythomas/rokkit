import { describe, it, expect, vi } from 'vitest'
import { matchMediaMock, updateMedia } from '../../src/mocks/match-media'

describe('match-media', () => {
	describe('matchMediaMock', () => {
		it('should return a mock media query', () => {
			const query = matchMediaMock('(min-width: 100px)')
			expect(query.media).toBe('(min-width: 100px)')
			expect(query.matches).toBe(true)
			expect(query.addListener).toEqual(expect.any(Function))
			expect(query.removeListener).toEqual(expect.any(Function))
		})
	})

	describe('updateMedia', () => {
		it('should mock min-width media query', () => {
			const query = matchMediaMock('(min-width: 100px)')

			window.innerWidth = 50
			updateMedia()
			expect(query.matches).toBe(false)

			window.innerWidth = 200
			updateMedia()
			expect(query.matches).toBe(true)
		})

		it('should mock max-width media query', () => {
			const query = matchMediaMock('(max-width: 100px)')

			window.innerWidth = 500
			updateMedia()
			expect(query.matches).toBe(false)

			window.innerWidth = 100
			updateMedia()
			expect(query.matches).toBe(true)
		})

		it('should mock the media queries', () => {
			const query = matchMediaMock('(min-width: 100px) and (max-width: 200px)')

			window.innerWidth = 50
			updateMedia()
			expect(query.matches).toBe(false)

			window.innerWidth = 500
			updateMedia()
			expect(query.matches).toBe(false)

			window.innerWidth = 150
			updateMedia()
			expect(query.matches).toBe(true)
		})

		it('should mock multiple media queries', () => {
			const query1 = matchMediaMock('(min-width: 100px)')
			const query2 = matchMediaMock('(max-width: 100px)')

			window.innerWidth = 50
			updateMedia()
			expect(query1.matches).toBe(false)
			expect(query2.matches).toBe(true)

			window.innerWidth = 500
			updateMedia()
			expect(query1.matches).toBe(true)
			expect(query2.matches).toBe(false)

			// should remove the listener
			query1.removeListener()
			query2.removeListener()
		})
	})

	// The registry is the half of this mock that components actually depend on —
	// anything using MediaQuery/matchMedia subscribes rather than polling `matches`.
	// Nothing registered a listener before, so the four registration bodies and the
	// dispatch loop in updateMedia were never executed.
	describe('listener registry', () => {
		it('invokes a listener registered via addListener on update', () => {
			const query = matchMediaMock('(min-width: 100px)')
			const listener = vi.fn()
			query.addListener(listener)

			window.innerWidth = 500
			updateMedia()

			expect(listener).toHaveBeenCalled()
			query.removeListener(listener)
		})

		it('invokes a listener registered via addEventListener on update', () => {
			const query = matchMediaMock('(min-width: 100px)')
			const listener = vi.fn()
			query.addEventListener('change', listener)

			window.innerWidth = 500
			updateMedia()

			expect(listener).toHaveBeenCalled()
			query.removeEventListener('change', listener)
		})

		it('stops invoking a listener once removeEventListener has run', () => {
			const query = matchMediaMock('(min-width: 100px)')
			const listener = vi.fn()
			query.addEventListener('change', listener)

			window.innerWidth = 500
			updateMedia()
			const whileRegistered = listener.mock.calls.length
			expect(whileRegistered).toBeGreaterThan(0)

			query.removeEventListener('change', listener)
			updateMedia()

			expect(listener).toHaveBeenCalledTimes(whileRegistered)
		})

		it('stops invoking a listener once removeListener has run', () => {
			const query = matchMediaMock('(min-width: 100px)')
			const listener = vi.fn()
			query.addListener(listener)

			window.innerWidth = 500
			updateMedia()
			const whileRegistered = listener.mock.calls.length
			expect(whileRegistered).toBeGreaterThan(0)

			query.removeListener(listener)
			updateMedia()

			expect(listener).toHaveBeenCalledTimes(whileRegistered)
		})
	})
})
