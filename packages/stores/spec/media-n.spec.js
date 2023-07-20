import { describe, it, expect } from 'vitest'
import { watchMedia } from '../src/media'
import { get } from 'svelte/store'

/**
 * @vitest-environment node
 */
describe('media', () => {
	describe('mediaChangeWatcher', () => {
		it('should work in non-browser environments', () => {
			const breakpoints = {
				small: '(max-width: 767px)',
				medium: '(min-width: 768px) and (max-width: 1023px)',
				large: '(min-width: 1024px)'
			}

			const media = watchMedia(breakpoints)

			expect(get(media)).toEqual({
				classNames: ''
			})
		})
	})
})
