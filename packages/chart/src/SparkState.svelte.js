import { buildUnifiedXScale, buildUnifiedYScale } from './lib/plot/scales.js'
import { defaultPreset } from './lib/preset.js'

/**
 * SparkState — the lean, PlotState-compatible context that lets a sparkline compose
 * real geoms (`<Spark><Line /></Spark>`) instead of Sparkline's own hand-rolled
 * line/area/bar rendering. It publishes on the same 'plot-state' context key as
 * PlotState, so geoms (Line/Area/Bar) read scales, channels and data through the
 * identical interface and never know whether they're inside a spark or a full Plot.
 *
 * An 80×24 glyph has no use for most of what PlotState carries, so this is a thin
 * composition of the same pure scale modules PlotState uses — not a re-implementation
 * of PlotState's scope. Deliberately omitted, permanently (later slices add the geom
 * lifecycle, aesthetics and the <Spark> container, but none of these):
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

	// Mirrors Sparkline's current yMin/yMax logic: an explicit min/max wins; otherwise
	// the domain is the raw data extent, widened to include the baseline when one is
	// set (so a below-baseline dip or an above-baseline spike stays on-canvas).
	#yDomain = $derived.by(() => {
		const field = this.#channels.y
		const values = this.#data.map((d) => Number(d[field]))
		const rawMin = values.length > 0 ? Math.min(...values) : 0
		const rawMax = values.length > 0 ? Math.max(...values) : 0
		const min =
			this.#min ?? (this.#baseline !== undefined ? Math.min(rawMin, this.#baseline) : rawMin)
		const max =
			this.#max ?? (this.#baseline !== undefined ? Math.max(rawMax, this.#baseline) : rawMax)
		return [min, max]
	})

	xScale = $derived.by(() => buildUnifiedXScale([this.#data], this.#channels.x, this.#width))

	yScale = $derived.by(() =>
		buildUnifiedYScale([this.#data], this.#channels.y, this.#height, { domain: this.#yDomain })
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
}
