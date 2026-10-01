/* What each zoom control means, as a pure step — the control and the canvas both use it. */
import { describe, it, expect } from 'vitest'
import { nextZoom, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../../src/controls/zoom.js'

describe('nextZoom', () => {
	it('steps in and out by one notch, and resets to fit', () => {
		expect(nextZoom(1, 'in')).toBe(ZOOM_STEP)
		expect(nextZoom(1, 'out')).toBe(1 / ZOOM_STEP)
		expect(nextZoom(2.5, 'reset')).toBe(1)
	})

	it('stays inside the range at either end', () => {
		expect(nextZoom(ZOOM_MAX, 'in')).toBe(ZOOM_MAX)
		expect(nextZoom(ZOOM_MIN, 'out')).toBe(ZOOM_MIN)
	})
})
