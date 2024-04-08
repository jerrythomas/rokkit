import { describe, expect, it } from 'vitest'
import { fromArray } from '../src/convert'

describe('convert', () => {
	it('should return an empty object for an empty input array', () => {
		const input = []
		const expectedOutput = { data: {}, columns: [], types: {} }
		const result = fromArray(input)
		expect(result.columns).toEqual(expectedOutput.columns)
		expect(result.data).toEqual(expectedOutput.data)
		expect(result.types).toEqual(expectedOutput.types)
	})

	it('should return an object with the same keys for an input array with objects that have the same keys', () => {
		const input = [
			{ a: 1, b: 2 },
			{ a: 3, b: 4 },
			{ a: 5, b: 6 }
		]
		const expectedOutput = {
			data: { a: [1, 3, 5], b: [2, 4, 6] },
			columns: ['a', 'b'],
			types: { a: 'integer', b: 'integer' }
		}
		const result = fromArray(input)
		expect(result.columns).toEqual(expectedOutput.columns)
		expect(result.data).toEqual(expectedOutput.data)
		expect(result.types).toEqual(expectedOutput.types)
	})

	it('should fill missing values with nulls when new rows have additional attrubutes', () => {
		const input = [
			{ a: 1, b: 2 },
			{ a: 3, b: 4, c: 5 },
			{ a: 5, b: 6, c: 7, d: 8 }
		]
		const expectedOutput = {
			data: { a: [1, 3, 5], b: [2, 4, 6], c: [null, 5, 7], d: [null, null, 8] },
			columns: ['a', 'b', 'c', 'd'],
			types: { a: 'integer', b: 'integer', c: 'integer', d: 'integer' }
		}
		const result = fromArray(input)
		expect(result.columns).toEqual(expectedOutput.columns)
		expect(result.data).toEqual(expectedOutput.data)
		expect(result.types).toEqual(expectedOutput.types)
	})

	it('should fill missing values with nulls when new rows have missing attributes', () => {
		const input = [{ a: 1, b: 2 }, { c: 5 }, { d: 'x' }]
		const expectedOutput = {
			data: {
				a: [1, null, null],
				b: [2, null, null],
				c: [null, 5, null],
				d: [null, null, 'x']
			},
			columns: ['a', 'b', 'c', 'd'],
			types: { a: 'integer', b: 'integer', c: 'integer', d: 'string' }
		}
		const result = fromArray(input)
		// console.log(result.types)
		expect(result.columns).toEqual(expectedOutput.columns)
		expect(result.data).toEqual(expectedOutput.data)
		expect(result.types).toEqual(expectedOutput.types)
	})
})
