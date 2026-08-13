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
})
