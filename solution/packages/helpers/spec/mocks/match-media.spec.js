import { describe, it, expect } from 'vitest'
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
})
