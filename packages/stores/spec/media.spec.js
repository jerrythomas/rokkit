import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'
import { calculate, watchMedia } from '../src/media'
import { get } from 'svelte/store'
import { matchMediaMock, updateMedia } from 'validators/mocks'

describe('media', () => {
	describe('calculate', () => {
		it('should calculate media queries correctly', () => {
			const queries = {
				small: { matches: true },
				medium: { matches: false },
				large: { matches: true }
			}

			const media = calculate(queries)

			expect(media.small).toBe(true)
			expect(media.medium).toBe(false)
			expect(media.large).toBe(true)
			expect(media.classNames).toBe('media-small media-large')
		})

		it('should handle empty queries', () => {
			const queries = {}

			const media = calculate(queries)

			expect(media).toEqual({ classNames: '' })
		})

		it('should handle queries with no matches', () => {
			const queries = {
				small: { matches: false },
				medium: { matches: false },
				large: { matches: false }
			}

			const media = calculate(queries)

			expect(media.small).toBe(false)
			expect(media.medium).toBe(false)
			expect(media.large).toBe(false)
			expect(media.classNames).toBe('')
		})

		it('should handle queries with all matches', () => {
			const queries = {
				small: { matches: true },
				medium: { matches: true },
				large: { matches: true }
			}

			const media = calculate(queries)

			expect(media.small).toBe(true)
			expect(media.medium).toBe(true)
			expect(media.large).toBe(true)
			expect(media.classNames).toBe('media-small media-medium media-large')
		})
	})

	describe('mediaChangeWatcher', () => {
		beforeEach(() => {
			window.matchMedia = matchMediaMock
		})

		afterEach(() => {
			vi.clearAllMocks()
		})

		it('should subscribe to media queries and update on changes', () => {
			const breakpoints = {
				small: '(max-width: 767px)',
				medium: '(min-width: 768px) and (max-width: 1023px)',
				large: '(min-width: 1024px)'
			}
			window.innerWidth = 1000
			const media = watchMedia(breakpoints)
			expect(window.matchMedia).toHaveBeenCalledTimes(3)
			const mediaQueryList = [
				window.matchMedia.mock.results[0].value,
				window.matchMedia.mock.results[1].value,
				window.matchMedia.mock.results[2].value
			]

			expect(get(media)).toEqual({
				classNames: 'media-medium',
				small: false,
				medium: true,
				large: false
			})
			window.innerWidth = 500
			updateMedia()
			expect(get(media)).toEqual({
				classNames: 'media-small',
				small: true,
				medium: false,
				large: false
			})

			media.destroy()
			expect(mediaQueryList[0].removeListener).toHaveBeenCalled()
			expect(mediaQueryList[1].removeListener).toHaveBeenCalled()
			expect(mediaQueryList[2].removeListener).toHaveBeenCalled()
		})

		it('should handle empty breakpoints', () => {
			const breakpoints = {}

			const { subscribe } = watchMedia(breakpoints)

			const callback = vi.fn()
			const unsubscribe = subscribe(callback)

			expect(callback).toHaveBeenCalledWith({ classNames: '' })
			expect(window.matchMedia).not.toHaveBeenCalled()

			unsubscribe()
		})
	})
})
