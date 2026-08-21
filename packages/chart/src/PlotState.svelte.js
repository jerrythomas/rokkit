import { untrack } from 'svelte'
import { SvelteMap, SvelteSet } from 'svelte/reactivity'
import { applyGeomStat } from './lib/plot/stat.js'
import {
	inferFieldType,
	inferOrientation,
	buildUnifiedXScale,
	buildUnifiedYScale,
	inferColorScaleType
} from './lib/plot/scales.js'
import { resolvePreset } from './lib/plot/preset.js'
import { resolveFormat, resolveTooltip, resolveGeom } from './lib/plot/helpers.js'
import { defaultPreset } from './lib/preset.js'
import { distinct, assignColors, isLiteralColor, buildSequentialScale, buildDivergingScale } from './lib/brewing/colors.js'
import { assignPatterns } from './lib/brewing/patterns.js'
import { assignSymbols } from './lib/brewing/marks/points.js'

let nextId = 0

// Geoms that treat the x channel as categorical (band scale), even for numeric x.
const CATEGORICAL_X = new Set(['bar', 'box', 'violin', 'jitter'])

export class PlotState {
	#data = $state([])
	#rawData = $state([])
	#channels = $state({})
	#labels = $state({})
	#helpers = $state({})
	#presetName = $state(undefined)
	#colorMidpoint = $state(undefined)
	#colorSpec = $state(undefined)
	#colorScheme = $state(undefined)
	#colorDomain = $state(undefined)
	#xDomain = $state(undefined)
	#yDomain = $state(undefined)
	#width = $state(600)
	#height = $state(400)
	#margin = $state({ top: 20, right: 20, bottom: 40, left: 50 })
	#marginOverride = $state(undefined)

	#geoms = $state([])
	#mode = $state('light')
	#chartPreset = $state(defaultPreset)
	#hovered = $state(null)
	#selected = $state(new SvelteSet())
	#onselect = $state(undefined)
	#selectable = $state(false)
	#orientationOverride = $state(undefined)
	// When true, the category (x) axis is a CONTINUOUS position scale (kept linear, not
	// band-forced) — e.g. AnimatedPlot's bar-chart race, whose tweened `_rank` must position
	// smoothly. It still flips like any category-x chart; buildBars uses continuous positioning.
	#continuousCategory = $state(false)
	// Order the category (band) axis by aggregated value instead of by label: 'desc' | 'asc'.
	// Sorts bars by size (histogram-style); undefined keeps data/label order.
	#sort = $state(undefined)

	axisOrigin = $state([undefined, undefined])
	#axisOffset = $state(0)

	#zoomTransform = $state(null)

	#effectiveMargin = $derived(this.#marginOverride ?? this.#margin)
	#innerWidth = $derived(this.#width - this.#effectiveMargin.left - this.#effectiveMargin.right)
	#innerHeight = $derived(this.#height - this.#effectiveMargin.top - this.#effectiveMargin.bottom)

	// Effective channels: prefer top-level channels PER FIELD, falling back to the
	// first geom's channels. Merged per-field (not all-or-nothing) so a composable
	// <Plot.Root x y> that omits `color` still picks up a geom's color channel
	// (e.g. <Plot.Box color=x>) — otherwise `colors` has no per-category entries and
	// every mark falls back to gray.
	#mergeGeomChannels(tc, geom) {
		return {
			x: tc.x ?? geom.channels?.x,
			y: tc.y ?? geom.channels?.y,
			color: tc.color ?? geom.channels?.color,
			fill: tc.fill ?? geom.channels?.fill,
			pattern: tc.pattern ?? geom.channels?.pattern,
			symbol: tc.symbol ?? geom.channels?.symbol
		}
	}

	// Field names feeding the shared categorical color scale: the `color` AND `fill` channels,
	// from the top-level channels and EVERY geom (union, de-duped, order-preserving). Literal
	// CSS colors are excluded. One palette/legend spans both aesthetics — the "shared scale"
	// model (see docs/backlog/2026-08-17-chart-aesthetics-unification.md §2).
	#sharedColorValues() {
		const fields = []
		const addField = (f) => {
			if (f && !isLiteralColor(f) && !fields.includes(f)) fields.push(f)
		}
		addField(this.#channels.color)
		addField(this.#channels.fill)
		for (const g of this.#geoms) {
			addField(g.channels?.color)
			addField(g.channels?.fill)
		}
		// `includes` dedup rather than a Set, matching `addField` above. These are
		// category values feeding one palette/legend — a domain of dozens, not
		// rows — so the linear scan costs nothing and the function stays free of
		// a collection the reactivity linter has to be told to ignore.
		const values = []
		for (const f of fields) {
			for (const v of distinct(this.#data, f)) if (!values.includes(v)) values.push(v)
		}
		return values
	}

	#effectiveChannels = $derived.by(() => {
		const tc = this.#channels
		const firstGeom = this.#geoms[0]
		if (!firstGeom) return tc
		return this.#mergeGeomChannels(tc, firstGeom)
	})

	#resolveXType(rawXType, yType) {
		const hasBandGeom = this.#geoms.some((g) => CATEGORICAL_X.has(g.type))
		return hasBandGeom && rawXType === 'continuous' && yType === 'continuous' ? 'band' : rawXType
	}

	// Category order sorted by aggregated value (sum of the value channel per category).
	// Drives "sort bars by size" for the band axis + its ticks. Returns null when not sorting.
	#sortedBandDomain(datasets) {
		if (!this.#sort) return null
		const xf = this.#effectiveChannels.x
		const yf = this.#effectiveChannels.y
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
		const dir = this.#sort === 'asc' ? 1 : -1
		return [...totals.keys()].sort((a, b) => dir * ((totals.get(a) ?? 0) - (totals.get(b) ?? 0)))
	}

	orientation = $derived.by(() => {
		if (this.#orientationOverride) return this.#orientationOverride
		const xField = this.#effectiveChannels.x
		const yField = this.#effectiveChannels.y
		if (!xField || !yField) return 'none'
		const rawXType = inferFieldType(this.#data, xField)
		const yType = inferFieldType(this.#data, yField)
		// Bar geoms treat numeric X as categorical (e.g. year on X → vertical bars).
		return inferOrientation(this.#resolveXType(rawXType, yType), yType)
	})

	// True when the x-channel is the categorical (band) axis — a string category, or a numeric
	// category a bar/box/violin/jitter geom bands (incl. a race's rank via continuousCategory).
	// Only such charts flip; a plain scatter (both continuous, no banding geom) is false → the
	// orientation is a no-op for the scales.
	#bandIsX = $derived.by(() => {
		const x = this.#effectiveChannels.x
		const y = this.#effectiveChannels.y
		if (!x || !y) return false
		// Resolved type: a bar/box/violin/jitter geom bands a numeric x (e.g. year, week),
		// so those NUMERIC categories are flippable too — not just string categories.
		return this.#resolveXType(inferFieldType(this.#data, x), inferFieldType(this.#data, y)) === 'band'
	})

	// Flip = render a category-on-x chart horizontally: the category (x) axis stands up on the
	// vertical screen and the value (y) axis runs along the horizontal screen. x/y channels are
	// unchanged — only the screen mapping rotates.
	#flipped = $derived(this.orientation === 'horizontal' && this.#bandIsX)

	colorScaleType = $derived.by(() => {
		const field = this.#effectiveChannels.color
		if (!field) return 'categorical'
		return inferColorScaleType(this.#data, field, {
			colorScale: this.#colorSpec,
			colorMidpoint: this.#colorMidpoint
		})
	})

	// Continuous color scale (sequential or diverging) — null for categorical.
	continuousColorScale = $derived.by(() => {
		const field = this.#effectiveChannels.color
		if (!field || this.colorScaleType === 'categorical') return null
		const opts = {
			colorScheme: this.#colorScheme,
			colorDomain: this.#colorDomain,
			colorMidpoint: this.#colorMidpoint
		}
		if (this.colorScaleType === 'diverging') {
			return buildDivergingScale(this.#data, field, opts)
		}
		return buildSequentialScale(this.#data, field, opts)
	})

	xScale = $derived.by(() => {
		const field = this.#effectiveChannels.x
		if (!field) return null
		const datasets =
			this.#geoms.length > 0 ? this.#geoms.map((g) => this.geomData(g.id)) : [this.#rawData]
		// includeZero applies to the VALUE axis. When flipped, x is the category axis, not
		// the value axis, so it must NOT include zero.
		const includeZero = this.orientation === 'horizontal' && !this.#flipped
		// Force scaleBand when x is the categorical axis (incl. flipped, where numeric categories
		// must stay a band). Exception: a CONTINUOUS category axis (a bar race's tweened rank) is
		// kept LINEAR so fractional positions tween smoothly — buildBars positions it directly.
		const hasBandGeom = this.#geoms.some((g) => CATEGORICAL_X.has(g.type))
		const bandX =
			hasBandGeom &&
			!this.#continuousCategory &&
			(this.orientation !== 'horizontal' || this.#flipped)
		// Flip: the category (x) axis stands up on the vertical screen → range over height.
		const range = this.#flipped ? [this.#innerHeight, 0] : undefined
		// Sort the band domain by aggregated value when requested (bars by size); an explicit
		// xDomain override wins.
		const domain = this.#xDomain ?? (bandX ? this.#sortedBandDomain(datasets) : null) ?? undefined
		const base = buildUnifiedXScale(datasets, field, this.#innerWidth, {
			domain,
			includeZero,
			band: bandX,
			range,
			// A continuous category axis (bar-race rank) uses a deliberately padded domain —
			// don't nice() it back to whole numbers.
			nice: !this.#continuousCategory
		})
		return this.#zoomTransform && typeof base?.bandwidth !== 'function'
			? this.#zoomTransform.rescaleX(base)
			: base
	})

	// For box/violin geoms, compute y domain from iqr_min/iqr_max instead of raw y values.
	#resolveBoxDomain() {
		const boxGeom = this.#geoms.find((g) => g.type === 'box' || g.type === 'violin')
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
		const stackGeom = this.#geoms.find(
			(g) => g.options?.stack || g.options?.position === 'stack' || g.options?.position === 'fill'
		)
		if (!stackGeom) return null
		// position='fill' normalizes each column to 100% → the value domain is [0,1].
		if (stackGeom.options?.position === 'fill') return [0, 1]
		const xField = this.#effectiveChannels.x
		const stackData = this.geomData(stackGeom.id)
		if (!xField || stackData.length === 0) return null
		// Mirror buildStackedBars/subBandFields: stack dimension is the first
		// non-x field among [color, pattern]. Summing all raw rows (stat=identity)
		// would overcount when multiple rows share the same (x, stack) key.
		const colorField = isLiteralColor(this.#effectiveChannels.color)
			? null
			: this.#effectiveChannels.color
		const fillField = isLiteralColor(this.#effectiveChannels.fill)
			? null
			: this.#effectiveChannels.fill
		const patternField = this.#effectiveChannels.pattern
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
		const geom = this.#geoms.find((g) => g.type === 'waterfall')
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
		const field = this.#effectiveChannels.y
		if (!field) return null
		const datasets =
			this.#geoms.length > 0 ? this.#geoms.map((g) => this.geomData(g.id)) : [this.#rawData]
		// includeZero applies to the VALUE axis: vertical charts (value on y) and flipped
		// charts (value still y, but now the horizontal screen axis) both want a 0 baseline.
		const includeZero = this.orientation === 'vertical' || this.#flipped
		const yDomain =
			this.#yDomain ??
			this.#resolveBoxDomain() ??
			this.#resolveStackDomain(field) ??
			this.#resolveWaterfallDomain(field)
		// Flip: the value (y) axis runs along the horizontal screen → range over width.
		const range = this.#flipped ? [0, this.#innerWidth] : undefined
		const base = buildUnifiedYScale(datasets, field, this.#innerHeight, { domain: yDomain, includeZero, range })
		return this.#zoomTransform ? this.#zoomTransform.rescaleY(base) : base
	})

	// Colors: Map<colorKey, { fill, stroke }> for all distinct color field values.
	// If the color channel is a CSS literal (e.g. '#4a90d9'), return a singleton map
	// keyed by null so all marks pick it up via the fallback path.
	// If a colorDomain is provided (e.g. from FacetPlot for cross-panel consistency),
	// use it instead of deriving distinct values from the local panel data.
	colors = $derived.by(() => {
		const field = this.#effectiveChannels.color
		if (isLiteralColor(field)) {
			/** @type {Map<unknown, { fill: string, stroke: string }>} */
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const literal = new Map([[null, { fill: field, stroke: field }]])
			return literal
		}
		const values = this.#colorDomain ?? this.#sharedColorValues()
		// No color channel but data exists → use first preset color for single-series rendering.
		// This prevents geoms from falling back to gray (#888) on charts with no fill channel.
		if (values.length === 0 && this.#data.length > 0) return assignColors([null], this.#mode, this.#chartPreset)
		return assignColors(values, this.#mode, this.#chartPreset)
	})

	// Patterns: Map<patternKey, patternName> — only populated when a pattern channel is set
	// and the pattern field is categorical (continuous fields can't be discretely patterned).
	patterns = $derived.by(() => {
		const pf = this.#effectiveChannels.pattern
		if (!pf) return new SvelteMap()
		if (inferFieldType(this.#data, pf) === 'continuous') return new SvelteMap()
		return assignPatterns(distinct(this.#data, pf))
	})

	// Symbols: Map<symbolKey, shapeName> — only populated when a symbol channel is set.
	symbols = $derived.by(() => {
		const sf = this.#effectiveChannels.symbol
		if (!sf) return new SvelteMap()
		return assignSymbols(distinct(this.#data, sf), this.#chartPreset)
	})

	// Expose effective channel fields for consumers (e.g. Legend).
	// Returns null for literal CSS colors since they don't map to a data field.
	colorField = $derived(
		isLiteralColor(this.#effectiveChannels.color) ? null : this.#effectiveChannels.color
	)
	// Fill field (interior aesthetic), parallel to colorField. Null for a literal CSS color.
	fillField = $derived(
		isLiteralColor(this.#effectiveChannels.fill) ? null : this.#effectiveChannels.fill
	)
	patternField = $derived(this.#effectiveChannels.pattern)
	symbolField = $derived(this.#effectiveChannels.symbol)

	// Set of geom types currently registered (used by Legend to pick swatch style)
	geomTypes = $derived(new SvelteSet(this.#geoms.map((g) => g.type)))

	xAxisY = $derived.by(() => {
		if (!this.yScale || typeof this.yScale !== 'function') return this.#innerHeight
		const crossVal = this.axisOrigin[1]
		if (crossVal !== undefined) return this.yScale(crossVal)
		const domain = this.yScale.domain?.()
		if (!domain) return this.#innerHeight
		// Auto quadrant: place x-axis at y=0 when domain spans zero (no offset)
		if (domain[0] <= 0 && domain[domain.length - 1] >= 0) return this.yScale(0)
		// Q1-only: axis at bottom edge, optionally with offset
		const base = this.yScale(domain[0])
		return this.#axisOffset ? base + this.#axisOffset : base
	})

	yAxisX = $derived.by(() => {
		if (!this.xScale || typeof this.xScale !== 'function') return 0
		const crossVal = this.axisOrigin[0]
		if (crossVal !== undefined) return this.xScale(crossVal)
		const domain = this.xScale.domain?.()
		if (!domain || typeof this.xScale.bandwidth === 'function') return 0
		// Auto quadrant: place y-axis at x=0 when domain spans zero (no offset)
		if (domain[0] <= 0 && domain[domain.length - 1] >= 0) return this.xScale(0)
		// Q1-only: axis at left edge, optionally with offset
		const base = this.xScale(domain[0])
		return this.#axisOffset ? base - this.#axisOffset : base
	})

	constructor(config = {}) {
		this.#rawData = config.data ?? []
		this.#data = config.data ?? []
		this.#channels = config.channels ?? {}
		this.#labels = config.labels ?? {}
		this.#helpers = config.helpers ?? {}
		this.#presetName = config.preset
		this.#colorMidpoint = config.colorMidpoint
		this.#colorSpec = config.colorScale
		this.#colorScheme = config.colorScheme
		this.#colorDomain = config.colorDomain
		this.#xDomain = config.xDomain
		this.#yDomain = config.yDomain
		this.#width = config.width ?? 600
		this.#height = config.height ?? 400
		this.#mode = config.mode ?? 'light'
		this.#chartPreset = config.chartPreset ?? defaultPreset
		this.#onselect = config.onselect
		this.#selectable = config.selectable ?? false
		if (config.selected) this.#selected = new SvelteSet(config.selected)
		this.#axisOffset = config.axisOffset ?? 0
		this.axisOrigin = config.axisOrigin ?? [undefined, undefined]
		this.#marginOverride = config.margin ?? undefined
		this.#orientationOverride = config.orientation ?? undefined
		this.#continuousCategory = config.continuousCategory ?? false
		this.#sort = config.sort ?? undefined
	}

	update(config) {
		if (config.data !== undefined) {
			this.#rawData = config.data
			this.#data = config.data
		}
		if (config.channels !== undefined) this.#channels = config.channels
		if (config.labels !== undefined) this.#labels = config.labels
		if (config.helpers !== undefined) this.#helpers = config.helpers
		if (config.preset !== undefined) this.#presetName = config.preset
		if (config.colorMidpoint !== undefined) this.#colorMidpoint = config.colorMidpoint
		if (config.colorScale !== undefined) this.#colorSpec = config.colorScale
		if (config.colorScheme !== undefined) this.#colorScheme = config.colorScheme
		this.#colorDomain = config.colorDomain
		this.#xDomain = config.xDomain
		this.#yDomain = config.yDomain
		if (config.width !== undefined) this.#width = config.width
		if (config.height !== undefined) this.#height = config.height
		if (config.mode !== undefined) this.#mode = config.mode
		if (config.chartPreset !== undefined) this.#chartPreset = config.chartPreset
		if (config.onselect !== undefined) this.#onselect = config.onselect
		if (config.selectable !== undefined) this.#selectable = config.selectable
		if (config.axisOffset !== undefined) this.#axisOffset = config.axisOffset
		this.axisOrigin = config.axisOrigin ?? [undefined, undefined]
		this.#marginOverride = config.margin ?? undefined
		this.#orientationOverride = config.orientation ?? undefined
		this.#continuousCategory = config.continuousCategory ?? false
		this.#sort = config.sort ?? undefined
	}

	registerGeom(config) {
		const id = `geom-${nextId++}`
		this.#geoms = [...this.#geoms, { id, ...config }]
		return id
	}

	updateGeom(id, config) {
		// untrack the read of #geoms to avoid effect_update_depth_exceeded when
		// called from a geom's $effect (which would otherwise track #geoms as a dependency)
		this.#geoms = untrack(() => this.#geoms).map((g) => (g.id === id ? { ...g, ...config } : g))
	}

	unregisterGeom(id) {
		this.#geoms = this.#geoms.filter((g) => g.id !== id)
	}

	geomData(id) {
		const geom = this.#geoms.find((g) => g.id === id)
		if (!geom) return []
		const stat = geom.stat ?? 'identity'
		if (stat === 'identity') return this.#rawData
		// Strip explicit `undefined` values before spreading: a geom that omits a channel
		// to inherit it from the container sends `{ x: undefined }`, not `{}`, which would
		// otherwise become an own property that clobbers the container's value below (see
		// SparkState.geomData for the fuller writeup — same bug, same fix, both classes).
		const geomChannels = Object.fromEntries(
			Object.entries(geom.channels ?? {}).filter(([, v]) => v !== undefined)
		)
		const mergedChannels = { ...this.#channels, ...geomChannels }
		return applyGeomStat(this.#rawData, { stat, channels: mergedChannels }, this.#helpers)
	}

	label(field) {
		return this.#labels?.[field] ?? field
	}

	format(field) {
		return resolveFormat(field, this.#helpers)
	}
	tooltip() {
		return resolveTooltip(this.#helpers)
	}
	geomComponent(type) {
		return resolveGeom(type, this.#helpers)
	}
	preset() {
		return resolvePreset(this.#presetName, this.#helpers)
	}

	get data() {
		// Return #rawData (not #data): geoms read their rows via geomData() which
		// returns #rawData, so overlays and index lookups (plotState.data.indexOf(datum))
		// must use the SAME proxy identity. #data and #rawData proxy the same source
		// array separately, so their elements are not ===. Same content, aligned identity.
		return this.#rawData
	}
	/** @returns {{ x?: string, y?: string, color?: string, fill?: string, pattern?: string, symbol?: string }} */
	get channels() {
		return this.#channels
	}

	// ─── Orientation helpers (horizontal / axis-flip) ──────────────────────────
	// True when the chart is rendered horizontally (category axis stood up on the
	// vertical screen, value axis along the horizontal screen). x/y channels unchanged.
	get isFlipped() {
		return this.#flipped
	}
	// True when the category (x) axis is a continuous position scale (kept linear) rather than a
	// band — a bar-chart race's tweened rank. buildBars uses continuous positioning for it.
	get continuousCategory() {
		return this.#continuousCategory
	}
	// Map abstract (x-channel, y-channel) scale outputs to screen coords. When flipped,
	// the two screen axes swap. Geoms compute u = xScale(d[x]), v = yScale(d[y]) then
	// `const { x, y } = plotState.place(u, v)`.
	place(u, v) {
		return this.#flipped ? { x: v, y: u } : { x: u, y: v }
	}
	// The categorical (band) scale and the continuous (value) scale, regardless of
	// orientation — their ranges are already oriented to the correct screen axis.
	get bandScale() {
		return this.#bandIsX ? this.xScale : this.yScale
	}
	get valueScale() {
		return this.#bandIsX ? this.yScale : this.xScale
	}
	get margin() {
		return this.#effectiveMargin
	}
	get innerWidth() {
		return this.#innerWidth
	}
	get innerHeight() {
		return this.#innerHeight
	}
	get mode() {
		return this.#mode
	}
	get chartPreset() {
		return this.#chartPreset
	}
	get hovered() {
		return this.#hovered
	}
	get interactive() {
		return Boolean(this.#onselect) || this.#selectable
	}
	get selectedRows() {
		return [...this.#selected]
	}

	setHovered(data) {
		this.#hovered = data
	}
	clearHovered() {
		this.#hovered = null
	}
	isSelected(row) {
		return this.#selected.has(row)
	}
	setSelected(rows) {
		this.#selected = new SvelteSet(rows ?? [])
	}
	clearSelected() {
		this.#selected = new SvelteSet()
	}
	handleSelect(detail) {
		this.#onselect?.(detail)
		if (this.#selectable && detail?.datum !== undefined) {
			if (this.#selected.has(detail.datum)) this.#selected.delete(detail.datum)
			else this.#selected.add(detail.datum)
		}
	}

	applyZoom(transform) {
		this.#zoomTransform = transform
	}
	resetZoom() {
		this.#zoomTransform = null
	}
}
