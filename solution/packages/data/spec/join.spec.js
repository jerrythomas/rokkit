import { describe, it, expect } from 'vitest'
import {
	nestedJoin,
	leftJoin,
	rightJoin,
	fullJoin,
	crossJoin,
	antiJoin,
	innerJoin,
	semiJoin
} from '../src/join.js'

describe('join', () => {
	describe('nestedJoin', () => {
		it('should perform a nested join', () => {
			const first = [{ id: 1 }, { id: 2 }]
			const second = [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' }
			]
			const condition = (f, s) => f.id === s.id

			const result = nestedJoin(first, second, condition)

			expect(result).toEqual([
				{ id: 1, children: [{ id: 1, name: 'Alice' }] },
				{ id: 2, children: [{ id: 2, name: 'Bob' }] }
			])
		})
	})

	describe('leftJoin', () => {
		it('should perform a left join', () => {
			const first = [{ id: 1 }, { id: 2 }, { id: 3 }]
			const second = [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' }
			]
			const condition = (f, s) => f.id === s.id

			const result = leftJoin(first, second, condition)

			expect(result).toEqual([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3 }])
		})
	})

	describe('rightJoin', () => {
		it('should perform a right join', () => {
			const first = [{ id: 1 }, { id: 2 }]
			const second = [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' }
			]
			const condition = (f, s) => f.id === s.id

			const result = rightJoin(first, second, condition)

			expect(result).toEqual([
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' }
			])
		})
	})

	describe('fullJoin', () => {
		it('should perform a full join', () => {
			const first = [{ id: 1 }, { id: 2 }, { id: 3 }]
			const second = [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' },
				{ id: 4, name: 'Charlie' }
			]
			const condition = (f, s) => f.id === s.id

			const result = fullJoin(first, second, condition)

			expect(result).toEqual([
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' },
				{ id: 3 },
				{ id: 4, name: 'Charlie' }
			])
		})
	})

	describe('crossJoin', () => {
		it('should perform a cross join', () => {
			const first = [{ x_id: 1 }, { x_id: 2 }, { x_id: 3 }]
			const second = [
				{ y_id: 1, name: 'Alice' },
				{ y_id: 4, name: 'Bob' }
			]
			const result = crossJoin(first, second)

			expect(result).toEqual([
				{ x_id: 1, y_id: 1, name: 'Alice' },
				{ x_id: 1, y_id: 4, name: 'Bob' },
				{ x_id: 2, y_id: 1, name: 'Alice' },
				{ x_id: 2, y_id: 4, name: 'Bob' },
				{ x_id: 3, y_id: 1, name: 'Alice' },
				{ x_id: 3, y_id: 4, name: 'Bob' }
			])
		})
	})

	describe('antiJoin', () => {
		it('should perform an anti join', () => {
			const first = [{ id: 3 }, { id: 2 }]
			const second = [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' }
			]
			const condition = (f, s) => f.id === s.id

			const result = antiJoin(first, second, condition)

			expect(result).toEqual([{ id: 3 }])
		})
	})

	describe('innerJoin', () => {
		it('should perform an inner join', () => {
			const first = [{ id: 1 }, { id: 2 }, { id: 3 }]
			const second = [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' },
				{ id: 4, name: 'Charlie' }
			]
			const condition = (f, s) => f.id === s.id

			const result = innerJoin(first, second, condition)

			expect(result).toEqual([
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' }
			])
		})
	})

	describe('semiJoin', () => {
		it('should perform a semi join', () => {
			const first = [{ id: 1 }, { id: 2 }, { id: 3 }]
			const second = [
				{ id: 1, name: 'Alice' },
				{ id: 2, name: 'Bob' },
				{ id: 4, name: 'Charlie' }
			]
			const condition = (f, s) => f.id === s.id

			const result = semiJoin(first, second, condition)

			expect(result).toEqual([{ id: 1 }, { id: 2 }])
		})
	})
})
