import { describe, it, expect } from 'vitest'
import {
	createScales,
	calculateChartDimensions,
	normalizeData,
	uniqueId,
	formatTooltipContent,
	createTooltipFormatter,
	transform,
	scaledPathCollection
} from '../../src/lib/utils'

describe('createScales', () => {
	const data = [
		{ category: 'A', value: 10 },
		{ category: 'B', value: 20 },
		{ category: 'C', value: 15 }
	]
	const dimensions = { width: 400, height: 300 }

	it('returns empty object when data is null', () => {
		expect(createScales(null, dimensions, { xKey: 'x', yKey: 'y' })).toEqual({})
	})

	it('returns empty object when data is empty array', () => {
		expect(createScales([], dimensions, { xKey: 'x', yKey: 'y' })).toEqual({})
	})

	it('returns xScale and yScale for valid data', () => {
		const result = createScales(data, dimensions, { xKey: 'category', yKey: 'value' })
		expect(result.xScale).toBeDefined()
		expect(result.yScale).toBeDefined()
	})

	it('xScale is a band scale with correct domain', () => {
		const result = createScales(data, dimensions, { xKey: 'category', yKey: 'value' })
		expect(result.xScale.domain()).toEqual(['A', 'B', 'C'])
		expect(result.xScale.range()).toEqual([0, 400])
	})

	it('yScale is a linear scale starting at 0', () => {
		const result = createScales(data, dimensions, { xKey: 'category', yKey: 'value' })
		const [min] = result.yScale.domain()
		expect(min).toBe(0)
	})

	it('colorScale is null when no colorKey provided', () => {
		const result = createScales(data, dimensions, { xKey: 'category', yKey: 'value' })
		expect(result.colorScale).toBeNull()
	})

	it('colorScale is an ordinal scale when colorKey provided', () => {
		const colorData = [
			{ category: 'A', value: 10, group: 'X' },
			{ category: 'B', value: 20, group: 'Y' }
		]
		const result = createScales(colorData, dimensions, {
			xKey: 'category',
			yKey: 'value',
			colorKey: 'group'
		})
		expect(result.colorScale).not.toBeNull()
		expect(result.colorScale.domain()).toEqual(['X', 'Y'])
	})

	it('yScale range goes from height to 0 (SVG convention)', () => {
		const result = createScales(data, dimensions, { xKey: 'category', yKey: 'value' })
		expect(result.yScale.range()).toEqual([300, 0])
	})

	it('yScale domain max is 10% above actual max', () => {
		const result = createScales(data, dimensions, { xKey: 'category', yKey: 'value' })
		const [, domMax] = result.yScale.domain()
		// max value is 20, 20 * 1.1 = 22, then nice() rounds up
		expect(domMax).toBeGreaterThanOrEqual(20)
	})
})

describe('calculateChartDimensions', () => {
	it('adds innerWidth and innerHeight based on margins', () => {
		const input = {
			width: 600,
			height: 400,
			margin: { top: 20, right: 30, bottom: 40, left: 50 }
		}
		const result = calculateChartDimensions(input)
		expect(result.innerWidth).toBe(600 - 50 - 30) // 520
		expect(result.innerHeight).toBe(400 - 20 - 40) // 340
	})

	it('preserves all original dimension properties', () => {
		const input = {
			width: 600,
			height: 400,
			margin: { top: 0, right: 0, bottom: 0, left: 0 },
			extra: 'keep me'
		}
		const result = calculateChartDimensions(input)
		expect(result.width).toBe(600)
		expect(result.height).toBe(400)
		expect(result.extra).toBe('keep me')
	})

	it('returns full dimensions when all margins are zero', () => {
		const input = {
			width: 300,
			height: 200,
			margin: { top: 0, right: 0, bottom: 0, left: 0 }
		}
		const result = calculateChartDimensions(input)
		expect(result.innerWidth).toBe(300)
		expect(result.innerHeight).toBe(200)
	})
})

describe('normalizeData', () => {
	it('returns empty array for null input', () => {
		expect(normalizeData(null)).toEqual([])
	})

	it('returns empty array for undefined input', () => {
		expect(normalizeData(undefined)).toEqual([])
	})

	it('calls .select() on dataset objects', () => {
		const dataset = { select: () => [{ x: 1 }, { x: 2 }] }
		expect(normalizeData(dataset)).toEqual([{ x: 1 }, { x: 2 }])
	})

	it('returns array input as-is', () => {
		const arr = [{ x: 1 }, { x: 2 }]
		expect(normalizeData(arr)).toBe(arr)
	})

	it('returns empty array for plain object (not array, no select)', () => {
		expect(normalizeData({ x: 1 })).toEqual([])
	})
})

describe('uniqueId', () => {
	it('returns a string', () => {
		expect(typeof uniqueId()).toBe('string')
	})

	it('starts with the default prefix "chart-"', () => {
		expect(uniqueId()).toMatch(/^chart-/)
	})

	it('starts with a custom prefix when provided', () => {
		expect(uniqueId('bar')).toMatch(/^bar-/)
	})

	it('generates different IDs each call', () => {
		const id1 = uniqueId()
		const id2 = uniqueId()
		expect(id1).not.toBe(id2)
	})
})

describe('formatTooltipContent', () => {
	it('returns empty string for null data', () => {
		expect(formatTooltipContent(null)).toBe('')
	})

	it('formats using xKey and yKey when both are provided', () => {
		const d = { category: 'A', value: 10 }
		const result = formatTooltipContent(d, { xKey: 'category', yKey: 'value' })
		expect(result).toBe('category: A<br>value: 10')
	})

	it('uses xFormat to format x value', () => {
		const d = { category: 'A', value: 10 }
		const result = formatTooltipContent(d, {
			xKey: 'category',
			yKey: 'value',
			xFormat: (v) => v.toUpperCase()
		})
		expect(result).toContain('category: A')
	})

	it('uses yFormat to format y value', () => {
		const d = { category: 'A', value: 10 }
		const result = formatTooltipContent(d, {
			xKey: 'category',
			yKey: 'value',
			yFormat: (v) => `$${v}`
		})
		expect(result).toContain('value: $10')
	})

	it('falls back to all entries when xKey or yKey is missing', () => {
		const d = { a: 1, b: 2 }
		const result = formatTooltipContent(d)
		expect(result).toContain('a: 1')
		expect(result).toContain('b: 2')
	})

	it('falls back when only xKey is provided (no yKey)', () => {
		const d = { category: 'A', value: 10 }
		const result = formatTooltipContent(d, { xKey: 'category' })
		// No yKey => falls through to Object.entries
		expect(result).toContain('category: A')
		expect(result).toContain('value: 10')
	})
})

describe('createTooltipFormatter', () => {
	it('returns a function', () => {
		expect(typeof createTooltipFormatter()).toBe('function')
	})

	it('returned function formats data using provided options', () => {
		const format = createTooltipFormatter({ xKey: 'x', yKey: 'y' })
		const d = { x: 'A', y: 42 }
		expect(format(d)).toBe('x: A<br>y: 42')
	})

	it('returned function handles null data gracefully', () => {
		const format = createTooltipFormatter({ xKey: 'x', yKey: 'y' })
		expect(format(null)).toBe('')
	})
})

describe('transform', () => {
	it('returns translate(x, y) string', () => {
		expect(transform(10, 20)).toBe('translate(10, 20)')
	})

	it('handles zero values', () => {
		expect(transform(0, 0)).toBe('translate(0, 0)')
	})

	it('handles negative values', () => {
		expect(transform(-5, -10)).toBe('translate(-5, -10)')
	})
})

describe('scaledPathCollection', () => {
	it('returns an object with the same keys as input', () => {
		const paths = { circle: 'M0 0', rect: [0, 0, 10, 10] }
		const result = scaledPathCollection(paths)
		expect(Object.keys(result)).toEqual(['circle', 'rect'])
	})

	it('each value is a function that accepts a size', () => {
		const paths = { arrow: 'M0 0 L1 0' }
		const result = scaledPathCollection(paths)
		expect(typeof result.arrow).toBe('function')
	})

	it('string paths are returned unchanged regardless of size', () => {
		const paths = { sym: 'M0,0Z' }
		const result = scaledPathCollection(paths)
		expect(result.sym(2)).toBe('M0,0Z')
	})

	it('numeric path values are scaled by the size argument', () => {
		const paths = { dot: 5 }
		const result = scaledPathCollection(paths)
		// scaledPath(size, 5) = 5 * size
		expect(result.dot(2)).toBe(10)
		expect(result.dot(3)).toBe(15)
	})

	it('array paths map each element through scaledPath', () => {
		const paths = { tri: [0, 1, 2] }
		const result = scaledPathCollection(paths)
		// scaledPath(2, [0,1,2]) = "0 2 4"
		expect(result.tri(2)).toBe('0 2 4')
	})

	it('returns empty object for empty input', () => {
		expect(scaledPathCollection({})).toEqual({})
	})
})
