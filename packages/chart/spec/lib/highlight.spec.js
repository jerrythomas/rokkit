import { describe, it, expect } from 'vitest'
import { resolveHighlight } from '../../src/lib/highlight.js'

const rows = [
	{ d: 0, v: 5 },
	{ d: 1, v: 9 },
	{ d: 2, v: 3 },
	{ d: 3, v: 7 }
]

describe('resolveHighlight', () => {
	it("'first' → index 0, 'last' → last index", () => {
		expect(resolveHighlight(rows, 'first', { y: 'v' })).toEqual([0])
		expect(resolveHighlight(rows, 'last', { y: 'v' })).toEqual([3])
	})
	it("'min'/'max' use the y field", () => {
		expect(resolveHighlight(rows, 'min', { y: 'v' })).toEqual([2])
		expect(resolveHighlight(rows, 'max', { y: 'v' })).toEqual([1])
	})
	it('numeric index, incl. negative from the end', () => {
		expect(resolveHighlight(rows, 2, { y: 'v' })).toEqual([2])
		expect(resolveHighlight(rows, -1, { y: 'v' })).toEqual([3])
		expect(resolveHighlight(rows, 99, { y: 'v' })).toEqual([])
	})
	it('predicate matches every row', () => {
		expect(resolveHighlight(rows, (r) => r.v > 4, { y: 'v' })).toEqual([0, 1, 3])
	})
	it('guards: empty/nullish/unknown → []', () => {
		expect(resolveHighlight([], 'last', { y: 'v' })).toEqual([])
		expect(resolveHighlight(rows, null, { y: 'v' })).toEqual([])
		expect(resolveHighlight(rows, 'min')).toEqual([]) // no y field
		expect(resolveHighlight(rows, 'bogus', { y: 'v' })).toEqual([])
	})
	it('min/max skip NaN values and handle all-NaN case', () => {
		const rowsWithNaN = [
			{ d: 0, v: 'not-a-number' },
			{ d: 1, v: 9 },
			{ d: 2, v: undefined },
			{ d: 3, v: 7 }
		]
		expect(resolveHighlight(rowsWithNaN, 'min', { y: 'v' })).toEqual([3]) // v=7 is min of valid
		expect(resolveHighlight(rowsWithNaN, 'max', { y: 'v' })).toEqual([1]) // v=9 is max of valid

		// All NaN case
		const allNaN = [{ v: 'a' }, { v: 'b' }, { v: undefined }]
		expect(resolveHighlight(allNaN, 'min', { y: 'v' })).toEqual([])
		expect(resolveHighlight(allNaN, 'max', { y: 'v' })).toEqual([])
	})

	// The cases below pin behaviour that the branchy original expressed only
	// implicitly. They were added before decomposing it so the refactor could be
	// shown to preserve semantics rather than asserted to.
	it('min/max keep the FIRST index on a tie', () => {
		const tied = [{ v: 3 }, { v: 9 }, { v: 3 }, { v: 9 }]
		expect(resolveHighlight(tied, 'min', { y: 'v' })).toEqual([0])
		expect(resolveHighlight(tied, 'max', { y: 'v' })).toEqual([1])
	})

	it('min/max still pick a row when every value is Infinity', () => {
		// Infinity is not NaN, so it is a legitimate candidate: a strict-improvement
		// search must not reject the first one and fall through to [].
		const inf = [{ v: Infinity }, { v: Infinity }]
		expect(resolveHighlight(inf, 'min', { y: 'v' })).toEqual([0])
		expect(resolveHighlight(inf, 'max', { y: 'v' })).toEqual([0])
		const negInf = [{ v: -Infinity }, { v: -Infinity }]
		expect(resolveHighlight(negInf, 'min', { y: 'v' })).toEqual([0])
		expect(resolveHighlight(negInf, 'max', { y: 'v' })).toEqual([0])
	})

	it('undefined selector and a non-array rows argument → []', () => {
		expect(resolveHighlight(rows, undefined, { y: 'v' })).toEqual([])
		expect(resolveHighlight(null, 'first')).toEqual([])
		expect(resolveHighlight('nope', 'first')).toEqual([])
	})

	it('index 0 and the most-negative in-range index resolve', () => {
		expect(resolveHighlight(rows, 0)).toEqual([0])
		expect(resolveHighlight(rows, -4)).toEqual([0])
		expect(resolveHighlight(rows, -5)).toEqual([])
	})

	it('a predicate matching nothing → []', () => {
		expect(resolveHighlight(rows, () => false)).toEqual([])
	})

	it("opts is optional for selectors that don't need y", () => {
		expect(resolveHighlight(rows, 'first')).toEqual([0])
		expect(resolveHighlight(rows, 'last')).toEqual([3])
	})
})
