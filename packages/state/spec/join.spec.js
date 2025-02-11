import { describe, it, expect } from 'vitest'
import {
	innerJoin,
	leftJoin,
	rightJoin,
	nestedJoin,
	semiJoin,
	antiJoin,
	fullJoin,
	crossJoin
} from '../src/join'
import joindata from '../fixtures/join'
import { clone } from 'ramda'

describe('joins', () => {
	const itemsA = clone(joindata.ships)
	const itemsB = clone(joindata.groups)
	const matcher = (child, parent) => child.group_id === parent.group_id

	it('should perform inner join', () => {
		const result = innerJoin(itemsA, itemsB, matcher)
		expect(result).toEqual(joindata.inner.no_rename)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})
	it('should perform left join', () => {
		const result = leftJoin(itemsA, itemsB, matcher)
		expect(result).toEqual(joindata.left.no_rename)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})
	it('should perform right join', () => {
		const result = rightJoin(itemsA, itemsB, matcher)
		expect(result).toEqual(joindata.right.no_rename)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})
	it('should perform full join', () => {
		const result = fullJoin(itemsA, itemsB, matcher)
		expect(result).toEqual(joindata.full.no_rename)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})
	it('should perform cross join', () => {
		const result = crossJoin(itemsA, itemsB)
		expect(result).toEqual(joindata.cross.no_rename)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})
	it('should perform semi join', () => {
		const result = semiJoin(itemsA, itemsB, matcher)
		expect(result).toEqual(joindata.semi.no_rename)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})
	it('should perform anti join', () => {
		const result = antiJoin(itemsA, itemsB, matcher)
		expect(result).toEqual(joindata.anti.no_rename)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})
	it('should perform nested join', () => {
		const result = nestedJoin(itemsB, itemsA, matcher)
		expect(result).toEqual(joindata.nested)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})
	it('should perform nested join with override', () => {
		const result = nestedJoin(itemsB, itemsA, matcher, 'data')
		expect(result).toEqual(joindata.nested_override)
		expect(result).not.toEqual(itemsA)
		expect(result).not.toEqual(itemsB)
	})

	it('should validate that condition is a function', () => {
		expect(() => innerJoin(itemsA, itemsB)).toThrow('Condition must be a function')
		expect(() => leftJoin(itemsA, itemsB)).toThrow('Condition must be a function')
		expect(() => rightJoin(itemsA, itemsB)).toThrow('Condition must be a function')
		expect(() => fullJoin(itemsA, itemsB)).toThrow('Condition must be a function')
		expect(() => semiJoin(itemsA, itemsB)).toThrow('Condition must be a function')
		expect(() => antiJoin(itemsA, itemsB)).toThrow('Condition must be a function')
		expect(() => nestedJoin(itemsA, itemsB)).toThrow('Condition must be a function')
	})
})
