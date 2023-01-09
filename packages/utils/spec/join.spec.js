import { describe, expect, it } from 'vitest'
import { data } from './fixtures/data'
import { pick } from 'ramda'
import { join, renameUsing, innerJoin, outerJoin, fullJoin } from '../src/join'

describe('join', () => {
	const byRank = (a, b) => a.rank === b.rank
	const byCountry = (a, b) => a.country === b.country

	it('should rename keys based on options', () => {
		const input = { name: 'Heeyong Park', age: 34 }
		let rename = renameUsing({ prefix: 'x' })
		expect(rename(input)).toEqual({ x_name: 'Heeyong Park', x_age: 34 })
		rename = renameUsing({ prefix: 'x', separator: '.' })
		expect(rename(input)).toEqual({ 'x.name': 'Heeyong Park', 'x.age': 34 })
		rename = renameUsing({ suffix: 'y' })
		expect(rename(input)).toEqual({ name_y: 'Heeyong Park', age_y: 34 })
		rename = renameUsing({ suffix: '_y', separator: '' })
		expect(rename(input)).toEqual({ name_y: 'Heeyong Park', age_y: 34 })
		rename = renameUsing({ prefix: 'x', suffix: 'y' })
		expect(rename(input)).toEqual({ x_name: 'Heeyong Park', x_age: 34 })
	})

	it('should join two data sets with matching rows', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(0, 2).map((d) => pick(['age', 'rank'], d))
		const AB = data.slice(0, 2).map((d) => pick(['name', 'age', 'rank'], d))

		expect(innerJoin(A, B, byRank)).toEqual(AB)
		expect(join(A, B, byRank)).toEqual(AB)
		expect(join(A, B, byRank, { type: 'inner' })).toEqual(AB)
		expect(outerJoin(A, B, byRank)).toEqual(AB)
		expect(join(A, B, byRank, { type: 'outer' })).toEqual(AB)
	})

	it('should throw error for invalid join type', () => {
		expect(() => join([], [], byRank, { type: 'invalid' })).toThrowError(
			'Unknown join type: invalid'
		)
	})

	it('should multiply rows when joining', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'country'], d))
		const B = data.map((d) => pick(['age', 'country'], d))
		const AB = [
			{ age: 34, country: 'South Korea', name: 'Heeyong Park' },
			{ age: 33, country: 'South Korea', name: 'Heeyong Park' },
			{ age: 18, country: 'Germany', name: 'Simon Brunner' },
			{ age: 37, country: 'Germany', name: 'Simon Brunner' }
		]
		expect(innerJoin(A, B, byCountry)).toEqual(AB)
		expect(outerJoin(A, B, byCountry)).toEqual(AB)
	})

	it('should drop unmatched rows when joining', () => {
		const A = data.slice(0, 4).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(2).map((d) => pick(['age', 'rank'], d))
		const AB = data.slice(2, 4).map((d) => pick(['age', 'rank', 'name'], d))

		expect(innerJoin(A, B, byRank)).toEqual(AB)
	})

	it('should return first data set when no matches exist', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = []

		expect(outerJoin(A, B, byRank)).toEqual(A)
	})

	it('should include unmatched rows when joining', () => {
		const A = data.slice(0, 4).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(2).map((d) => pick(['age', 'rank'], d))
		const AB = data
			.slice(0, 4)
			.map((d, index) =>
				index < 2 ? pick(['rank', 'name'], d) : pick(['age', 'rank', 'name'], d)
			)

		expect(outerJoin(A, B, byRank)).toEqual(AB)
	})

	it('should include all rows from both sides', () => {
		const A = data.slice(0, 4).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(2, 6).map((d) => pick(['age', 'rank'], d))
		const AB = data
			.slice(0, 6)
			.map((d, index) =>
				index < 2
					? pick(['rank', 'name'], d)
					: index < 4
					? pick(['age', 'rank', 'name'], d)
					: pick(['age', 'rank'], d)
			)

		expect(fullJoin(A, B, byRank)).toEqual(AB)
		expect(join(A, B, byRank, { type: 'full' })).toEqual(AB)
	})

	it('should add prefix to columns when joining', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(1, 3).map((d) => pick(['age', 'rank'], d))

		let AB = [{ y_age: 18, y_rank: 2, name: 'Simon Brunner', rank: 2 }]
		let res = innerJoin(A, B, byRank, { prefix: 'y' })
		expect(res).toEqual(AB)
		res = join(A, B, byRank, { prefix: 'y' })
		expect(res).toEqual(AB)

		AB = [
			{ name: 'Heeyong Park', rank: 1 },
			{ y_age: 18, y_rank: 2, name: 'Simon Brunner', rank: 2 }
		]
		res = outerJoin(A, B, byRank, { prefix: 'y' })
		expect(res).toEqual(AB)
		res = join(A, B, byRank, { type: 'outer', prefix: 'y' })
		expect(res).toEqual(AB)
	})

	it('should add suffix to columns when joining', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(1, 3).map((d) => pick(['age', 'rank'], d))

		let AB = [{ age_b: 18, rank_b: 2, name: 'Simon Brunner', rank: 2 }]
		let res = innerJoin(A, B, byRank, { suffix: 'b' })
		expect(res).toEqual(AB)
		res = join(A, B, byRank, { type: 'inner', suffix: 'b' })
		expect(res).toEqual(AB)

		AB = [
			{ name: 'Heeyong Park', rank: 1 },
			{ age_b: 18, rank_b: 2, name: 'Simon Brunner', rank: 2 }
		]
		res = outerJoin(A, B, byRank, { suffix: 'b' })
		expect(res).toEqual(AB)
		res = join(A, B, byRank, { type: 'outer', suffix: 'b' })
		expect(res).toEqual(AB)
	})
})
