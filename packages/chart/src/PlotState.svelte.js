import { SvelteMap } from 'svelte/reactivity'
import { inferFieldType, inferColorScaleType } from './lib/plot/scales.js'
import { PlotConfig } from './state/PlotConfig.svelte.js'
import { PlotFrame } from './state/PlotFrame.svelte.js'
import { ChannelState } from './state/ChannelState.svelte.js'
import { OrientationState } from './state/OrientationState.svelte.js'
import { InteractionState } from './state/InteractionState.svelte.js'
import { ScaleState } from './state/ScaleState.svelte.js'
import { GeomRegistry } from './state/GeomRegistry.svelte.js'
import { distinct, assignColors, isLiteralColor, buildSequentialScale, buildDivergingScale } from './lib/brewing/colors.js'
import { assignPatterns } from './lib/brewing/patterns.js'
import { assignSymbols } from './lib/brewing/marks/points.js'

export class PlotState {

	get orientation() {
		return this.orientationState.orientation
	}

	colorScaleType = $derived.by(() => {
		const field = this.channelState.effective.color
		if (!field) return 'categorical'
		return inferColorScaleType(this.config.data, field, {
			colorScale: this.config.colorScale,
			colorMidpoint: this.config.colorMidpoint
		})
	})

	// Continuous color scale (sequential or diverging) — null for categorical.
	continuousColorScale = $derived.by(() => {
		const field = this.channelState.effective.color
		if (!field || this.colorScaleType === 'categorical') return null
		const opts = {
			colorScheme: this.config.colorScheme,
			colorDomain: this.config.colorDomain,
			colorMidpoint: this.config.colorMidpoint
		}
		if (this.colorScaleType === 'diverging') {
			return buildDivergingScale(this.config.data, field, opts)
		}
		return buildSequentialScale(this.config.data, field, opts)
	})

	get xScale() {
		return this.scales.x
	}
	get yScale() {
		return this.scales.y
	}

	// Colors: Map<colorKey, { fill, stroke }> for all distinct color field values.
	// If the color channel is a CSS literal (e.g. '#4a90d9'), return a singleton map
	// keyed by null so all marks pick it up via the fallback path.
	// If a colorDomain is provided (e.g. from FacetPlot for cross-panel consistency),
	// use it instead of deriving distinct values from the local panel data.
	colors = $derived.by(() => {
		const field = this.channelState.effective.color
		if (isLiteralColor(field)) {
			/** @type {Map<unknown, { fill: string, stroke: string }>} */
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const literal = new Map([[null, { fill: field, stroke: field }]])
			return literal
		}
		const values = this.config.colorDomain ?? this.channelState.colorValues
		// No color channel but data exists → use first preset color for single-series rendering.
		// This prevents geoms from falling back to gray (#888) on charts with no fill channel.
		if (values.length === 0 && this.config.data.length > 0) return assignColors([null], this.config.mode, this.config.chartPreset)
		return assignColors(values, this.config.mode, this.config.chartPreset)
	})

	// Patterns: Map<patternKey, patternName> — only populated when a pattern channel is set
	// and the pattern field is categorical (continuous fields can't be discretely patterned).
	patterns = $derived.by(() => {
		const pf = this.channelState.effective.pattern
		if (!pf) return new SvelteMap()
		if (inferFieldType(this.config.data, pf) === 'continuous') return new SvelteMap()
		return assignPatterns(distinct(this.config.data, pf))
	})

	// Symbols: Map<symbolKey, shapeName> — only populated when a symbol channel is set.
	symbols = $derived.by(() => {
		const sf = this.channelState.effective.symbol
		if (!sf) return new SvelteMap()
		return assignSymbols(distinct(this.config.data, sf), this.config.chartPreset)
	})

	// Expose effective channel fields for consumers (e.g. Legend).
	// Returns null for literal CSS colors since they don't map to a data field.
	get colorField() {
		return this.channelState.colorField
	}
	get fillField() {
		return this.channelState.fillField
	}
	get patternField() {
		return this.channelState.patternField
	}
	get symbolField() {
		return this.channelState.symbolField
	}

	// Set of geom types currently registered (used by Legend to pick swatch style)
	get geomTypes() {
		return this.geoms.types
	}

	xAxisY = $derived.by(() => {
		if (!this.yScale || typeof this.yScale !== 'function') return this.frame.innerHeight
		const crossVal = this.config.axisOrigin[1]
		if (crossVal !== undefined) return this.yScale(crossVal)
		const domain = this.yScale.domain?.()
		/* v8 ignore start -- unreachable: yScale is either null (caught by the guard
		   above) or a d3 scale from buildUnifiedYScale, whose every return path is a
		   scaleLinear or scaleBand — both always expose domain() returning an array.
		   `ignore next` does not fire on a single-line `if (...) return`. */
		if (!domain) return this.frame.innerHeight
		/* v8 ignore stop */
		// Auto quadrant: place x-axis at y=0 when domain spans zero (no offset)
		if (domain[0] <= 0 && domain[domain.length - 1] >= 0) return this.yScale(0)
		// Q1-only: axis at bottom edge, optionally with offset
		const base = this.yScale(domain[0])
		return this.config.axisOffset ? base + this.config.axisOffset : base
	})

	yAxisX = $derived.by(() => {
		if (!this.xScale || typeof this.xScale !== 'function') return 0
		const crossVal = this.config.axisOrigin[0]
		if (crossVal !== undefined) return this.xScale(crossVal)
		const domain = this.xScale.domain?.()
		if (!domain || typeof this.xScale.bandwidth === 'function') return 0
		// Auto quadrant: place y-axis at x=0 when domain spans zero (no offset)
		if (domain[0] <= 0 && domain[domain.length - 1] >= 0) return this.xScale(0)
		// Q1-only: axis at left edge, optionally with offset
		const base = this.xScale(domain[0])
		return this.config.axisOffset ? base - this.config.axisOffset : base
	})

	/** The plot's inputs. The only thing `update()` writes. */
	config

	/** The mounted geoms and the rows each draws. */
	geoms
	/** The drawing area — size less margin. */
	frame
	/** Which field feeds each aesthetic. (`channels` is the caller's raw map.) */
	channelState
	/** Which way the chart reads; `place()` maps channel space to screen. */
	orientationState
	/** Hover, selection, zoom. */
	interactionState
	/** The x / y position scales. */
	scales

	constructor(config = {}) {
		this.config = new PlotConfig(config)
		this.geoms = new GeomRegistry(this.config, 'geom')
		this.frame = new PlotFrame(this.config)
		this.channelState = new ChannelState(this.config, this.geoms)
		this.orientationState = new OrientationState(this.config, this.channelState, this.geoms)
		this.interactionState = new InteractionState(this.config, config.selected)
		this.scales = new ScaleState({
			config: this.config,
			geoms: this.geoms,
			channels: this.channelState,
			orientation: this.orientationState,
			frame: this.frame,
			interaction: this.interactionState
		})
	}

	update(config) {
		this.config.update(config)
	}

	/** Pin the axis crossing directly — also reachable through `update({ axisOrigin })`. */
	get axisOrigin() {
		return this.config.axisOrigin
	}
	set axisOrigin(value) {
		this.config.axisOrigin = value
	}

	registerGeom(config) {
		return this.geoms.register(config)
	}
	updateGeom(id, config) {
		this.geoms.update(id, config)
	}
	unregisterGeom(id) {
		this.geoms.unregister(id)
	}
	geomData(id) {
		return this.geoms.data(id)
	}

	label(field) {
		return this.config.label(field)
	}
	format(field) {
		return this.config.format(field)
	}
	tooltip() {
		return this.config.tooltip()
	}
	geomComponent(type) {
		return this.config.geomComponent(type)
	}
	preset() {
		return this.config.resolvedPreset()
	}

	get data() {
		// One proxy for the rows: geomData() hands out these same objects, so overlays and
		// index lookups (plotState.data.indexOf(datum)) match by identity.
		return this.config.data
	}
	/** @returns {{ x?: string, y?: string, color?: string, fill?: string, pattern?: string, symbol?: string }} */
	get channels() {
		return this.config.channels
	}

	// ─── Orientation helpers (horizontal / axis-flip) ──────────────────────────
	// True when the chart is rendered horizontally (category axis stood up on the
	// vertical screen, value axis along the horizontal screen). x/y channels unchanged.
	get isFlipped() {
		return this.orientationState.flipped
	}
	// True when the category (x) axis is a continuous position scale (kept linear) rather than a
	// band — a bar-chart race's tweened rank. buildBars uses continuous positioning for it.
	get continuousCategory() {
		return this.config.continuousCategory
	}
	// Map abstract (x-channel, y-channel) scale outputs to screen coords. When flipped,
	// the two screen axes swap. Geoms compute u = xScale(d[x]), v = yScale(d[y]) then
	// `const { x, y } = plotState.place(u, v)`.
	place(u, v) {
		return this.orientationState.place(u, v)
	}
	// The categorical (band) scale and the continuous (value) scale, regardless of
	// orientation — their ranges are already oriented to the correct screen axis.
	get bandScale() {
		return this.scales.band
	}
	get valueScale() {
		return this.scales.value
	}
	get margin() {
		return this.frame.margin
	}
	get innerWidth() {
		return this.frame.innerWidth
	}
	get innerHeight() {
		return this.frame.innerHeight
	}
	get mode() {
		return this.config.mode
	}
	get chartPreset() {
		return this.config.chartPreset
	}
	get hovered() {
		return this.interactionState.hovered
	}
	get interactive() {
		return this.interactionState.interactive
	}
	get selectedRows() {
		return this.interactionState.selectedRows
	}
	setHovered(data) {
		this.interactionState.setHovered(data)
	}
	clearHovered() {
		this.interactionState.clearHovered()
	}
	isSelected(row) {
		return this.interactionState.isSelected(row)
	}
	setSelected(rows) {
		this.interactionState.setSelected(rows)
	}
	clearSelected() {
		this.interactionState.clearSelected()
	}
	handleSelect(detail) {
		this.interactionState.handleSelect(detail)
	}
	applyZoom(transform) {
		this.interactionState.applyZoom(transform)
	}
	resetZoom() {
		this.interactionState.resetZoom()
	}
}
