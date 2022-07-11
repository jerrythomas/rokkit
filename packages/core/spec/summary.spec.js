import { describe, expect, it } from 'vitest'
import { data, grouped, exclusions, inclusions } from './fixtures/data'
import { counter, quantiles, groupBy } from '../src/summary'

describe('aggregators', () => {
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
})
