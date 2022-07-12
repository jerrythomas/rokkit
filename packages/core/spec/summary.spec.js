import { describe, expect, it } from 'vitest'
import { sum, min, max, mean, deviation } from 'd3-array'
import { data, grouped, exclusions, inclusions } from './fixtures/data'

import { counter, quantiles, groupBy, summarize } from '../src/summary'

describe('aggregators', () => {
	const custom = (values) => ({
		sum: sum(values),
		min: min(values),
		max: max(values),
		mean: mean(values)
	})

	it('Should calculate counts', () => {
		expect(counter([1, 2, 3])).toEqual(3)
		expect(counter([1, 2, 3, 4, 5])).toEqual(5)
	})

	it('Should calculate quantiles', () => {
		expect(quantiles([1, 2, 3])).toEqual({
			iqr: 1,
			q1: 1.5,
			q3: 2.5,
			qr_min: 0,
			qr_max: 3
		})
		expect(quantiles([1, 2, 3, 4, 5])).toEqual({
			iqr: 2,
			q1: 2,
			q3: 4,
			qr_min: -1,
			qr_max: 5
		})
	})

	it('should group by one or more columns', () => {
		let result = groupBy('country').from(data)
		expect(result).toEqual(grouped.country)
		result = groupBy('country', 'rank').from(data)
		expect(result).toEqual(grouped.countryAndRank)
	})

	it('should group by and handle exclusion', () => {
		let result = groupBy('country').exclude('name').from(data)
		expect(result).toEqual(exclusions.country)
		result = groupBy('country', 'rank').exclude('name', 'age').from(data)
		expect(result).toEqual(exclusions.countryAndRank)
	})

	it('should group by and handle inclusion', () => {
		let result = groupBy('country').include('name').from(data)
		expect(result).toEqual(inclusions.country)
		result = groupBy('country', 'rank').include('name', 'age').from(data)
		expect(result).toEqual(inclusions.countryAndRank)
	})

	it('Should aggregate data', () => {
		let result = summarize(data, 'name')
		expect(result).toEqual({ name_count: 12 })
		result = summarize(data, 'name', 'country')
		expect(result).toEqual({ name_count: 12, country_count: 12 })
	})

	it('Should aggregate data using custom function', () => {
		let result = summarize(data, ['score', custom])

		expect(result).toEqual({
			score_sum: 1030,
			score_min: 10,
			score_max: 180,
			score_mean: 85.83333333333333
		})

		result = summarize(data, 'rank', ['age', custom])
		expect(result).toEqual({
			rank_count: 12,
			age_sum: 373,
			age_min: 18,
			age_max: 40,
			age_mean: 31.083333333333332
		})

		result = summarize(data, 'country', ['rank', deviation, 'std'])
		expect(result).toEqual({
			country_count: 12,
			rank_std: 3.605551275463989
		})
	})

	it('should aggregate with group by', () => {
		let result = groupBy('country').aggregate('name').from(data)
		expect(result).toEqual([
			{ country: 'South Korea', name_count: 2 },
			{ country: 'Germany', name_count: 2 },
			{ country: 'Brazil', name_count: 2 },
			{ country: 'Mexico', name_count: 2 },
			{ country: 'United States', name_count: 2 },
			{ country: 'Japan', name_count: 2 }
		])
		result = groupBy('country')
			.aggregate(['age', mean], ['rank', min, 'min'], ['rank', max, 'max'])
			.from(data)

		expect(result).toEqual([
			{ country: 'South Korea', age: 33.5, rank_min: 1, rank_max: 11 },
			{ country: 'Germany', age: 27.5, rank_min: 2, rank_max: 6 },
			{ country: 'Brazil', age: 27.5, rank_min: 3, rank_max: 12 },
			{ country: 'Mexico', age: 32.5, rank_min: 4, rank_max: 5 },
			{ country: 'United States', age: 28.5, rank_min: 7, rank_max: 8 },
			{ country: 'Japan', age: 37, rank_min: 9, rank_max: 10 }
		])
	})
})
