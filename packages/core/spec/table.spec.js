import { describe, expect, it } from 'vitest'
import { Table } from '../../core/src/table'
import { data, byName, byAgeNameDesc, byAgeDescNameAsc } from './fixtures/data'
import { omit, pick } from 'ramda'
import { sum, min, max, mean, deviation } from 'd3-array'

describe('Dataframe', () => {
	const custom = (values) => ({
		sum: sum(values),
		min: min(values),
		max: max(values),
		mean: mean(values)
	})

	it('Should create a dataframe', () => {
		let df = new Table(data)
		expect(df.key).toEqual('id')
		expect(df.columns).toEqual([...Object.keys(data[0]), 'id'])
		expect(df.data.map((d) => omit(['id'], d))).toEqual(data)
	})

	it('Should create a dataframe with custom key', () => {
		let df = new Table(data, 'rank')
		expect(df.key).toEqual('rank')
		expect(df.columns).toEqual([...Object.keys(data[0])])
		expect(df.data).toEqual(data)
	})
	it('Should sort data', () => {
		let df = new Table(data, 'rank')
		// df.sortBy('age', 'name')
		// let rankOrder = df.data.map((d) => d.rank)
		// expect(rankOrder).toEqual(ageAndName)

		// df.sortBy(['age', false], 'name')
		// rankOrder = df.data.map((d) => d.rank)
		// expect(rankOrder).toEqual(ageDescNameAsc)

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

	it('Should aggregate data', () => {
		let df = new Table(data)
		let result = df.aggregate('name')
		expect(result).toEqual({ name_count: 12 })
		result = df.aggregate('name', 'country')
		expect(result).toEqual({ name_count: 12, country_count: 12 })
	})

	it('Should aggregate data using custom function', () => {
		let df = new Table(data)
		let result = df.aggregate(['score', custom])

		expect(result).toEqual({
			score_sum: 1030,
			score_min: 10,
			score_max: 180,
			score_mean: 85.83333333333333
		})

		result = df.aggregate('rank', ['age', custom])
		expect(result).toEqual({
			rank_count: 12,
			age_sum: 373,
			age_min: 18,
			age_max: 40,
			age_mean: 31.083333333333332
		})

		result = df.aggregate('country', ['rank', deviation, 'std'])
		expect(result).toEqual({
			country_count: 12,
			rank_std: 3.605551275463989
		})
	})
})
