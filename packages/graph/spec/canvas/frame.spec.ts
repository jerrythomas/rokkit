/* #171 — the canvas's frame: how the drawing is scaled and placed, how far the paper scrolls,
 * and where to scroll so a zoom keeps the reader's point in place. Pure, so every acceptance
 * figure is checked without a browser; the e2e proves the browser agrees.
 */
import { describe, it, expect } from 'vitest'
import { anchoredScroll, frameOf } from '../../src/canvas/frame.js'

const PAD = 28
const viewport = { vw: 1168, vh: 700 }
const content = { w: 1352, h: 600 }

describe('frameOf', () => {
	it('fits the drawing inside the padding at zoom 1', () => {
		const f = frameOf({ ...viewport, content, zoom: 1, pad: PAD })
		expect(f.scale).toBeCloseTo((viewport.vw - 2 * PAD) / content.w)
		expect(content.w * f.scale + 2 * PAD).toBeCloseTo(viewport.vw)
	})

	it('at fit, scrolls nowhere: the extent IS the viewport', () => {
		const f = frameOf({ ...viewport, content, zoom: 1, pad: PAD })
		expect(f.extent).toEqual({ w: viewport.vw, h: viewport.vh })
	})

	it('keeps a drawing smaller than the viewport centred, with no scroll', () => {
		const small = { w: 200, h: 100 }
		const f = frameOf({ ...viewport, content: small, zoom: 1, pad: PAD })
		expect(f.scale).toBe(1)
		expect(f.tx).toBe((viewport.vw - 200) / 2)
		expect(f.ty).toBe((viewport.vh - 100) / 2)
		expect(f.extent).toEqual({ w: viewport.vw, h: viewport.vh })
	})

	it('past fit, scrolls exactly the scaled drawing plus the padding on all four sides', () => {
		const f = frameOf({ ...viewport, content, zoom: 1.95, pad: PAD })
		const drawn = { w: content.w * f.scale, h: content.h * f.scale }
		expect(f.tx).toBe(PAD)
		expect(f.extent.w).toBeCloseTo(drawn.w + 2 * PAD)
		// Fully scrolled right, the drawing's right edge sits PAD inside the viewport's.
		const maxScroll = f.extent.w - viewport.vw
		expect(f.tx + drawn.w - maxScroll).toBeCloseTo(viewport.vw - PAD)
	})

	it('pads only the axis that overflows — a wide drawing stays centred vertically', () => {
		const wide = { w: 3000, h: 100 }
		const f = frameOf({ ...viewport, content: wide, zoom: 4, pad: PAD })
		expect(f.extent.h).toBeGreaterThanOrEqual(viewport.vh)
		expect(f.ty).toBeGreaterThanOrEqual(PAD)
	})

	it('never scales below its floor, however large the drawing', () => {
		const f = frameOf({ ...viewport, content: { w: 1e6, h: 1e6 }, zoom: 1, pad: PAD })
		expect(f.scale).toBe(0.08)
	})

	it('draws an empty canvas 1:1 rather than scaling by infinity', () => {
		const f = frameOf({ ...viewport, content: { w: 0, h: 0 }, zoom: 1, pad: PAD })
		expect(f.scale).toBe(1)
		expect(f.extent).toEqual({ w: viewport.vw, h: viewport.vh })
	})

	it('falls back to half scale when the content size is not a number', () => {
		expect(frameOf({ ...viewport, content: { w: Number.NaN, h: Number.NaN }, zoom: 1, pad: PAD }).scale).toBe(0.5)
	})
})

describe('anchoredScroll', () => {
	it('keeps the content point under the anchor where it was', () => {
		const before = frameOf({ ...viewport, content, zoom: 2, pad: PAD })
		const after = frameOf({ ...viewport, content, zoom: 2.5, pad: PAD })
		const scroll = { left: 400, top: 120 }
		const anchor = { x: 300, y: 200 }
		const next = anchoredScroll({ before, after, scroll, anchor })
		// The content coordinate under the anchor, before and after.
		const under = (f: typeof before, s: { left: number; top: number }) => ({
			x: (s.left + anchor.x - f.tx) / f.scale,
			y: (s.top + anchor.y - f.ty) / f.scale
		})
		expect(under(after, next).x).toBeCloseTo(under(before, scroll).x)
		expect(under(after, next).y).toBeCloseTo(under(before, scroll).y)
	})

	it('never asks for a negative scroll', () => {
		const before = frameOf({ ...viewport, content, zoom: 1.5, pad: PAD })
		const after = frameOf({ ...viewport, content, zoom: 1, pad: PAD })
		const next = anchoredScroll({ before, after, scroll: { left: 0, top: 0 }, anchor: { x: 0, y: 0 } })
		expect(next.left).toBeGreaterThanOrEqual(0)
		expect(next.top).toBeGreaterThanOrEqual(0)
	})
})
