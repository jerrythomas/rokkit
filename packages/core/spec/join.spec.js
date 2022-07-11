import { describe, expect, it } from 'vitest'
import { data } from './fixtures/data'
import { pick } from 'ramda'
import { join, renamer, selector } from '../src/join'

describe('join', () => {
	const byRank = (a, b) => a.rank === b.rank
	const byCountry = (a, b) => a.country === b.country

	it('should select or omit keys based on options', () => {
		const input = { name: 'Heeyong Park', age: 34, rank: 1, level: 4 }

		let select = selector({ include: ['name'] })
		expect(select(input)).toEqual({ name: 'Heeyong Park' })
		select = selector({ exclude: ['level', 'rank'] })
		expect(select(input)).toEqual({ name: 'Heeyong Park', age: 34 })
		select = selector({ include: ['age', 'rank'], exclude: ['rank'] })
		expect(select(input)).toEqual({ age: 34, rank: 1 })
	})

	it('should rename keys based on options', () => {
		const input = { name: 'Heeyong Park', age: 34 }
		let rename = renamer({ prefix: 'x_' })
		expect(rename(input)).toEqual({ x_name: 'Heeyong Park', x_age: 34 })
		rename = renamer({ suffix: '_y' })
		expect(rename(input)).toEqual({ name_y: 'Heeyong Park', age_y: 34 })
		rename = renamer({ prefix: 'x_', suffix: '_y' })
		expect(rename(input)).toEqual({ x_name: 'Heeyong Park', x_age: 34 })
	})

	it('should join two data sets with matching rows', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(0, 2).map((d) => pick(['age', 'rank'], d))
		const AB = data.slice(0, 2).map((d) => pick(['name', 'age', 'rank'], d))

		let res = join(A, B).inner(byRank)
		expect(res).toEqual(AB)
		res = join(A, B).outer(byRank)
		expect(res).toEqual(AB)
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
		let res = join(A, B).inner(byCountry)
		expect(res).toEqual(AB)
		res = join(A, B).outer(byCountry)
		expect(res).toEqual(AB)
	})

	it('should drop unmatched rows when joining', () => {
		const A = data.slice(0, 4).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(2).map((d) => pick(['age', 'rank'], d))
		const AB = data.slice(2, 4).map((d) => pick(['age', 'rank', 'name'], d))

		const res = join(A, B).inner(byRank)
		expect(res).toEqual(AB)
	})

	it('should first data set when no matches exist', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = []

		const res = join(A, B).outer(byRank)
		expect(res).toEqual(A)
	})

	it('should include unmatched rows when joining', () => {
		const A = data.slice(0, 4).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(2).map((d) => pick(['age', 'rank'], d))
		const AB = data
			.slice(0, 4)
			.map((d, index) =>
				index < 2 ? pick(['rank', 'name'], d) : pick(['age', 'rank', 'name'], d)
			)

		const res = join(A, B).outer(byRank)
		expect(res).toEqual(AB)
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

		const res = join(A, B).full(byRank)
		expect(res).toEqual(AB)
	})

	it('should add prefix to columns when joining', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(1, 3).map((d) => pick(['age', 'rank'], d))

		let res = join(A, B).options({}, { prefix: 'y_' }).inner(byRank)
		expect(res).toEqual([
			{ y_age: 18, y_rank: 2, name: 'Simon Brunner', rank: 2 }
		])

		res = join(A, B).options({ prefix: 'x_' }, { prefix: 'y_' }).inner(byRank)
		expect(res).toEqual([
			{ y_age: 18, y_rank: 2, x_name: 'Simon Brunner', x_rank: 2 }
		])

		res = join(A, B).options({ prefix: 'x_' }).inner(byRank)
		expect(res).toEqual([
			{ age: 18, rank: 2, x_name: 'Simon Brunner', x_rank: 2 }
		])

		res = join(A, B).options({}, { prefix: 'y_' }).outer(byRank)
		expect(res).toEqual([
			{ name: 'Heeyong Park', rank: 1 },
			{ y_age: 18, y_rank: 2, name: 'Simon Brunner', rank: 2 }
		])
		res = join(A, B).options({ prefix: 'x_' }, { prefix: 'y_' }).outer(byRank)
		expect(res).toEqual([
			{ x_name: 'Heeyong Park', x_rank: 1 },
			{ y_age: 18, y_rank: 2, x_name: 'Simon Brunner', x_rank: 2 }
		])
		res = join(A, B).options({ prefix: 'x_' }).outer(byRank)
		expect(res).toEqual([
			{ x_name: 'Heeyong Park', x_rank: 1 },
			{ age: 18, rank: 2, x_name: 'Simon Brunner', x_rank: 2 }
		])
	})

	it('should add prefix to columns when joining', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(1, 3).map((d) => pick(['age', 'rank'], d))

		let res = join(A, B).options({}, { suffix: '_b' }).inner(byRank)
		expect(res).toEqual([
			{ age_b: 18, rank_b: 2, name: 'Simon Brunner', rank: 2 }
		])

		res = join(A, B).options({ suffix: '_a' }, { suffix: '_b' }).inner(byRank)
		expect(res).toEqual([
			{ age_b: 18, rank_b: 2, name_a: 'Simon Brunner', rank_a: 2 }
		])

		res = join(A, B).options({ suffix: '_a' }).inner(byRank)
		expect(res).toEqual([
			{ age: 18, rank: 2, name_a: 'Simon Brunner', rank_a: 2 }
		])

		res = join(A, B).options({}, { suffix: '_b' }).outer(byRank)
		expect(res).toEqual([
			{ name: 'Heeyong Park', rank: 1 },
			{ age_b: 18, rank_b: 2, name: 'Simon Brunner', rank: 2 }
		])
		res = join(A, B).options({ suffix: '_a' }, { suffix: '_b' }).outer(byRank)
		expect(res).toEqual([
			{ name_a: 'Heeyong Park', rank_a: 1 },
			{ age_b: 18, rank_b: 2, name_a: 'Simon Brunner', rank_a: 2 }
		])
		res = join(A, B).options({ suffix: '_a' }).outer(byRank)
		expect(res).toEqual([
			{ name_a: 'Heeyong Park', rank_a: 1 },
			{ age: 18, rank: 2, name_a: 'Simon Brunner', rank_a: 2 }
		])
	})

	it('should select "include" columns when joining', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'country', 'rank'], d))
		const B = data.slice(0, 1).map((d) => pick(['age', 'level', 'rank'], d))

		let res = join(A, B)
			.options({}, { include: ['age'] })
			.inner(byRank)
		expect(res).toEqual([
			{ age: 34, name: 'Heeyong Park', country: 'South Korea', rank: 1 }
		])
		res = join(A, B)
			.options({ include: ['name', 'rank'] }, { include: ['age'] })
			.inner(byRank)
		expect(res).toEqual([{ age: 34, name: 'Heeyong Park', rank: 1 }])

		res = join(A, B)
			.options({ include: ['name', 'rank'] })
			.inner(byRank)
		expect(res).toEqual([{ age: 34, level: 4, name: 'Heeyong Park', rank: 1 }])

		res = join(A, B)
			.options({}, { include: ['age'] })
			.outer(byRank)
		expect(res).toEqual([
			{ age: 34, name: 'Heeyong Park', country: 'South Korea', rank: 1 },
			{ name: 'Simon Brunner', country: 'Germany', rank: 2 }
		])
		res = join(A, B)
			.options({ include: ['name', 'rank'] }, { include: ['age'] })
			.outer(byRank)
		expect(res).toEqual([
			{ age: 34, name: 'Heeyong Park', rank: 1 },
			{ name: 'Simon Brunner', rank: 2 }
		])
		res = join(A, B)
			.options({ include: ['name', 'rank'] })
			.outer(byRank)
		expect(res).toEqual([
			{ age: 34, level: 4, name: 'Heeyong Park', rank: 1 },
			{ name: 'Simon Brunner', rank: 2 }
		])
	})

	it('should omit "exclude" columns when joining', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'country', 'rank'], d))
		const B = data.slice(0, 1).map((d) => pick(['age', 'level', 'rank'], d))

		let res = join(A, B)
			.options({}, { exclude: ['level', 'rank'] })
			.inner(byRank)
		expect(res).toEqual([
			{ age: 34, name: 'Heeyong Park', country: 'South Korea', rank: 1 }
		])
		res = join(A, B)
			.options({ exclude: ['country'] }, { exclude: ['level', 'rank'] })
			.inner(byRank)
		expect(res).toEqual([{ age: 34, name: 'Heeyong Park', rank: 1 }])

		res = join(A, B)
			.options({ exclude: ['country'] })
			.inner(byRank)
		expect(res).toEqual([{ age: 34, level: 4, name: 'Heeyong Park', rank: 1 }])

		res = join(A, B)
			.options({}, { exclude: ['level', 'rank'] })
			.outer(byRank)
		expect(res).toEqual([
			{ age: 34, name: 'Heeyong Park', country: 'South Korea', rank: 1 },
			{ name: 'Simon Brunner', country: 'Germany', rank: 2 }
		])
		res = join(A, B)
			.options({ exclude: ['country'] }, { exclude: ['level', 'rank'] })
			.outer(byRank)
		expect(res).toEqual([
			{ age: 34, name: 'Heeyong Park', rank: 1 },
			{ name: 'Simon Brunner', rank: 2 }
		])
		res = join(A, B)
			.options({ exclude: ['country'] })
			.outer(byRank)
		expect(res).toEqual([
			{ age: 34, level: 4, name: 'Heeyong Park', rank: 1 },
			{ name: 'Simon Brunner', rank: 2 }
		])
	})
})
