import { describe, it, expect } from 'vitest'
import {
	PLOT_CONFIG_FIELDS,
	resolvePlotConfig,
	resolveChrome,
	tableColumns,
	specGeomProps
} from '../../../src/lib/plot/spec.js'

const preset = { name: 'preset' }
const onselect = () => {}
const baseProps = {
	data: [{ a: 1 }],
	width: 600,
	height: 400,
	mode: 'dark',
	margin: { top: 1, right: 2, bottom: 3, left: 4 },
	helpers: { h: 1 },
	xDomain: [0, 1],
	yDomain: [0, 2],
	orientation: 'horizontal',
	axisOrigin: [0, 0],
	axisOffset: 4,
	onselect,
	selectable: true
}

describe('resolvePlotConfig', () => {
	it('without a spec, is the props — channels and labels empty, spec-only fields undefined', () => {
		expect(resolvePlotConfig(undefined, baseProps, preset)).toEqual({
			data: baseProps.data,
			width: 600,
			height: 400,
			mode: 'dark',
			margin: baseProps.margin,
			channels: {},
			labels: {},
			helpers: baseProps.helpers,
			xDomain: [0, 1],
			yDomain: [0, 2],
			colorDomain: undefined,
			colorScale: undefined,
			colorScheme: undefined,
			colorMidpoint: undefined,
			orientation: 'horizontal',
			axisOrigin: [0, 0],
			axisOffset: 4,
			sort: undefined,
			continuousCategory: undefined,
			chartPreset: preset,
			onselect,
			selectable: true
		})
	})

	it('lets a spec value override its prop — except orientation, where the prop wins', () => {
		const spec = {
			data: [{ b: 2 }],
			width: 300,
			height: 200,
			xDomain: [5, 6],
			yDomain: [7, 8],
			orientation: 'vertical',
			axisOrigin: [1, 1],
			axisOffset: 9
		}
		const config = resolvePlotConfig(spec, baseProps, preset)
		expect(config).toMatchObject({
			data: spec.data,
			width: 300,
			height: 200,
			xDomain: [5, 6],
			yDomain: [7, 8],
			axisOrigin: [1, 1],
			axisOffset: 9
		})
		expect(config.orientation).toBe('horizontal')
		expect(resolvePlotConfig(spec, { ...baseProps, orientation: undefined }, preset).orientation).toBe(
			'vertical'
		)
	})

	it('falls back to the prop when the spec value is null or undefined', () => {
		const config = resolvePlotConfig({ width: null, height: undefined }, baseProps, preset)
		expect(config.width).toBe(600)
		expect(config.height).toBe(400)
	})

	it('takes channels, labels and the colour/sort fields from the spec only', () => {
		const spec = {
			x: 'k',
			y: 'v',
			fill: 'g',
			labels: { k: 'Key' },
			colorDomain: [0, 1],
			colorScale: 'diverging',
			colorScheme: 'RdBu',
			colorMidpoint: 0,
			sort: 'desc',
			continuousCategory: true
		}
		expect(resolvePlotConfig(spec, baseProps, preset)).toMatchObject({
			channels: { x: 'k', y: 'v', color: 'g' },
			labels: { k: 'Key' },
			colorDomain: [0, 1],
			colorScale: 'diverging',
			colorScheme: 'RdBu',
			colorMidpoint: 0,
			sort: 'desc',
			continuousCategory: true
		})
		expect(resolvePlotConfig({ ...spec, color: 'c' }, baseProps, preset).channels.color).toBe('c')
	})

	it('declares every config key once, each with a known source', () => {
		const keys = PLOT_CONFIG_FIELDS.map(([key]) => key)
		expect(new Set(keys).size).toBe(keys.length)
		for (const [, source] of PLOT_CONFIG_FIELDS) {
			expect(['spec', 'prop', 'specFirst', 'propFirst']).toContain(source)
		}
	})
})

describe('resolveChrome', () => {
	const props = { grid: true, legend: false, title: 'T', summary: 'S', x: 'px', y: 'py' }

	it('shows the grid unless it is false; a named axis set passes through, a boolean is auto', () => {
		expect(resolveChrome(undefined, props)).toMatchObject({ showGrid: true, gridLines: 'auto' })
		expect(resolveChrome(undefined, { ...props, grid: false })).toMatchObject({ showGrid: false, gridLines: 'auto' })
		expect(resolveChrome({ grid: 'x' }, props)).toMatchObject({ showGrid: true, gridLines: 'x' })
		expect(resolveChrome({ grid: false }, props).showGrid).toBe(false)
	})

	it('takes legend, title and summary from the spec over the props', () => {
		expect(resolveChrome(undefined, props)).toMatchObject({ showLegend: false, title: 'T', summary: 'S' })
		expect(resolveChrome({ legend: true, title: 'ST', summary: 'SS' }, props)).toMatchObject({
			showLegend: true,
			title: 'ST',
			summary: 'SS'
		})
	})

	it('draws overlays on the spec fields, else the props', () => {
		expect(resolveChrome(undefined, props)).toMatchObject({ overlayX: 'px', overlayY: 'py' })
		expect(resolveChrome({ x: 'sx', y: 'sy' }, props)).toMatchObject({ overlayX: 'sx', overlayY: 'sy' })
	})

	it('labels an axis from spec.labels for its field, else blank', () => {
		expect(resolveChrome({ x: 'k', y: 'v', labels: { k: 'Key' } }, props)).toMatchObject({
			xLabel: 'Key',
			yLabel: ''
		})
		expect(resolveChrome(undefined, props)).toMatchObject({ xLabel: '', yLabel: '' })
	})
})

describe('tableColumns', () => {
	const rows = [{ a: 1, b: 2 }]
	it('is the spec channels, deduped, colour falling back to fill', () => {
		expect(tableColumns({ x: 'a', y: 'b', color: 'a' }, rows)).toEqual(['a', 'b'])
		expect(tableColumns({ x: 'a', fill: 'f' }, rows)).toEqual(['a', 'f'])
	})
	it('is the first row’s keys without channels, and empty without rows', () => {
		expect(tableColumns(undefined, rows)).toEqual(['a', 'b'])
		expect(tableColumns({}, [])).toEqual([])
	})
})

describe('specGeomProps', () => {
	it('inherits the spec channels, then the geom’s own win', () => {
		const spec = { x: 'k', y: 'v', color: 'c', fill: 'f' }
		expect(specGeomProps({ type: 'bar' }, spec)).toEqual({
			x: 'k',
			y: 'v',
			color: 'c',
			fill: 'f',
			pattern: undefined,
			symbol: undefined,
			stat: undefined,
			label: undefined,
			options: {}
		})
		expect(specGeomProps({ type: 'bar', x: 'gx', color: 'gc', stat: 'sum', label: true }, spec)).toMatchObject({
			x: 'gx',
			y: 'v',
			color: 'gc',
			stat: 'sum',
			label: true
		})
	})

	it('carries spec stack / orientation into options only when set; the geom’s options win', () => {
		expect(specGeomProps({ type: 'bar' }, { stack: false, orientation: 'horizontal' }).options).toEqual({
			stack: false,
			orientation: 'horizontal'
		})
		expect(specGeomProps({ type: 'bar', options: { stack: true, gap: 2 } }, { stack: false }).options).toEqual({
			stack: true,
			gap: 2
		})
	})

	it('lets geom props override everything', () => {
		expect(specGeomProps({ type: 'hull', props: { x: 'px', padding: 4 } }, { x: 'k' })).toMatchObject({
			x: 'px',
			padding: 4
		})
	})
})
