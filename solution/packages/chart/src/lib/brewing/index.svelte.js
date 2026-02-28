import { createDimensions, updateDimensions } from './dimensions.svelte.js'
import { createScales, getOrigin } from './scales.svelte.js'
import { createBars, filterBars, createGroupedBars } from './bars.svelte.js'
import { createXAxis, createYAxis, createGrid, createTickAttributes } from './axes.svelte.js'
import { createLegend, filterByLegend, createLegendItemAttributes } from './legends.svelte.js'

/**
 * Chart Brewing - A collection of pure functions for chart data preparation
 */
export {
	// Dimensions
	createDimensions,
	updateDimensions,

	// Scales
	createScales,
	getOrigin,

	// Bars
	createBars,
	filterBars,
	createGroupedBars,

	// Axes
	createXAxis,
	createYAxis,
	createGrid,
	createTickAttributes,

	// Legends
	createLegend,
	filterByLegend,
	createLegendItemAttributes
}

/**
 * Main class that manages chart state and provides access to all brewing functions
 */
export class ChartBrewer {
	#data = []
	#dimensions = createDimensions()
	#scales = { x: null, y: null, color: null }
	#fields = { x: null, y: null, color: null }
	#options = {
		padding: 0.2,
		animationDuration: 300
	}

	/**
	 * Creates a new ChartBrewer instance
	 *
	 * @param {Object} options Configuration options
	 */
	constructor(options = {}) {
		this.#dimensions = createDimensions(options.width, options.height, options.margin)

		if (options.padding !== undefined) this.#options.padding = options.padding
		if (options.animationDuration !== undefined)
			this.#options.animationDuration = options.animationDuration
	}

	/**
	 * Sets the data for the chart
	 *
	 * @param {Array} data Data array
	 * @returns {ChartBrewer} this for method chaining
	 */
	setData(data) {
		this.#data = Array.isArray(data) ? data : []
		return this
	}

	/**
	 * Sets the field mappings for axes and color
	 *
	 * @param {Object} fields Field mappings
	 * @returns {ChartBrewer} this for method chaining
	 */
	setFields({ x, y, color }) {
		if (x !== undefined) this.#fields.x = x
		if (y !== undefined) this.#fields.y = y
		if (color !== undefined) this.#fields.color = color
		return this
	}

	/**
	 * Sets the dimensions of the chart
	 *
	 * @param {Object} dimensions Chart dimensions
	 * @returns {ChartBrewer} this for method chaining
	 */
	setDimensions({ width, height, margin }) {
		this.#dimensions = updateDimensions(this.#dimensions, { width, height, margin })
		return this
	}

	/**
	 * Creates scales based on data and dimensions
	 *
	 * @returns {ChartBrewer} this for method chaining
	 */
	createScales() {
		this.#scales = createScales(this.#data, this.#fields, this.#dimensions, {
			padding: this.#options.padding
		})
		return this
	}

	/**
	 * Creates bar data for rendering
	 *
	 * @returns {Array} Data for rendering bars
	 */
	createBars() {
		return createBars(this.#data, this.#fields, this.#scales, this.#dimensions)
	}

	/**
	 * Creates x-axis tick data for rendering
	 *
	 * @param {Object} options Axis options
	 * @returns {Object} Axis rendering data
	 */
	createXAxis(options = {}) {
		return createXAxis(this.#scales, this.#dimensions, options)
	}

	/**
	 * Creates y-axis tick data for rendering
	 *
	 * @param {Object} options Axis options
	 * @returns {Object} Axis rendering data
	 */
	createYAxis(options = {}) {
		return createYAxis(this.#scales, this.#dimensions, options)
	}

	/**
	 * Creates grid line data for rendering
	 *
	 * @param {Object} options Grid options
	 * @returns {Object} Grid rendering data
	 */
	createGrid(options = {}) {
		return createGrid(this.#scales, this.#dimensions, options)
	}

	/**
	 * Creates legend data for rendering
	 *
	 * @param {Object} options Legend options
	 * @returns {Object} Legend rendering data
	 */
	createLegend(options = {}) {
		return createLegend(this.#data, this.#fields, this.#scales, this.#dimensions, options)
	}

	/**
	 * Gets all chart dimensions
	 *
	 * @returns {Object} Chart dimensions
	 */
	getDimensions() {
		return { ...this.#dimensions }
	}

	/**
	 * Gets all chart scales
	 *
	 * @returns {Object} Chart scales
	 */
	getScales() {
		return { ...this.#scales }
	}

	/**
	 * Gets the animation duration
	 *
	 * @returns {number} Animation duration in ms
	 */
	getAnimationDuration() {
		return this.#options.animationDuration
	}

	/**
	 * Gets the data being used
	 *
	 * @returns {Array} Chart data
	 */
	getData() {
		return [...this.#data]
	}

	/**
	 * Gets the fields configuration
	 *
	 * @returns {Object} Fields configuration
	 */
	getFields() {
		return { ...this.#fields }
	}
}
