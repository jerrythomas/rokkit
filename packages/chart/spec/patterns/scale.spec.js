import { describe, it, expect } from 'vitest'
import { scaleMark, resolveMarkAttrs } from '../../src/patterns/scale.js'

const appearance = { fill: '#4a90d9', stroke: '#1a5fa0', thickness: 2 }

// ─── scaleMark ────────────────────────────────────────────────────────────────

describe('scaleMark — line', () => {
	it('scales all line coordinates by size', () => {
		const mark = { type: 'line', fill: false, x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8 }
		const result = scaleMark(mark, 20)
		expect(result.x1).toBeCloseTo(0.1 * 20)
		expect(result.y1).toBeCloseTo(0.2 * 20)
		expect(result.x2).toBeCloseTo(0.9 * 20)
		expect(result.y2).toBeCloseTo(0.8 * 20)
	})

	it('preserves mark type', () => {
		const mark = { type: 'line', fill: false, x1: 0, y1: 0, x2: 1, y2: 1 }
		expect(scaleMark(mark, 10).type).toBe('line')
	})
})

describe('scaleMark — circle', () => {
	it('scales cx, cy, and r by size', () => {
		const mark = { type: 'circle', fill: true, cx: 0.5, cy: 0.5, r: 0.25 }
		const result = scaleMark(mark, 40)
		expect(result.cx).toBeCloseTo(0.5 * 40)
		expect(result.cy).toBeCloseTo(0.5 * 40)
		expect(result.r).toBeCloseTo(0.25 * 40)
	})
})

describe('scaleMark — rect', () => {
	it('renames w/h to width/height and scales all coords', () => {
		const mark = { type: 'rect', fill: true, x: 0.1, y: 0.1, w: 0.8, h: 0.6 }
		const result = scaleMark(mark, 100)
		expect(result.width).toBeCloseTo(0.8 * 100)
		expect(result.height).toBeCloseTo(0.6 * 100)
		expect(result.x).toBeCloseTo(0.1 * 100)
		expect(result.y).toBeCloseTo(0.1 * 100)
		// Original w/h keys should be gone
		expect(result.w).toBeUndefined()
		expect(result.h).toBeUndefined()
	})
})

describe('scaleMark — polygon', () => {
	it('converts points array to SVG points string', () => {
		const mark = {
			type: 'polygon',
			fill: true,
			points: [
				[0.0, 0.5],
				[0.5, 0.0],
				[1.0, 0.5]
			]
		}
		const result = scaleMark(mark, 10)
		// Expect "0,5 5,0 10,5"
		expect(typeof result.points).toBe('string')
		expect(result.points).toBe('0,5 5,0 10,5')
	})

	it('handles a single-point polygon', () => {
		const mark = { type: 'polygon', fill: true, points: [[0.5, 0.5]] }
		const result = scaleMark(mark, 20)
		expect(result.points).toBe('10,10')
	})
})

describe('scaleMark — path', () => {
	it('converts a simple M-L path to SVG d string', () => {
		const mark = {
			type: 'path',
			fill: true,
			d: [
				['M', 0.1, 0.1],
				['L', 0.9, 0.9],
				['Z']
			]
		}
		const result = scaleMark(mark, 100)
		expect(typeof result.d).toBe('string')
		expect(result.d).toContain('M')
		expect(result.d).toContain('L')
		expect(result.d).toContain('Z')
		expect(result.d).toContain('10') // 0.1 * 100
		expect(result.d).toContain('90') // 0.9 * 100
	})

	it('scales arc (A) command coordinates but leaves flag indices unchanged', () => {
		// A cmd: [op, rx, ry, xRotation, largeArcFlag, sweepFlag, x, y]
		// indices 2,3,4 are NOT coordinates and must not be scaled
		const mark = {
			type: 'path',
			fill: true,
			d: [['A', 0.5, 0.5, 0, 1, 0, 0.8, 0.2]]
		}
		const result = scaleMark(mark, 100)
		// rx and ry are scaled: 0.5*100=50
		expect(result.d).toContain('50')
		// xRotation (0), largeArcFlag (1), sweepFlag (0) must survive as-is
		const parts = result.d.split(' ')
		expect(parts[1]).toBe('50') // rx scaled
		expect(parts[2]).toBe('50') // ry scaled
		expect(parts[3]).toBe('0')  // xRotation NOT scaled
		expect(parts[4]).toBe('1')  // largeArcFlag NOT scaled
		expect(parts[5]).toBe('0')  // sweepFlag NOT scaled
		expect(parts[6]).toBe('80') // x scaled: 0.8*100
		expect(parts[7]).toBe('20') // y scaled: 0.2*100
	})

	it('scales lowercase arc (a) command the same as uppercase', () => {
		const mark = {
			type: 'path',
			fill: true,
			d: [['a', 0.3, 0.4, 0, 0, 1, 0.6, 0.7]]
		}
		const result = scaleMark(mark, 10)
		const parts = result.d.split(' ')
		expect(parts[0]).toBe('a')
		expect(parts[1]).toBe('3')  // 0.3 * 10
		expect(parts[2]).toBe('4')  // 0.4 * 10
		expect(parts[3]).toBe('0')  // xRotation NOT scaled
		expect(parts[4]).toBe('0')  // largeArcFlag NOT scaled
		expect(parts[5]).toBe('1')  // sweepFlag NOT scaled
		expect(parts[6]).toBe('6')  // x
		expect(parts[7]).toBe('7')  // y
	})

	it('handles path with non-numeric string args (leaves them as-is)', () => {
		const mark = {
			type: 'path',
			fill: true,
			d: [['M', 0.5, 0.5], ['Z']]
		}
		// Z has no numeric args — should work without error
		const result = scaleMark(mark, 20)
		expect(result.d).toContain('Z')
	})
})

describe('scaleMark — default (unknown type)', () => {
	it('returns the mark unchanged for unknown types', () => {
		const mark = { type: 'unknown', fill: false, x: 0.5, y: 0.5 }
		const result = scaleMark(mark, 100)
		expect(result).toBe(mark)
	})
})

// ─── resolveMarkAttrs ────────────────────────────────────────────────────────

describe('resolveMarkAttrs — filled mark', () => {
	it('sets fill to appearance.fill and stroke to none', () => {
		const scaled = { type: 'circle', fill: true, cx: 10, cy: 10, r: 5 }
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs.fill).toBe(appearance.fill)
		expect(attrs.stroke).toBe('none')
		expect(attrs['stroke-width']).toBe(0)
	})
})

describe('resolveMarkAttrs — stroked mark', () => {
	it('sets stroke to appearance.stroke and fill to none', () => {
		const scaled = { type: 'line', fill: false, x1: 0, y1: 0, x2: 10, y2: 10 }
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs.fill).toBe('none')
		expect(attrs.stroke).toBe(appearance.stroke)
		expect(attrs['stroke-width']).toBe(appearance.thickness)
	})

	it('respects per-mark strokeWidth override', () => {
		const scaled = { type: 'line', fill: false, strokeWidth: 4, x1: 0, y1: 0, x2: 10, y2: 10 }
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs['stroke-width']).toBe(4)
	})
})

describe('resolveMarkAttrs — optional attrs', () => {
	it('includes fill-opacity when mark.fillOpacity is set', () => {
		const scaled = { type: 'circle', fill: true, cx: 5, cy: 5, r: 3, fillOpacity: 0.5 }
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs['fill-opacity']).toBe(0.5)
	})

	it('omits fill-opacity when mark.fillOpacity is undefined', () => {
		const scaled = { type: 'circle', fill: true, cx: 5, cy: 5, r: 3 }
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs['fill-opacity']).toBeUndefined()
	})

	it('includes opacity when mark.opacity is set', () => {
		const scaled = { type: 'circle', fill: true, cx: 5, cy: 5, r: 3, opacity: 0.8 }
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs.opacity).toBe(0.8)
	})

	it('omits opacity when mark.opacity is undefined', () => {
		const scaled = { type: 'circle', fill: true, cx: 5, cy: 5, r: 3 }
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs.opacity).toBeUndefined()
	})

	it('includes fill-rule when mark.fillRule is set', () => {
		const scaled = {
			type: 'path',
			fill: true,
			d: 'M 0 0 L 10 0 L 10 10 Z',
			fillRule: 'evenodd'
		}
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs['fill-rule']).toBe('evenodd')
	})

	it('omits fill-rule when mark.fillRule is undefined', () => {
		const scaled = { type: 'circle', fill: true, cx: 5, cy: 5, r: 3 }
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs['fill-rule']).toBeUndefined()
	})

	it('includes all three optional attrs when all are present', () => {
		const scaled = {
			type: 'path',
			fill: true,
			d: 'M 0 0 Z',
			fillOpacity: 0.6,
			opacity: 0.9,
			fillRule: 'nonzero'
		}
		const { attrs } = resolveMarkAttrs(scaled, appearance)
		expect(attrs['fill-opacity']).toBe(0.6)
		expect(attrs.opacity).toBe(0.9)
		expect(attrs['fill-rule']).toBe('nonzero')
	})
})

describe('resolveMarkAttrs — type returned', () => {
	it('returns the mark type on the result', () => {
		const scaled = { type: 'rect', fill: true, x: 0, y: 0, width: 10, height: 10 }
		const { type } = resolveMarkAttrs(scaled, appearance)
		expect(type).toBe('rect')
	})
})
