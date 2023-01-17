import { describe, expect, it } from 'vitest'
import { sum, min, max, mean, deviation } from 'd3-array'
import {
	data,
	grouped,
	exclusions,
	inclusions,
	missing,
	filled
} from './fixtures/data'

import { groupBy, summarize, fillMissingGroups } from './summary'
import { counter, quantiles } from './aggregators'

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
		let result = groupBy(data, ['country'])

		expect(result).toEqual(grouped.country)
		result = groupBy(data, ['country', 'rank'])
		expect(result).toEqual(grouped.countryAndRank)
	})

	it('should group by and handle exclusion', () => {
		let result = groupBy(data, ['country'], { exclude: ['name'] })
		expect(result).toEqual(exclusions.country)
		result = groupBy(data, ['country', 'rank'], { exclude: ['name', 'age'] })
		expect(result).toEqual(exclusions.countryAndRank)
	})

	it('should group by and handle inclusion', () => {
		let result = groupBy(data, ['country'], { include: ['name'] })
		expect(result).toEqual(inclusions.country)
		result = groupBy(data, ['country', 'rank'], { include: ['name', 'age'] })
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

	it('Should fill missing groups', () => {
		expect(() => fillMissingGroups([])).toThrowError(
			/cols must be an array of column names/
		)

		expect(() => fillMissingGroups([], [])).toThrowError(
			/cols must contain at least one column/
		)

		let result = fillMissingGroups(missing, ['gender'])
		expect(result).toEqual(filled)
		result = fillMissingGroups(missing, ['gender'], { defaults: { count: 0 } })
		let withValues = filled.map((d) => ({
			...d,
			_df: d._df.map((x) => ({ ...x, count: x.count === null ? 0 : x.count }))
		}))

		expect(result).toEqual(withValues)

		// result = fillMissingGroups(missing, ['gender'])
		// expect(result).toEqual(filled)
		result = fillMissingGroups(missing, ['gender'], {
			defaults: { count: 0 },
			addActualIndicator: true
		})
		let withIndicator = filled.map((d) => ({
			...d,
			_df: d._df.map((x) => ({
				...x,
				count: x.count === null ? 0 : x.count,
				_actual: x.count === null ? 0 : 1
			}))
		}))

		expect(result).toEqual(withIndicator)
	})
})
