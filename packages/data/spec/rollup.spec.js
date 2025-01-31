import { describe, expect, it } from 'vitest'
import { mean, quantile } from 'd3-array'
import { dataset } from '../src/dataset'
import fixtures from './fixtures/rollup'
import { counter, violin } from '../src/aggregators'

describe('dataset -> rollup', () => {
	it('should throw error if group_by is not specified', () => {
		const result = dataset([
			{ a: 1, b: 2 },
			{ a: 2, b: 3 }
		])
		expect(() => result.rollup()).toThrow(
			'Use groupBy to specify the columns to group by or use summarize to add aggregators.'
		)
	})

	it('should aggregate without group by', () => {
		const result = dataset(fixtures.simple).summarize('country', { count: counter }).rollup()
		expect(result.select()).toEqual([{ count: 12 }])
	})

	it('should group by a column', () => {
		const result = dataset(fixtures.simple)
			.groupBy('country')
			.summarize('name', 'children')
			.rollup()
		expect(result.select()).toEqual(fixtures.list_by_country)
	})

	it('should group by multiple columns', () => {
		const result = dataset(fixtures.airports).groupBy('country', 'state').rollup()
		expect(result.select()).toEqual(fixtures.list_by_country_state)
	})

	it('should rollup counts grouping by country', () => {
		const result = dataset(fixtures.airports)
			.groupBy('country')
			.summarize(['name'], { count: counter })
			.rollup()
		expect(result.select()).toEqual(fixtures.count_by_country)
	})

	it('should rollup counts grouping by country and state', () => {
		const result = dataset(fixtures.airports)
			.groupBy('country', 'state')
			.summarize('name', { count: counter })
			.rollup()
		expect(result.select()).toEqual(fixtures.count_by_country_state)
	})

	it('should rollup using multiple aggregations', () => {
		const mapper = (row) => row.price * row.quantity
		const result = dataset(fixtures.items)
			.groupBy('category')
			.summarize(mapper, {
				avg_cost: mean,
				cost_q1: (v) => quantile(v, 0.25),
				cost_q3: (v) => quantile(v, 0.75)
			})
			.rollup()
		expect(result.select()).toEqual(fixtures.cost_by_category)
	})

	it('should rollup and update', () => {
		const mapper = (row) => row.price * row.quantity
		const result = dataset(fixtures.items)
			.groupBy('category')
			.summarize(mapper, {
				avg_cost: mean,
				q1: (v) => quantile(v, 0.25),
				q3: (v) => quantile(v, 0.75)
			})
			.rollup()
			.apply(violin)

		expect(result.select()).toEqual([
			{
				avg_cost: 14.333333333333334,
				category: 'food',
				iqr: 2,
				q1: 13.5,
				q3: 15.5,
				qr_max: 16.5,
				qr_min: 10.5
			},
			{
				avg_cost: 37.5,
				category: 'drink',
				iqr: 7.5,
				q1: 33.75,
				q3: 41.25,
				qr_max: 45,
				qr_min: 22.5
			}
		])
	})

	it('should align subgroups during rollup', () => {
		const result = dataset(fixtures.data).groupBy('date').alignBy('team').rollup()
		expect(result.select()).toEqual(fixtures.with_align)
	})

	it('should align subgroups using template during rollup', () => {
		const result = dataset(fixtures.data)
			.groupBy('date')
			.alignBy('team')
			.using({ score: 0, pct: 0, rank: 999 })
			.rollup()
		expect(result.select()).toEqual(fixtures.align_using)
	})

	it('should generate timelapse groups', () => {
		function tweenable(data, by, group, template) {
			return dataset(data)
				.groupBy(by)
				.using(template)
				.alignBy(...group)
				.rollup()
				.sortBy(by)
				.select()
		}
		const result = tweenable(fixtures.nba, 'date', ['group', 'team'], {
			score: 0,
			pct: 0
		})
		expect(result).toEqual(fixtures.tweenable)
	})
})
