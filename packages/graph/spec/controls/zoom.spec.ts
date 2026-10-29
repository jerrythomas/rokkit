/* What each zoom control means, as a pure step — the control and the canvas both use it. */
import { describe, it, expect } from 'vitest'
import { nextZoom, wheelFactor, zoomBy, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../../src/controls/zoom.js'

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

/* A trackpad pinch sends dozens of small wheel events; treating each as a full notch made a
 * gentle pinch leap several steps (sensei, 2026-10-28). Each event zooms in proportion to how
 * far it moved, and no single event moves further than one notch. */
describe('wheelFactor', () => {
	it('zooms a small pinch event a little, in for up and out for down', () => {
		const pinchIn = wheelFactor(-3)
		expect(pinchIn).toBeGreaterThan(1)
		expect(pinchIn).toBeLessThan(1.05)
		expect(wheelFactor(3)).toBeCloseTo(1 / pinchIn)
	})

	it('caps one event at a notch, so a mouse wheel steps as the buttons do', () => {
		expect(wheelFactor(-120)).toBe(ZOOM_STEP)
		expect(wheelFactor(120)).toBe(1 / ZOOM_STEP)
	})

	it('reads lines and pages as pixels', () => {
		expect(wheelFactor(-1, 1)).toBeCloseTo(wheelFactor(-16, 0))
		expect(wheelFactor(1, 2)).toBe(1 / ZOOM_STEP)
	})
})

describe('zoomBy', () => {
	it('applies a factor inside the range', () => {
		expect(zoomBy(1, 1.1)).toBeCloseTo(1.1)
		expect(zoomBy(ZOOM_MAX, 1.1)).toBe(ZOOM_MAX)
		expect(zoomBy(ZOOM_MIN, 0.9)).toBe(ZOOM_MIN)
	})
})
