import { describe, expect, it } from 'vitest'
import { pick } from 'ramda'
import { dataframe, DataFrame } from '../src/dataframe'
import { data } from './fixtures/data'

describe('dataframe', () => {
	it('should create a dataframe', () => {
		const df = dataframe([])
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual([])
		expect(df.columns).toEqual([])
		expect(df.opts).toEqual({ missingColumns: true })
	})

	it('should create a dataframe with data', () => {
		const df = dataframe(data)
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual(data)
		expect(df.columns).toEqual(Object.keys(data[0]))
		expect(df.opts).toEqual({ missingColumns: false })
	})

	it('should create a dataframe with missing attributes', () => {
		const input = [
			pick(['name', 'age', 'rank'], data[0]),
			pick(['name', 'country', 'level'], data[1])
		]
		const df = dataframe(input, { missingColumns: true })
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual(input)
		expect(df.columns).toEqual(['name', 'age', 'rank', 'country', 'level'])
		expect(df.opts).toEqual({ missingColumns: true })
	})

	it('should add rows', () => {
		const df = dataframe([])
		expect(df.columns).toEqual([])
		expect(df.opts).toEqual({ missingColumns: true })

		data.map((d, index) => {
			df.insert(d)
			expect(df.data).toEqual(data.slice(0, index + 1))
			expect(df.columns).toEqual(Object.keys(data[0]))
			expect(df.opts).toEqual({ missingColumns: true })
		})
	})

	it('should remove rows', () => {
		const df = dataframe(data)
		expect(df.data.length).toEqual(12)

		df.delete((d) => d.rank > 10)
		expect(df.data.length).toEqual(10)
		expect(df.data.map((d) => d.rank)).toEqual(
			Array.from({ length: 10 }, (_, i) => i + 1)
		)
		df.delete((d) => d.rank <= 4)
		expect(df.data.length).toEqual(6)
		expect(df.data.map((d) => d.rank)).toEqual(
			Array.from({ length: 6 }, (_, i) => i + 5)
		)
	})

	it('should update rows using data', () => {
		const df = dataframe(data)
		expect(df.data.length).toEqual(12)
		expect(df.data[0].age).toEqual(34)
		df.update((d) => d.rank == 1, { age: 20 })
		expect(df.data[0].age).toEqual(20)

		df.update((d) => ({ rank: d.rank * 2 }))
		expect(df.data.map((d) => d.rank)).toEqual(
			Array.from({ length: 12 }, (_, i) => (i + 1) * 2)
		)
	})

	it('should update rows using function', () => {
		const df = dataframe(data)
		df.update((d) => ({ rank: d.rank + 1 }))

		let exp = data.map((d) => ({ ...d, rank: d.rank + 1 }))
		expect(df.data).toEqual(exp)
		expect(df.columns).toEqual([
			'country',
			'name',
			'age',
			'score',
			'time',
			'rank',
			'level'
		])

		df.update((d) => ({ dbl: d.rank * 2 }))
		exp = exp.map((d) => ({ ...d, dbl: d.rank * 2 }))
		expect(df.data).toEqual(exp)
		expect(df.columns).toEqual([
			'country',
			'name',
			'age',
			'score',
			'time',
			'rank',
			'level',
			'dbl'
		])
	})

	it('should join another dataframe', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(0, 2).map((d) => pick(['age', 'rank'], d))
		const AB = data.slice(0, 2).map((d) => pick(['name', 'age', 'rank'], d))

		const res = dataframe(A)
			.join(dataframe(B))
			.inner((x, y) => x.rank === y.rank)

		expect(res).toEqual(AB)
	})

	it('should join another data set', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(0, 2).map((d) => pick(['age', 'rank'], d))
		const AB = data.slice(0, 2).map((d) => pick(['name', 'age', 'rank'], d))

		const res = dataframe(A)
			.join(B)
			.inner((x, y) => x.rank === y.rank)

		expect(res).toEqual(AB)
	})

	it('should throw error when invalid data is passed', () => {
		expect(() => dataframe([]).join({})).toThrowError(
			'expected DataFrame or Array, got object'
		)
	})
})
