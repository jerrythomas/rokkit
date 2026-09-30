import { SvelteMap } from 'svelte/reactivity'
import {
	inferFieldType,
	buildUnifiedXScale,
	buildUnifiedYScale,
	inferColorScaleType
} from './lib/plot/scales.js'
import { PlotConfig } from './state/PlotConfig.svelte.js'
import { PlotFrame } from './state/PlotFrame.svelte.js'
import { ChannelState } from './state/ChannelState.svelte.js'
import { OrientationState } from './state/OrientationState.svelte.js'
import { InteractionState } from './state/InteractionState.svelte.js'
import { GeomRegistry } from './state/GeomRegistry.svelte.js'
import { distinct, assignColors, isLiteralColor, buildSequentialScale, buildDivergingScale } from './lib/brewing/colors.js'
import { assignPatterns } from './lib/brewing/patterns.js'
import { assignSymbols } from './lib/brewing/marks/points.js'

export class PlotState {

	// Category order sorted by aggregated value (sum of the value channel per category).
	// Drives "sort bars by size" for the band axis + its ticks. Returns null when not sorting.
	#sortedBandDomain(datasets) {
		if (!this.config.sort) return null
		const xf = this.channelState.effective.x
		const yf = this.channelState.effective.y
		if (!xf || !yf) return null
		// Keyed accumulator, function-local and discarded before returning — a
		// SvelteMap would register a reactive signal per category on every
		// derivation for a collection nothing outside this call can observe.
		// Not a plain object either: keys are raw data values (numbers, Dates),
		// which object keys would coerce to strings.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const totals = new Map()
		for (const ds of datasets) {
			for (const d of ds) {
				const key = d[xf]
				totals.set(key, (totals.get(key) ?? 0) + (Number(d[yf]) || 0))
			}
		}
		const dir = this.config.sort === 'asc' ? 1 : -1
		return [...totals.keys()].sort((a, b) => dir * ((totals.get(a) ?? 0) - (totals.get(b) ?? 0)))
	}

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

	xScale = $derived.by(() => {
		const field = this.channelState.effective.x
		if (!field) return null
		const datasets =
			this.geoms.list.length > 0 ? this.geoms.list.map((g) => this.geomData(g.id)) : [this.config.data]
		// includeZero applies to the VALUE axis. When flipped, x is the category axis, not
		// the value axis, so it must NOT include zero.
		const includeZero = this.orientation === 'horizontal' && !this.orientationState.flipped
		// Force scaleBand when x is the categorical axis (incl. flipped, where numeric categories
		// must stay a band). Exception: a CONTINUOUS category axis (a bar race's tweened rank) is
		// kept LINEAR so fractional positions tween smoothly — buildBars positions it directly.
		const hasBandGeom = this.orientationState.hasBandGeom
		const bandX =
			hasBandGeom &&
			!this.config.continuousCategory &&
			(this.orientation !== 'horizontal' || this.orientationState.flipped)
		// Flip: the category (x) axis stands up on the vertical screen → range over height.
		const range = this.orientationState.flipped ? [this.frame.innerHeight, 0] : undefined
		// Sort the band domain by aggregated value when requested (bars by size); an explicit
		// xDomain override wins.
		const domain = this.config.xDomain ?? (bandX ? this.#sortedBandDomain(datasets) : null) ?? undefined
		const base = buildUnifiedXScale(datasets, field, this.frame.innerWidth, {
			domain,
			includeZero,
			band: bandX,
			range,
			// A continuous category axis (bar-race rank) uses a deliberately padded domain —
			// don't nice() it back to whole numbers.
			nice: !this.config.continuousCategory
		})
		return this.interactionState.zoom && typeof base?.bandwidth !== 'function'
			? this.interactionState.zoom.rescaleX(base)
			: base
	})

	// For box/violin geoms, compute y domain from iqr_min/iqr_max instead of raw y values.
	#resolveBoxDomain() {
		const boxGeom = this.geoms.find((g) => g.type === 'box' || g.type === 'violin')
		if (!boxGeom) return null
		const boxData = this.geomData(boxGeom.id)
		const isValid = (v) => v !== null && v !== undefined && !isNaN(v)
		const flatOutliers = boxData.flatMap((d) => d.outliers ?? []).filter(isValid)
		const mins = [...boxData.map((d) => d.iqr_min).filter(isValid), ...flatOutliers]
		const maxs = [...boxData.map((d) => d.iqr_max).filter(isValid), ...flatOutliers]
		return mins.length > 0 && maxs.length > 0 ? [Math.min(...mins), Math.max(...maxs)] : null
	}

	// For stacked bars, compute y domain from per-x column totals.
	#resolveStackDomain(field) {
		const stackGeom = this.geoms.find(
			(g) => g.options?.stack || g.options?.position === 'stack' || g.options?.position === 'fill'
		)
		if (!stackGeom) return null
		// position='fill' normalizes each column to 100% → the value domain is [0,1].
		if (stackGeom.options?.position === 'fill') return [0, 1]
		const xField = this.channelState.effective.x
		const stackData = this.geomData(stackGeom.id)
		if (!xField || stackData.length === 0) return null
		// Mirror buildStackedBars/subBandFields: stack dimension is the first
		// non-x field among [color, pattern]. Summing all raw rows (stat=identity)
		// would overcount when multiple rows share the same (x, stack) key.
		const colorField = isLiteralColor(this.channelState.effective.color)
			? null
			: this.channelState.effective.color
		const fillField = isLiteralColor(this.channelState.effective.fill)
			? null
			: this.channelState.effective.fill
		const patternField = this.channelState.effective.pattern
		// Mirror buildStackedBars/subBandFields (group=fill first, then color, then pattern).
		const stackField =
			[fillField, colorField, patternField].find((f) => f && f !== xField) ?? (fillField ?? colorField)
		// No grouping field → buildStackedBars falls back to buildBars (individual bars, no
		// actual stacking), so there's no stacked total to size to. Bail to the normal value
		// extent; otherwise every row collapses to the same cKey below and the lookup's set()
		// overwrites, shrinking the domain to the last row per x — and the bars overflow.
		if (!stackField) return null
		const lookup = new SvelteMap()
		for (const d of stackData) {
			const xVal = d[xField]
			const cKey = stackField ? String(d[stackField]) : '_'
			if (!lookup.has(xVal)) lookup.set(xVal, new SvelteMap())
			lookup.get(xVal).set(cKey, Number(d[field]) || 0)
		}
		const totals = new SvelteMap()
		for (const [xVal, colorMap] of lookup) {
			totals.set(
				xVal,
				[...colorMap.values()].reduce((s, v) => s + v, 0)
			)
		}
		return [0, Math.max(0, ...totals.values())]
	}

	// Waterfall bars sit at the RUNNING TOTAL, not the per-step value — so the y-domain must
	// span the cumulative range, else bars overflow the axis. Mirrors buildWaterfallMarks.
	#resolveWaterfallDomain(field) {
		const geom = this.geoms.find((g) => g.type === 'waterfall')
		if (!geom) return null
		const data = this.geomData(geom.id)
		if (data.length === 0) return null
		const totalField = geom.options?.totalField
		let cumulative = 0
		let min = 0
		let max = 0
		for (const d of data) {
			if (totalField && d[totalField]) {
				min = Math.min(min, 0, cumulative)
				max = Math.max(max, 0, cumulative)
			} else {
				const start = cumulative
				cumulative += Number(d[field]) || 0
				min = Math.min(min, start, cumulative)
				max = Math.max(max, start, cumulative)
			}
		}
		return [min, max]
	}

	yScale = $derived.by(() => {
		const field = this.channelState.effective.y
		if (!field) return null
		const datasets =
			this.geoms.list.length > 0 ? this.geoms.list.map((g) => this.geomData(g.id)) : [this.config.data]
		// includeZero applies to the VALUE axis: vertical charts (value on y) and flipped
		// charts (value still y, but now the horizontal screen axis) both want a 0 baseline.
		const includeZero = this.orientation === 'vertical' || this.orientationState.flipped
		const yDomain =
			this.config.yDomain ??
			this.#resolveBoxDomain() ??
			this.#resolveStackDomain(field) ??
			this.#resolveWaterfallDomain(field)
		// Flip: the value (y) axis runs along the horizontal screen → range over width.
		const range = this.orientationState.flipped ? [0, this.frame.innerWidth] : undefined
		const base = buildUnifiedYScale(datasets, field, this.frame.innerHeight, { domain: yDomain, includeZero, range })
		return this.interactionState.zoom ? this.interactionState.zoom.rescaleY(base) : base
	})

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

	constructor(config = {}) {
		this.config = new PlotConfig(config)
		this.geoms = new GeomRegistry(this.config, 'geom')
		this.frame = new PlotFrame(this.config)
		this.channelState = new ChannelState(this.config, this.geoms)
		this.orientationState = new OrientationState(this.config, this.channelState, this.geoms)
		this.interactionState = new InteractionState(this.config, config.selected)
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
		return this.orientationState.bandIsX ? this.xScale : this.yScale
	}
	get valueScale() {
		return this.orientationState.bandIsX ? this.yScale : this.xScale
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
