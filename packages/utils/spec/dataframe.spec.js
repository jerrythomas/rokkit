import { describe, expect, it } from 'vitest'
import { mean, min, max } from 'd3-array'
import { pick, omit } from 'ramda'
import { dataframe, DataFrame } from '../src/dataframe'
import {
	data,
	grouped,
	byName,
	byAgeNameDesc,
	byAgeDescNameAsc,
	rawMissing,
	filled
} from './fixtures/data'

describe('dataframe', () => {
	it('should create a dataframe', () => {
		const df = dataframe([])
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual([])
		expect(df.pkey).toBeUndefined()
		expect(df.columns).toEqual([])
		expect(df.opts).toEqual({
			missingColumns: true,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})
	})

	it('should create a dataframe with data', () => {
		const df = dataframe(data)
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual(data)
		expect(df.pkey).toBeUndefined()
		expect(df.columns).toEqual(Object.keys(data[0]))
		expect(df.opts).toEqual({
			missingColumns: false,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})
	})

	it('should create a dataframe with data and key', () => {
		const df = dataframe(data).key('rank')
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual(data)
		expect(df.pkey).toEqual('rank')
		expect(df.columns).toEqual(Object.keys(data[0]))
		expect(df.opts).toEqual({
			missingColumns: false,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})
	})

	it('should create a dataframe with surrogate key', () => {
		const df = dataframe(data).key()
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data.map((d) => omit(['id'], d))).toEqual(data)
		expect(df.data.map((d) => d.id.length)).toEqual(Array(data.length).fill(36))
		expect(df.pkey).toEqual('id')
		expect(df.columns).toEqual(Object.keys(data[0]))
		expect(df.opts).toEqual({
			missingColumns: false,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: true
		})
	})

	it('should create a dataframe with missing attributes', () => {
		const input = [
			pick(['name', 'age', 'rank'], data[0]),
			pick(['name', 'country', 'level'], data[1])
		]
		const df = dataframe(input, {
			missingColumns: true,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual(input)
		expect(df.columns).toEqual(['name', 'age', 'rank', 'country', 'level'])
		expect(df.opts).toEqual({
			missingColumns: true,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})
	})

	it('should add rows', () => {
		const df = dataframe([])
		expect(df.columns).toEqual([])
		expect(df.opts).toEqual({
			missingColumns: true,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})

		data.map((d, index) => {
			df.insert(d)
			expect(df.data).toEqual(data.slice(0, index + 1))
			expect(df.columns).toEqual(Object.keys(data[0]))
			expect(df.opts).toEqual({
				missingColumns: true,
				isGrouped: false,
				keepGroupsInNestedData: false,
				hasSurrogatePK: false
			})
		})
	})

	it('should add rows with surrogate key', () => {
		const df = dataframe([]).key()
		expect(df.columns).toEqual([])
		expect(df.opts).toEqual({
			missingColumns: true,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: true
		})
		expect(df.pkey).toEqual('id')

		data.map((d, index) => {
			let res = df.insert(d)
			expect(res).toEqual(df)
			expect(df.data.map((d) => omit(['id'], d))).toEqual(
				data.slice(0, index + 1)
			)
			expect(df.data.map((d) => d.id.length)).toEqual(Array(index + 1).fill(36))
			expect(df.columns).toEqual(Object.keys(data[0]))
			expect(df.opts).toEqual({
				missingColumns: true,
				isGrouped: false,
				keepGroupsInNestedData: false,
				hasSurrogatePK: true
			})
		})
	})

	it('should remove rows', () => {
		const df = dataframe(data)
		expect(df.data.length).toEqual(12)

		let res = df.delete((d) => d.rank > 10)
		expect(res).toEqual(df)
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

		let res = df.update((d) => ({ dbl: d.rank * 2 }))
		exp = exp.map((d) => ({ ...d, dbl: d.rank * 2 }))
		expect(res).toEqual(df)
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

		const res = dataframe(A).join(
			dataframe(B),
			(x, y) => x.rank === y.rank,
			'inner'
		)
		expect(res).toBeInstanceOf(DataFrame)
		expect(res.data).toEqual(AB)
	})

	it('should join another data set', () => {
		const A = data.slice(0, 2).map((d) => pick(['name', 'rank'], d))
		const B = data.slice(0, 2).map((d) => pick(['age', 'rank'], d))
		const AB = data.slice(0, 2).map((d) => pick(['name', 'age', 'rank'], d))

		const res = dataframe(A).join(B, (x, y) => x.rank === y.rank, 'inner')
		expect(res).toBeInstanceOf(DataFrame)
		expect(res.data).toEqual(AB)
	})

	it('should throw error when invalid data is passed', () => {
		expect(() => dataframe([]).join({})).toThrowError(
			'expected DataFrame or Array, got object'
		)
	})

	it('Should sort data', () => {
		let df = dataframe(data)

		df.sortBy('name')
		let rankOrder = df.data.map((d) => pick(['name', 'age', 'rank'], d))
		expect(rankOrder).toEqual(byName)

		df.sortBy('age', ['name', false])
		rankOrder = df.data.map((d) => pick(['name', 'age', 'rank'], d))
		expect(rankOrder).toEqual(byAgeNameDesc)

		df.sortBy(['age', false], 'name')
		rankOrder = df.data.map((d) => pick(['name', 'age', 'rank'], d))
		expect(rankOrder).toEqual(byAgeDescNameAsc)
	})

	it('Should group data', () => {
		let df = dataframe(data).keepGroupsInNestedData().groupBy(['country'])
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual(grouped.country)
		expect(df.pkey).toBeUndefined()
		expect(df.columns).toEqual(['country', '_df'])
		expect(df.opts).toEqual({
			missingColumns: false,
			isGrouped: true,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})
	})

	it('Should summarize data', () => {
		let df = dataframe(data).summarize('country')
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual([{ country_count: 12 }])
		expect(df.pkey).toBeUndefined()
		expect(df.columns).toEqual(['country_count'])
		expect(df.opts).toEqual({
			missingColumns: false,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})
	})

	it('Should group by and summarize data', () => {
		let df = dataframe(data)
			.groupBy('country')
			.summarize(['age', mean], ['rank', min, 'min'], ['rank', max, 'max'])
		expect(df).toBeInstanceOf(DataFrame)
		expect(df.data).toEqual([
			{ country: 'South Korea', age: 33.5, rank_min: 1, rank_max: 11 },
			{ country: 'Germany', age: 27.5, rank_min: 2, rank_max: 6 },
			{ country: 'Brazil', age: 27.5, rank_min: 3, rank_max: 12 },
			{ country: 'Mexico', age: 32.5, rank_min: 4, rank_max: 5 },
			{ country: 'United States', age: 28.5, rank_min: 7, rank_max: 8 },
			{ country: 'Japan', age: 37, rank_min: 9, rank_max: 10 }
		])
		expect(df.pkey).toBeUndefined()
		expect(df.columns).toEqual(['country', 'age', 'rank_min', 'rank_max'])
		expect(df.opts).toEqual({
			missingColumns: false,
			isGrouped: false,
			keepGroupsInNestedData: false,
			hasSurrogatePK: false
		})
	})

	it('Should distribute values evenly within groups', () => {
		let df = dataframe(rawMissing)
			.groupBy('country')
			.distributeEvenlyInGroups(['gender'])

		expect(df.data).toEqual(filled)
		df = dataframe(rawMissing)
			.addActualIndicator(true)
			.distributeEvenlyInGroups(['gender'])
		expect(df.data).toEqual(rawMissing)
	})

	it('Should fill missing values', () => {
		let df = dataframe([{ country: 'Japan', gender: null }]).fillMissing({
			gender: 'Male',
			count: 0
		})

		expect(df.data).toEqual([{ country: 'Japan', gender: 'Male', count: 0 }])

		df = dataframe([{ country: 'Japan' }])
			.useDefaults({ count: 0 })
			.fillMissing()

		expect(df.data).toEqual([{ country: 'Japan', count: 0 }])

		df = dataframe([{ country: 'Japan' }])
			.useDefaults()
			.fillMissing()

		expect(df.data).toEqual([{ country: 'Japan' }])
	})
})
