/* The bundling maths. Pure, so asserted on exact geometry. */

import { describe, it, expect } from 'vitest'
import { bundlePath, commonDepth, relax, splinePath } from '../../src/layout/bundle.js'

describe('commonDepth', () => {
	it('finds where two paths stop agreeing', () => {
		expect(commonDepth(['a', 'b', 'c'], ['a', 'b', 'd'])).toBe(2)
	})

	it('is 0 for paths that share nothing', () => {
		expect(commonDepth(['a'], ['b'])).toBe(0)
	})

	it('stops at the shorter path', () => {
		// An ancestor and its descendant: the chain agrees for the whole of the shorter one.
		expect(commonDepth(['a', 'b'], ['a', 'b', 'c'])).toBe(2)
	})

	it('handles the root, which shares nothing with anything', () => {
		expect(commonDepth([], ['a'])).toBe(0)
	})
})

describe('relax', () => {
	const route = [
		{ x: 0, y: 0 },
		{ x: 5, y: 10 },
		{ x: 10, y: 0 }
	]

	it('keeps the full route through the tree at beta 1', () => {
		expect(relax(route, 1)).toEqual(route)
	})

	it('collapses onto the straight chord at beta 0', () => {
		// Which is why "Straight" is beta 0 rather than a second code path.
		expect(relax(route, 0)).toEqual([
			{ x: 0, y: 0 },
			{ x: 5, y: 0 },
			{ x: 10, y: 0 }
		])
	})

	it('never moves the endpoints, whatever the tension', () => {
		// An edge has to start and finish where its nodes are.
		for (const beta of [0, 0.3, 0.85, 1]) {
			const out = relax(route, beta)
			expect(out[0]).toEqual({ x: 0, y: 0 })
			expect(out[out.length - 1]).toEqual({ x: 10, y: 0 })
		}
	})

	it('pulls the middle part-way at a middling beta', () => {
		const [, middle] = relax(route, 0.5)

		expect(middle.y).toBeCloseTo(5, 5)
	})

	it('leaves a degenerate route alone', () => {
		expect(relax([{ x: 1, y: 2 }], 0.5)).toEqual([{ x: 1, y: 2 }])
		expect(relax([], 0.5)).toEqual([])
	})
})

describe('splinePath', () => {
	it('starts at the first point', () => {
		const d = splinePath([
			{ x: 0, y: 0 },
			{ x: 5, y: 10 },
			{ x: 10, y: 0 }
		])

		expect(d.startsWith('M 0 0')).toBe(true)
	})

	it('reaches the LAST point — a plain B-spline stops short of it', () => {
		const d = splinePath([
			{ x: 0, y: 0 },
			{ x: 5, y: 10 },
			{ x: 10, y: 0 }
		])

		expect(d.trimEnd().endsWith('10 0')).toBe(true)
	})

	it('draws a straight segment for two points rather than a curve', () => {
		expect(splinePath([{ x: 0, y: 0 }, { x: 4, y: 4 }])).toBe('M 0 0 L 4 4')
	})

	it('handles one point and none', () => {
		expect(splinePath([{ x: 3, y: 4 }])).toBe('M 3 4')
		expect(splinePath([])).toBe('')
	})

	it('is deterministic', () => {
		const pts = [
			{ x: 0, y: 0 },
			{ x: 5, y: 10 },
			{ x: 10, y: 0 }
		]

		expect(splinePath(pts)).toBe(splinePath(pts))
	})
})

describe('bundlePath', () => {
	it('is a straight line at beta 0, whatever the route', () => {
		const d = bundlePath(
			[
				{ x: 0, y: 0 },
				{ x: 5, y: 40 },
				{ x: 10, y: 0 }
			],
			0
		)

		// Every control point is on the chord, so the spline through them is that chord.
		expect(d).toContain('M 0 0')
		expect(d.trimEnd().endsWith('10 0')).toBe(true)
	})

	it('bows away from the chord at a high beta', () => {
		const straight = bundlePath(
			[
				{ x: 0, y: 0 },
				{ x: 5, y: 40 },
				{ x: 10, y: 0 }
			],
			0
		)
		const bundled = bundlePath(
			[
				{ x: 0, y: 0 },
				{ x: 5, y: 40 },
				{ x: 10, y: 0 }
			],
			0.85
		)

		expect(bundled).not.toBe(straight)
	})
})
