import { getContext, setContext } from 'svelte'
import { writable, derived } from 'svelte/store'
import * as d3 from 'd3'

const CHART_CONTEXT = 'chart-context'

const DEFAULT_OPTIONS = {
	width: 600,
	height: 400,
	margin: { top: 20, right: 30, bottom: 40, left: 50 },
	padding: { top: 0, right: 0, bottom: 0, left: 0 },
	responsive: true,
	animationDuration: 300,
	data: []
}

/**
 * @param {Object} config
 * @returns {import('svelte/store').Writable}
 */
function createDimensionsStore(config) {
	return writable({
		width: config.width,
		height: config.height,
		margin: { ...config.margin },
		padding: { ...config.padding }
	})
}

/**
 * @param {import('svelte/store').Writable} dimensions
 * @returns {import('svelte/store').Readable}
 */
function createInnerDimensions(dimensions) {
	return derived(dimensions, ($d) => ({
		width:
			$d.width - $d.margin.left - $d.margin.right - $d.padding.left - $d.padding.right,
		height:
			$d.height - $d.margin.top - $d.margin.bottom - $d.padding.top - $d.padding.bottom
	}))
}

/**
 * @param {import('svelte/store').Writable} plots
 * @returns {(plot: unknown) => () => void}
 */
function makeAddPlot(plots) {
	return function addPlot(plot) {
		plots.update((currentPlots) => [...currentPlots, plot])
		return () => {
			plots.update((currentPlots) => currentPlots.filter((p) => p !== plot))
		}
	}
}

/**
 * @param {import('svelte/store').Writable} data
 * @param {import('svelte/store').Readable} innerDimensions
 * @returns {(xKey: string, yKey: string, colorKey?: string|null) => import('svelte/store').Readable}
 */
function makeUpdateScales(data, innerDimensions) {
	return function updateScales(xKey, yKey, colorKey = null) {
		return derived([data, innerDimensions], ([$data, $innerDimensions]) => {
			if (!$data || $data.length === 0) return null

			const xScale = d3
				.scaleBand()
				.domain($data.map((d) => d[xKey]))
				.range([0, $innerDimensions.width])
				.padding(0.2)

			const yScale = d3
				.scaleLinear()
				.domain([0, d3.max($data, (d) => d[yKey])])
				.nice()
				.range([$innerDimensions.height, 0])

			let colorScale = null
			if (colorKey) {
				const uniqueCategories = [...new Set($data.map((d) => d[colorKey]))]
				colorScale = d3.scaleOrdinal().domain(uniqueCategories).range(d3.schemeCategory10)
			}

			return { xScale, yScale, colorScale }
		})
	}
}

/**
 * Creates chart context and provides it to child components
 *
 * @param {Object} options Initial chart options
 * @returns {Object} Chart context with all stores and methods
 */
export function createChartContext(options = {}) {
	const config = { ...DEFAULT_OPTIONS, ...options }

	const dimensions = createDimensionsStore(config)
	const data = writable(config.data)
	const scales = writable({})
	const innerDimensions = createInnerDimensions(dimensions)
	const plots = writable([])
	const axes = writable({ x: null, y: null })
	const legend = writable({ enabled: false, items: [] })

	const addPlot = makeAddPlot(plots)
	const updateScales = makeUpdateScales(data, innerDimensions)

	const chartContext = {
		dimensions,
		innerDimensions,
		data,
		scales,
		plots,
		axes,
		legend,
		addPlot,
		updateScales
	}

	setContext(CHART_CONTEXT, chartContext)

	return chartContext
}

/**
 * Gets chart context provided by parent component
 *
 * @returns {Object} Chart context
 */
export function getChartContext() {
	return getContext(CHART_CONTEXT)
}
