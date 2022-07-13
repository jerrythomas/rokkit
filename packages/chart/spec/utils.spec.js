import fs from 'fs'
import {
	beforeAll,
	beforeEach,
	afterEach,
	describe,
	expect,
	it,
	vi
} from 'vitest'
import {
	swatch,
	getScale,
	// getScales,
	toNested,
	getPaletteForValues,
	aggregate
} from '../src/lib/utils'

describe('Utility functions', () => {
	beforeAll((suite) => {
		suite.data = [
			{ group: 'beta', score: 6 },
			{ group: 'beta', score: 4 },
			{ group: 'beta', score: 2 },
			{ group: 'alpha', score: 2 },
			{ group: 'alpha', score: 1 },
			{ group: 'alpha', score: 3 }
		]
	})
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	it('should create a 2 by 2 swatch', () => {
		expect(swatch(4, 10)).toEqual({
			width: 20,
			height: 20,
			data: [
				{ cx: 5, cy: 5, r: 5 },
				{ cx: 15, cy: 5, r: 5 },
				{ cx: 5, cy: 15, r: 5 },
				{ cx: 15, cy: 15, r: 5 }
			]
		})

		expect(swatch(6, 10)).toEqual({
			width: 30,
			height: 20,
			data: [
				{ cx: 5, cy: 5, r: 5 },
				{ cx: 15, cy: 5, r: 5 },
				{ cx: 25, cy: 5, r: 5 },
				{ cx: 5, cy: 15, r: 5 },
				{ cx: 15, cy: 15, r: 5 },
				{ cx: 25, cy: 15, r: 5 }
			]
		})

		expect(swatch(6, 10, 2, 2)).toEqual({
			width: 26,
			height: 38,
			data: [
				{ cx: 6, cy: 6, r: 5 },
				{ cx: 18, cy: 6, r: 5 },
				{ cx: 6, cy: 18, r: 5 },
				{ cx: 18, cy: 18, r: 5 },
				{ cx: 6, cy: 30, r: 5 },
				{ cx: 18, cy: 30, r: 5 }
			]
		})

		expect(swatch(4, 10, 0, 0, 4)).toEqual({
			width: 10,
			height: 40,
			data: [
				{ cx: 5, cy: 5, r: 5 },
				{ cx: 5, cy: 15, r: 5 },
				{ cx: 5, cy: 25, r: 5 },
				{ cx: 5, cy: 35, r: 5 }
			]
		})
	})

	it('should get linear scale from numeric data', () => {
		const mtcars = JSON.parse(fs.readFileSync('./spec/fixtures/mtcars.json'))
		const mpg = mtcars.map(({ mpg }) => mpg)

		expect(mpg.some(isNaN)).toBeFalsy()
		let scale = getScale(mpg, [0, 100])
		// let minValue = Math.min(...mpg)
		let maxValue = Math.max(...mpg)
		expect(scale.domain()).toEqual([0, maxValue])
		expect(scale.range()).toEqual([0, 100])

		scale = getScale(mpg, [0, 100], 0.1)
		let margin = (maxValue - 0) * 0.1
		expect(scale.domain()).toEqual([0 - margin, maxValue + margin])
		expect(scale.range()).toEqual([0, 100])

		scale = getScale([-3, -5, 1, 2, 10], [0, 100])
		expect(scale.domain()).toEqual([-10, 10])
		expect(scale.range()).toEqual([0, 100])

		scale = getScale([-10, -5, 1, 2, 5], [0, 100])
		expect(scale.domain()).toEqual([-10, 10])
		expect(scale.range()).toEqual([0, 100])
	})

	it('should get band scale from non numeric data', () => {
		const mtcars = JSON.parse(fs.readFileSync('./spec/fixtures/mtcars.json'))
		const model = mtcars.map(({ model }) => model)

		expect(model.some(isNaN)).toBeTruthy()
		let scale = getScale(model, [0, 100])
		expect(scale.range()).toEqual([0, 100])
		expect(scale.domain().length).toBe([...new Set(model)].length)
		expect(scale.padding()).toBe(0.5)
	})

	// it('should get scales from data for x & y', () => {
	// 	const mtcars = JSON.parse(fs.readFileSync('./spec/fixtures/mtcars.json'))
	// 	const models = [...new Set(mtcars.map(({ model }) => model))]
	// 	const mpg = mtcars.map(({ mpg }) => mpg)

	// 	let scales = getScales(mtcars, 'model', 'mpg', 300, 200, 0)
	// 	let minValue = Math.min(...mpg)
	// 	let maxValue = Math.max(...mpg)
	// 	let offset = (maxValue - 0) * 0.1
	// 	expect(scales.x.range()).toEqual([0, 300])
	// 	expect(scales.x.domain()).toEqual(models)
	// 	expect(scales.y.range()).toEqual([200, 0])
	// 	expect(scales.y.domain()).toEqual([0 - offset, maxValue + offset])

	// 	scales = getScales(mtcars, 'model', 'mpg', 300, 200)
	// 	minValue = Math.min(...mpg)
	// 	maxValue = Math.max(...mpg)
	// 	offset = (maxValue - 0) * 0.1
	// 	expect(scales.x.range()).toEqual([10, 290])
	// 	expect(scales.x.domain()).toEqual(models)
	// 	expect(scales.y.range()).toEqual([190, 10])
	// 	expect(scales.y.domain()).toEqual([0 - offset, maxValue + offset])
	// })

	it('should generate statistical summary', (context) => {
		let result = aggregate(context.meta.suite.data, 'group', 'score')
		expect(result).toEqual([
			{
				key: 'beta',
				value: {
					q1: 3,
					q3: 5,
					median: 4,
					interQuantileRange: 2,
					min: 0,
					max: 8
				}
			},
			{
				key: 'alpha',
				value: {
					q1: 1.5,
					q3: 2.5,
					median: 2,
					interQuantileRange: 1,
					min: 0,
					max: 4
				}
			}
		])
	})

	it('should map a palette to set of values', () => {
		expect(getPaletteForValues([1, 2, 3, 4, 5], ['a', 'b'], 'x')).toEqual([
			'a',
			'b',
			'x',
			'x',
			'x'
		])
		expect(getPaletteForValues([1, 2], ['a', 'b', 'c'], 'x')).toEqual([
			'a',
			'b'
		])
	})

	it('should nest data by attribute', (context) => {
		const mtcars = JSON.parse(fs.readFileSync('./spec/fixtures/mtcars.json'))
		let result = toNested(mtcars, 'gear', 'model')
		let counts = mtcars
			.map(({ gear }) => gear)
			.reduce((acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc), {})

		expect(result.length).toEqual(3)
		Object.keys(counts).map((k) => {
			let item = result.filter(({ key }) => key == k)
			expect(item[0].value.length).toEqual(counts[k])
		})

		result = toNested(context.meta.suite.data, 'group', 'score')
		expect(result).toEqual([
			{ key: 'alpha', value: [{ score: 1 }, { score: 2 }, { score: 3 }] },
			{ key: 'beta', value: [{ score: 2 }, { score: 4 }, { score: 6 }] }
		])
	})
})
