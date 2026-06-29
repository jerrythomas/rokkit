import { describe, it, expect, vi, beforeEach } from 'vitest'
import { get } from 'svelte/store'

// Mock Svelte's context system — vitest/jsdom doesn't have a Svelte component
// lifecycle, so we replicate the key/value store ourselves.
const contextMap = new Map()

vi.mock('svelte', async (importOriginal) => {
	const actual = await importOriginal()
	return {
		...actual,
		setContext: (key, value) => contextMap.set(key, value),
		getContext: (key) => contextMap.get(key)
	}
})

// Import after mocks are in place
const { createChartContext, getChartContext } = await import('../../src/lib/context')

describe('createChartContext', () => {
	beforeEach(() => {
		contextMap.clear()
	})

	it('returns an object with all expected stores and methods', () => {
		const ctx = createChartContext()
		expect(ctx).toHaveProperty('dimensions')
		expect(ctx).toHaveProperty('innerDimensions')
		expect(ctx).toHaveProperty('data')
		expect(ctx).toHaveProperty('scales')
		expect(ctx).toHaveProperty('plots')
		expect(ctx).toHaveProperty('axes')
		expect(ctx).toHaveProperty('legend')
		expect(ctx).toHaveProperty('addPlot')
		expect(ctx).toHaveProperty('updateScales')
	})

	it('uses DEFAULT_OPTIONS when no options are provided', () => {
		const ctx = createChartContext()
		const dims = get(ctx.dimensions)
		expect(dims.width).toBe(600)
		expect(dims.height).toBe(400)
		expect(dims.margin).toEqual({ top: 20, right: 30, bottom: 40, left: 50 })
		expect(dims.padding).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
	})

	it('merges provided options over defaults', () => {
		const ctx = createChartContext({ width: 800, height: 500 })
		const dims = get(ctx.dimensions)
		expect(dims.width).toBe(800)
		expect(dims.height).toBe(500)
	})

	it('initialises data store with empty array by default', () => {
		const ctx = createChartContext()
		expect(get(ctx.data)).toEqual([])
	})

	it('initialises data store with provided data', () => {
		const data = [{ x: 1, y: 2 }]
		const ctx = createChartContext({ data })
		expect(get(ctx.data)).toEqual(data)
	})

	it('innerDimensions derives from dimensions minus margins and padding', () => {
		const ctx = createChartContext({
			width: 600,
			height: 400,
			margin: { top: 10, right: 20, bottom: 30, left: 40 },
			padding: { top: 5, right: 5, bottom: 5, left: 5 }
		})
		const inner = get(ctx.innerDimensions)
		// 600 - 40 - 20 - 5 - 5 = 530; 400 - 10 - 30 - 5 - 5 = 350
		expect(inner.width).toBe(530)
		expect(inner.height).toBe(350)
	})

	it('plots store starts as empty array', () => {
		const ctx = createChartContext()
		expect(get(ctx.plots)).toEqual([])
	})

	it('axes store starts with null x and y', () => {
		const ctx = createChartContext()
		expect(get(ctx.axes)).toEqual({ x: null, y: null })
	})

	it('legend store starts with enabled=false and empty items', () => {
		const ctx = createChartContext()
		expect(get(ctx.legend)).toEqual({ enabled: false, items: [] })
	})

	it('sets chart context so getChartContext returns the same object', () => {
		const ctx = createChartContext()
		expect(getChartContext()).toBe(ctx)
	})

	describe('addPlot', () => {
		it('adds a plot to the plots store', () => {
			const ctx = createChartContext()
			const plot = { type: 'bar' }
			ctx.addPlot(plot)
			expect(get(ctx.plots)).toContain(plot)
		})

		it('returns a cleanup function that removes the plot', () => {
			const ctx = createChartContext()
			const plot = { type: 'line' }
			const remove = ctx.addPlot(plot)
			expect(get(ctx.plots)).toContain(plot)
			remove()
			expect(get(ctx.plots)).not.toContain(plot)
		})

		it('can add and remove multiple plots independently', () => {
			const ctx = createChartContext()
			const plot1 = { type: 'bar' }
			const plot2 = { type: 'line' }
			const remove1 = ctx.addPlot(plot1)
			const remove2 = ctx.addPlot(plot2)
			expect(get(ctx.plots)).toHaveLength(2)
			remove1()
			expect(get(ctx.plots)).toHaveLength(1)
			expect(get(ctx.plots)).toContain(plot2)
			remove2()
			expect(get(ctx.plots)).toHaveLength(0)
		})
	})

	describe('updateScales', () => {
		it('returns null when data is empty', () => {
			const ctx = createChartContext({ data: [] })
			const scalesStore = ctx.updateScales('x', 'y')
			expect(get(scalesStore)).toBeNull()
		})

		it('returns xScale and yScale for non-empty data', () => {
			const data = [
				{ category: 'A', value: 10 },
				{ category: 'B', value: 20 }
			]
			const ctx = createChartContext({ data })
			const scalesStore = ctx.updateScales('category', 'value')
			const result = get(scalesStore)
			expect(result).not.toBeNull()
			expect(result.xScale).toBeDefined()
			expect(result.yScale).toBeDefined()
			expect(result.colorScale).toBeNull()
		})

		it('returns colorScale when colorKey is provided', () => {
			const data = [
				{ category: 'A', value: 10, group: 'x' },
				{ category: 'B', value: 20, group: 'y' }
			]
			const ctx = createChartContext({ data })
			const scalesStore = ctx.updateScales('category', 'value', 'group')
			const result = get(scalesStore)
			expect(result.colorScale).not.toBeNull()
			expect(result.colorScale('x')).toBeDefined()
		})

		it('xScale uses band scale over the x domain', () => {
			const data = [
				{ category: 'A', value: 10 },
				{ category: 'B', value: 20 }
			]
			const ctx = createChartContext({ data, width: 600, height: 400 })
			const scalesStore = ctx.updateScales('category', 'value')
			const result = get(scalesStore)
			expect(result.xScale.domain()).toEqual(['A', 'B'])
		})

		it('yScale uses linear scale covering 0 to max value', () => {
			const data = [
				{ category: 'A', value: 10 },
				{ category: 'B', value: 20 }
			]
			const ctx = createChartContext({ data, width: 600, height: 400 })
			const scalesStore = ctx.updateScales('category', 'value')
			const result = get(scalesStore)
			const [domMin, domMax] = result.yScale.domain()
			expect(domMin).toBe(0)
			expect(domMax).toBeGreaterThanOrEqual(20)
		})

		it('reacts to data store updates', () => {
			const ctx = createChartContext({ data: [] })
			const scalesStore = ctx.updateScales('x', 'y')
			expect(get(scalesStore)).toBeNull()
			ctx.data.set([{ x: 'A', y: 5 }])
			expect(get(scalesStore)).not.toBeNull()
		})
	})
})

describe('getChartContext', () => {
	beforeEach(() => {
		contextMap.clear()
	})

	it('returns undefined when no context has been created', () => {
		expect(getChartContext()).toBeUndefined()
	})

	it('returns the context object set by createChartContext', () => {
		const ctx = createChartContext()
		expect(getChartContext()).toBe(ctx)
	})
})
