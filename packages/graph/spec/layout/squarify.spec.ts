/* The packing itself, where the state tests assert the picture.
 *
 * Squarified rather than slice-and-dice because a sliver holds no label, and a box you cannot
 * read is a box you cannot decide to click. */

import { describe, it, expect } from 'vitest'
import { squarify } from '../../src/layout/squarify.js'

const rect = { x: 0, y: 0, w: 400, h: 300 }

describe('squarify', () => {
	it('gives each item area in proportion to its value', () => {
		const out = squarify([{ value: 75 }, { value: 25 }], rect)
		const area = (i: number) => out[i].rect.w * out[i].rect.h

		expect(area(0) / area(1)).toBeCloseTo(3, 1)
	})

	it('fills the rectangle it was given', () => {
		const out = squarify([{ value: 5 }, { value: 3 }, { value: 2 }], rect)
		const used = out.reduce((total, p) => total + p.rect.w * p.rect.h, 0)

		expect(used).toBeCloseTo(rect.w * rect.h, 0)
	})

	it('keeps boxes near-square rather than slivers', () => {
		// The whole reason for the algorithm. Slice-and-dice on this spread gives a box under
		// two pixels wide.
		const out = squarify([{ value: 100 }, { value: 1 }, { value: 1 }, { value: 1 }], rect)

		for (const p of out) {
			const aspect = p.rect.w / p.rect.h
			expect(aspect).toBeGreaterThan(0.04)
			expect(aspect).toBeLessThan(25)
		}
	})

	it('floors a value at the minimum, so nothing is invisible', () => {
		const out = squarify([{ value: 100 }, { value: 0 }], rect, 5)

		expect(out[1].rect.w * out[1].rect.h).toBeGreaterThan(0)
	})

	it('splits evenly when every value is zero', () => {
		// Proportion means nothing here; equal shares at least stay clickable.
		const out = squarify([{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }], rect)
		const areas = out.map((p) => p.rect.w * p.rect.h)

		expect(new Set(areas.map((a) => Math.round(a)))).toHaveProperty('size', 1)
	})

	it('returns nothing for an empty list', () => {
		expect(squarify([], rect)).toEqual([])
	})

	it('returns nothing for a rectangle with no area', () => {
		expect(squarify([{ value: 1 }], { x: 0, y: 0, w: 0, h: 100 })).toEqual([])
		expect(squarify([{ value: 1 }], { x: 0, y: 0, w: 100, h: 0 })).toEqual([])
	})

	it('is deterministic', () => {
		const items = [{ value: 9 }, { value: 4 }, { value: 7 }]

		expect(squarify(items, rect)).toEqual(squarify(items, rect))
	})
})
