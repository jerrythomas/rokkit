import { untrack } from 'svelte'
import { buildUnifiedXScale, buildUnifiedYScale } from './lib/plot/scales.js'
import { defaultPreset } from './lib/preset.js'
import { applyGeomStat } from './lib/plot/stat.js'

let nextGeomId = 0

/**
 * SparkState — the lean, PlotState-compatible context that lets a sparkline compose
 * real geoms (`<Spark><Line /></Spark>`) instead of Sparkline's own hand-rolled
 * line/area/bar rendering. It publishes on the same 'plot-state' context key as
 * PlotState, so geoms (Line/Area/Bar) read scales, channels and data through the
 * identical interface and never know whether they're inside a spark or a full Plot.
 *
 * An 80×24 glyph has no use for most of what PlotState carries, so this is a thin
 * composition of the same pure scale modules PlotState uses — not a re-implementation
 * of PlotState's scope. It publishes the same registerGeom/updateGeom/unregisterGeom/
 * geomData lifecycle as PlotState (see those methods below), at smaller scope, so
 * GeomState — and therefore any geom component — drives a spark unchanged. Deliberately
 * omitted, permanently (a later slice adds aesthetics and the <Spark> container, but
 * none of these):
 *  - zoom/pan transforms — a spark is a static glyph, never panned or zoomed.
 *  - crossfilter/selection — nothing to click or brush at this size.
 *  - facets — a spark is always a single small panel, never a grid of panels.
 *  - color scales, fill patterns, point symbols — a spark renders one series in one
 *    color; there is no legend to distinguish series by.
 *  - axis/legend chrome and margins — width/height ARE the inner box.
 *
 * `data` deliberately holds ONE array (`$state.raw`, not a proxying `$state`), unlike
 * PlotState's `#data`/`#rawData` pair. That split gave PlotState's data two distinct
 * proxy identities for the same source array, breaking identity-based lookups like
 * `plotState.data.indexOf(row)` (see journal 2026-08-13). Geoms will later read rows
 * from this same array, so its identity must be exactly what the caller passed in.
 */
export class SparkState {
	#data = $state.raw([])
	#channels = $state({})
	#width = $state(80)
	#height = $state(24)
	#min = $state(undefined)
	#max = $state(undefined)
	#baseline = $state(undefined)
	#geoms = $state([])

	// Mirrors Sparkline's current yMin/yMax logic: an explicit min/max wins; otherwise
	// the domain is the raw data extent, widened to include the baseline when one is
	// set (so a below-baseline dip or an above-baseline spike stays on-canvas).
	// Non-numeric/missing y values coerce to NaN and are filtered out before min/max —
	// otherwise one bad row poisons the whole domain to NaN (silent blank render).
	// A single distinct finite value (flat line) deliberately falls through to a
	// zero-extent domain ([v, v]); d3 renders that as a flat mid-scale line, which is
	// the correct flat-line behaviour, not a bug to be guarded against later.
	#yDomain = $derived.by(() => {
		const field = this.#channels.y
		const values = this.#data.map((d) => Number(d[field])).filter((v) => Number.isFinite(v))
		const rawMin = values.length > 0 ? Math.min(...values) : 0
		const rawMax = values.length > 0 ? Math.max(...values) : 0
		const min =
			this.#min ?? (this.#baseline !== undefined ? Math.min(rawMin, this.#baseline) : rawMin)
		const max =
			this.#max ?? (this.#baseline !== undefined ? Math.max(rawMax, this.#baseline) : rawMax)
		return [min, max]
	})

	// nice:false — a spark's rightmost point should reach the right edge of its box; the
	// padding nice() adds for pretty tick labels only shrinks the glyph a sparkline has no
	// ticks to label (mirrors the same reasoning as yScale's nice:false below).
	xScale = $derived.by(() =>
		buildUnifiedXScale([this.#data], this.#channels.x, this.#width, { nice: false })
	)

	// nice:false — a spark's peak/trough should reach the edge of its box; the padding
	// nice() adds for pretty tick labels only shrinks the glyph a sparkline has no ticks to label.
	yScale = $derived.by(() =>
		buildUnifiedYScale([this.#data], this.#channels.y, this.#height, {
			domain: this.#yDomain,
			nice: false
		})
	)

	constructor(config = {}) {
		this.update(config)
	}

	// Re-callable: a later task's <Spark> container calls this from an `$effect` on
	// every prop change, so it must fully re-apply config rather than merge deltas.
	update(config = {}) {
		this.#data = config.data ?? []
		this.#channels = config.channels ?? {}
		this.#width = config.width ?? 80
		this.#height = config.height ?? 24
		this.#min = config.min
		this.#max = config.max
		this.#baseline = config.baseline
	}

	get data() {
		return this.#data
	}
	/** @returns {{ x?: string, y?: string }} */
	get channels() {
		return this.#channels
	}
	// Sparks have no margin — width/height ARE the inner box geoms draw into.
	get innerWidth() {
		return this.#width
	}
	get innerHeight() {
		return this.#height
	}
	get chartPreset() {
		return defaultPreset
	}

	// Mirrors PlotState.registerGeom at smaller scope: GeomState.register() (called
	// from a geom's onMount) calls this once per mounted geom and keeps the returned id.
	registerGeom(config) {
		const id = `spark-geom-${nextGeomId++}`
		this.#geoms = [...this.#geoms, { id, ...config }]
		return id
	}

	// untrack the read of #geoms, same as PlotState: GeomState.sync() calls this from
	// a geom's `$effect`, which would otherwise track #geoms as a dependency and retrigger
	// itself on every update (effect_update_depth_exceeded).
	updateGeom(id, config) {
		this.#geoms = untrack(() => this.#geoms).map((g) => (g.id === id ? { ...g, ...config } : g))
	}

	// No untrack needed here (unlike updateGeom above): this only ever runs from a geom's
	// onDestroy, which Svelte always executes outside any reactive tracking scope — there's
	// no enclosing effect for a #geoms read to register against, so no self-retrigger risk
	// exists. Mirrors PlotState.unregisterGeom, which is untrack-free for the same reason.
	unregisterGeom(id) {
		this.#geoms = this.#geoms.filter((g) => g.id !== id)
	}

	// Identity stat returns `this.#data` itself, not a copy — geoms look up rows via
	// `plotState.data.indexOf(row)` (see e.g. Line.svelte's selectPoint), which only
	// works if geomData's rows are the exact same object instances as `data`.
	geomData(id) {
		const geom = this.#geoms.find((g) => g.id === id)
		if (!geom) return []
		const stat = geom.stat ?? 'identity'
		if (stat === 'identity') return this.#data
		// Strip explicit `undefined` values before spreading: geom components always pass
		// every channel key (e.g. Line.svelte's `channels: { x, y, color, fill, symbol }`),
		// so a geom that omits x/y to inherit them from the container sends
		// `{ x: undefined, y: undefined }`, not `{}`. Left unstripped, that `undefined`
		// becomes an own property that overrides the container's value in the spread below,
		// silently clobbering an inherited channel (applyGeomStat's primary-key lookup then
		// finds nothing and falls back to identity with no warning).
		const geomChannels = Object.fromEntries(
			Object.entries(geom.channels ?? {}).filter(([, v]) => v !== undefined)
		)
		const mergedChannels = { ...this.#channels, ...geomChannels }
		return applyGeomStat(this.#data, { stat, channels: mergedChannels })
	}
}
