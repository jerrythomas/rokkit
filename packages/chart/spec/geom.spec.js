import { describe, expect, it } from 'vitest'
import { rollup, aggregate } from '../src/geom'
import { median, variance, deviation } from 'd3-array'

describe('Geometry', () => {
	const values = [1, 2, 3, 4]
	const aggItems = [
		['identity', values],
		['count', values.length],
		['sum', values.reduce((a, b) => a + b)],
		['min', Math.min(...values)],
		['max', Math.max(...values)],
		['mean', values.reduce((a, b) => a + b) / values.length],
		['median', median(values)],
		['mode', values[0]],
		['variance', variance(values)],
		['deviation', deviation(values)]
	]

	it.each(aggItems)('Should return the aggregator for [%s]', (item, result) => {
		const agg = rollup(item)
		expect(agg(values)).toEqual(result)
	})

	it('Should use a custom aggregator', () => {
		const agg = rollup((values) => values.reduce((a, b) => a + b))
		expect(agg(values)).toEqual(values.reduce((a, b) => a + b))
	})

	it('Should throw exceptions for invalid input', () => {
		expect(() => rollup()).toThrow(/stat must be a string or function/)
		expect(() => rollup('invalid')).toThrow(/Unknown stat: invalid/)
	})

	it('Should aggregate data', () => {
		const data = [
			{ pct: 0.8, score: 10, gender: 'm', country: 'Japan' },
			{ pct: 0.7, score: 10, gender: 'f', country: 'Japan' },
			{ pct: 0.6, score: 10, gender: 'm', country: 'South Korea' },
			{ pct: 0.5, score: 10, gender: 'f', country: 'South Korea' }
		]
		let aes = { x: 'country', y: 'score' }
		let res = aggregate(data, aes)
		expect(res).toEqual([
			['Japan', [10, 10]],
			['South Korea', [10, 10]]
		])

		res = aggregate(data, aes, 'sum')
		expect(res).toEqual([
			['Japan', 20],
			['South Korea', 20]
		])

		aes = { x: 'country', y: 'score', size: 'pct' }
		res = aggregate(data, aes, 'sum')
		expect(res).toEqual([
			['Japan', 0.8, 10],
			['Japan', 0.7, 10],
			['South Korea', 0.6, 10],
			['South Korea', 0.5, 10]
		])
	})
})
