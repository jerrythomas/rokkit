import { untrack } from 'svelte'
import { buildUnifiedXScale, buildUnifiedYScale } from './lib/plot/scales.js'
import { defaultPreset } from './lib/preset.js'
import { applyGeomStat } from './lib/plot/stat.js'
import { distinct, assignColors } from './lib/brewing/colors.js'
import { PATTERNS } from './patterns/patterns.js'

let nextGeomId = 0

/**
 * The full set of members a geom reads off its `'plot-state'` context — derived by
 * scanning every geom for `plotState.*` / `plot.*` / `state.*` reads (`geoms/*.svelte`,
 * `geoms/lib/**`, including the `marks/*.js` adapters). `SparkState` must implement
 * every one of these: a `<Spark>` composes the SAME geom components a `<Plot>` does,
 * and no geom branches on which container it's inside — so a member missing here is a
 * member that throws inside a `<Spark>` at runtime, not at the point that grew it.
 *
 * This is the ONE place to update when that surface legitimately changes. Adding a
 * geom (or a new context read inside an existing one) that needs a `PlotState` member
 * means adding it here too. `spec/spark-contract.spec.js` asserts `SparkState` and
 * `PlotState` both satisfy this exact list and agree on each member's kind (function /
 * Map / array / null / primitive). If that test goes red after you add a member here,
 * that is the signal working as intended — it means `SparkState` is missing the
 * member, not that the test is wrong. Do not "fix" a red conformance test by deleting
 * the entry you just added.
 *
 * Deliberately excluded — read only by `Plot`'s chrome (`Axis`/`Legend`/`Tooltip`/
 * `Grid`) or by `PlotSurface`'s own wiring, never by a geom: `xAxisY`, `yAxisX`,
 * `hovered`, `mode`, `colorScaleType`, `geomTypes`, `colorField`, `patternField`,
 * `symbolField`, `format`, `label`, `tooltip`, `margin`, `bandScale`, `valueScale`,
 * `preset`, `geomComponent`. A `<Spark>` has no axis, legend, tooltip or grid to
 * drive, so none of these ever apply.
 *
 * Also excluded: `selectedRows` / `isSelected` / `setSelected` / `clearSelected` /
 * `applyZoom` / `resetZoom`. `geoms/Highlight.svelte` is the one geom that reads
 * `state?.selectedRows`, but it does so defensively (`?? []`) — multi-select and zoom
 * are explicit non-goals for a spark (see
 * docs/superpowers/specs/2026-08-20-spark-plot-geom-architecture-design.md), so their
 * absence degrades Highlight to "nothing selected", not a runtime error. That's a
 * different failure mode than every member below, where absence throws.
 */
export const GEOM_CONTRACT = [
	// ─── Scales + dimensions ───────────────────────────────────────────────────
	'xScale',
	'yScale',
	'innerWidth',
	'innerHeight',
	// ─── Geom lifecycle ────────────────────────────────────────────────────────
	'registerGeom',
	'updateGeom',
	'unregisterGeom',
	'geomData',
	// ─── Data ──────────────────────────────────────────────────────────────────
	'data',
	'channels',
	// ─── Aesthetics ────────────────────────────────────────────────────────────
	'colors',
	'patterns',
	'symbols',
	'chartPreset',
	// ─── Orientation ───────────────────────────────────────────────────────────
	'place',
	'isFlipped',
	'orientation',
	// ─── Colour typing ─────────────────────────────────────────────────────────
	'continuousCategory',
	'continuousColorScale',
	// ─── Interactivity ─────────────────────────────────────────────────────────
	'interactive',
	'handleSelect',
	'setHovered',
	'clearHovered'
]

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
 * omitted, permanently (a <Spark> container is a later slice, but none of these ever
 * apply to an 80×24 glyph):
 *  - zoom/pan transforms — a spark is a static glyph, never panned or zoomed.
 *  - crossfilter/selection — nothing to click or brush at this size.
 *  - facets — a spark is always a single small panel, never a grid of panels.
 *  - axis/legend chrome and margins — width/height ARE the inner box.
 *
 * This class also carries the rest of the surface a geom reads off `plot-state`:
 * `colors` — a real categorical palette, built from the same brewing helpers PlotState
 * uses, keyed off `channels.color ?? channels.fill` — plus a set of members geoms read
 * but a spark has no use for (symbols/isFlipped/orientation/continuousCategory/
 * continuousColorScale/interactive/place/setHovered/clearHovered/handleSelect). Those are
 * kept present and explicit — empty Maps, false/null/identity, no-op methods — rather
 * than simply absent, so a geom never needs a spark-specific branch and a later
 * conformance test can pin the full contract. `patterns` is the one exception with a real,
 * non-empty case — see its own doc comment below for why a literal name is the only
 * sensible spark case.
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
	#pattern = $state(undefined)
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

	// Colors: Map<seriesKey, { fill, stroke }> for the one series a spark renders. Mirrors
	// PlotState.colors at spark scope — no colorDomain override, no cross-geom union, no
	// isLiteralColor handling, because a spark has exactly one geom's worth of channels
	// and its color/fill channel always names a data field, never a literal CSS color.
	// Falls back to a single-entry palette (a flat one-color glyph) when there's no
	// color/fill channel at all, so a geom's `colors.get(key)` lookup is never empty-handed.
	colors = $derived.by(() => {
		const field = this.#channels.color ?? this.#channels.fill
		const values = field ? distinct(this.#data, field) : [null]
		return assignColors(values, 'light', defaultPreset)
	})

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
		this.#pattern = config.pattern
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

	// ─── Inert members ──────────────────────────────────────────────────────────
	// Every member below is read by some geom through the shared 'plot-state' context —
	// e.g. Line.svelte calls `plotState.patterns.get(key)` and `plotState.place(u, v)`
	// unconditionally, with no branch for "am I inside a Plot or a Spark?" Kept present
	// and explicit (not simply absent) so that contract holds for a spark too.

	// A spark never sets a pattern CHANNEL (there's no per-row field to group on), but a
	// `<Spark pattern="diagonal">` prop names a single, literal pattern to texture the
	// whole fill with. PlotState's `patterns` Map exists to solve "which of these several
	// distinct field values gets which pattern from PATTERN_ORDER" — `assignPatterns`
	// solves that BY INDEX. A spark is single-series: that grouping problem does not
	// exist here, so there is nothing to assign an index to. "Texture this fill" is the
	// only meaning `pattern` can have on a spark, and the value already IS the pattern
	// name — so the Map self-maps it (`[[name, name]]`) instead of going through
	// `assignPatterns`, which would silently substitute PATTERN_ORDER[0] regardless of
	// what was asked for.
	//
	// This still routes through the exact shared mechanism PlotState uses, unchanged:
	// `DefinePatterns` iterates `[key, patternName]` and renders `<pattern
	// id={toPatternId(key)}>`; `buildAreas`/`buildBars` independently compute
	// `toPatternId(row[patternField])` and fill with `url(#...)`. Both call `toPatternId`
	// on the SAME value here (the literal name), so they agree by construction — no geom
	// or pattern-consuming helper needs to know a spark is involved at all.
	//
	// An unset or unknown name (not a key of PATTERNS) falls through to an empty Map —
	// same reasoning as `assignPatterns` never inventing a texture for a channel that
	// isn't there: a typo'd pattern name must not silently resolve to SOME pattern, and
	// `DefinePatterns` skips any Map entry whose name isn't a real `PATTERNS` key anyway
	// (`patterns[patternName] ?? []`), so keeping a bogus entry out of the Map here is
	// belt-and-braces, not load-bearing.
	// A plain Map (not SvelteMap): this is a fresh value on every read, built from `#pattern`
	// (a $state field), so reactivity is already covered by that read — nothing here needs
	// its own reactive container.
	get patterns() {
		if (this.#pattern !== undefined && Object.hasOwn(PATTERNS, this.#pattern)) {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			return new Map([[this.#pattern, this.#pattern]])
		}
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		return new Map()
	}
	get symbols() {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		return new Map()
	}
	// A spark has no axis to stand up or lie down — "flipped" describes rotating a
	// category axis onto the screen's vertical, which doesn't exist at this size.
	get isFlipped() {
		return false
	}
	// Fixed for the same reason as isFlipped — there's no axis to be vertical/horizontal
	// about. 'vertical' matches PlotState's own default for an unresolved orientation.
	get orientation() {
		return 'vertical'
	}
	// continuousCategory only matters for a banded x-axis kept linear so tweened
	// positions stay smooth (a bar-chart race) — a spark has no band axis to keep linear.
	get continuousCategory() {
		return false
	}
	// No sequential/diverging scale — `colors` above is always the categorical map, so a
	// geom that checks continuousColorScale before falling back to `colors` takes the
	// categorical path, same as it would for a plain categorical Plot.
	get continuousColorScale() {
		return null
	}
	// A spark has no onselect prop and no legend to drive off hover/click — nothing
	// on it is ever clickable.
	get interactive() {
		return false
	}
	// Identity: a spark's screen is never flipped (see isFlipped above), so a geom's
	// u/v scale outputs map straight through to x/y with no axis swap.
	place(u, v) {
		return { x: u, y: v }
	}
	// No-ops: geoms call these from hover/click handlers, which a spark never wires up
	// (see `interactive` above) — there's no hover/selection state here to record.
	setHovered() {}
	clearHovered() {}
	handleSelect() {}

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
