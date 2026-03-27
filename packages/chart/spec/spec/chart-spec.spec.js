import { describe, it, expect } from 'vitest'
import { chart, ChartSpec } from '../../src/spec/chart-spec.js'

describe('ChartSpec', () => {
	it('creates an empty spec', () => {
		const spec = new ChartSpec([])
		expect(spec.data).toEqual([])
		expect(spec.channels).toEqual({})
		expect(spec.layers).toEqual([])
		expect(spec.options).toEqual({})
	})

	it('sets channel via x()', () => {
		const spec = new ChartSpec([]).x('date')
		expect(spec.channels.x).toBe('date')
	})

	it('sets channel via y()', () => {
		const spec = new ChartSpec([]).y('revenue')
		expect(spec.channels.y).toBe('revenue')
	})

	it('sets channel via color()', () => {
		const spec = new ChartSpec([]).color('region')
		expect(spec.channels.color).toBe('region')
	})

	it('sets channel via pattern()', () => {
		const spec = new ChartSpec([]).pattern('region')
		expect(spec.channels.pattern).toBe('region')
	})

	it('sets multiple channels via aes()', () => {
		const spec = new ChartSpec([]).aes({ x: 'date', y: 'revenue', color: 'region' })
		expect(spec.channels).toEqual({ x: 'date', y: 'revenue', color: 'region' })
	})

	it('adds bar layer', () => {
		const spec = new ChartSpec([]).bar()
		expect(spec.layers).toEqual([{ type: 'bar' }])
	})

	it('adds line layer with options', () => {
		const spec = new ChartSpec([]).line({ data: [], y: 'target' })
		expect(spec.layers[0]).toEqual({ type: 'line', data: [], y: 'target' })
	})

	it('adds area layer', () => {
		const spec = new ChartSpec([]).area()
		expect(spec.layers[0]).toEqual({ type: 'area' })
	})

	it('adds arc layer', () => {
		const spec = new ChartSpec([]).arc()
		expect(spec.layers[0]).toEqual({ type: 'arc' })
	})

	it('adds point layer', () => {
		const spec = new ChartSpec([]).point()
		expect(spec.layers[0]).toEqual({ type: 'point' })
	})

	it('sets grid option', () => {
		const spec = new ChartSpec([]).grid()
		expect(spec.options.grid).toEqual({})
	})

	it('sets legend option', () => {
		const spec = new ChartSpec([]).legend()
		expect(spec.options.legend).toEqual({})
	})

	it('sets axis option', () => {
		const spec = new ChartSpec([]).axis('x', { ticks: 5 })
		expect(spec.options.axis_x).toEqual({ ticks: 5 })
	})

	it('sets size option', () => {
		const spec = new ChartSpec([]).size(800, 400)
		expect(spec.options.width).toBe(800)
		expect(spec.options.height).toBe(400)
	})

	it('supports method chaining', () => {
		const data = [{ x: 1, y: 2 }]
		const spec = chart(data).x('x').y('y').bar().legend()
		expect(spec.data).toBe(data)
		expect(spec.channels).toEqual({ x: 'x', y: 'y' })
		expect(spec.layers).toEqual([{ type: 'bar' }])
		expect(spec.options.legend).toEqual({})
	})
})

describe('chart() factory', () => {
	it('returns a ChartSpec', () => {
		const spec = chart([])
		expect(spec).toBeInstanceOf(ChartSpec)
	})

	it('passes initial channels via second arg', () => {
		const spec = chart([], { x: 'date', y: 'val' })
		expect(spec.channels).toEqual({ x: 'date', y: 'val' })
	})
})
