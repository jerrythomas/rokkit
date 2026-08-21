/**
 * Pure polar layout for the radar/spider geom.
 *
 * A radar plots one series across N named axes arranged around a circle, so — unlike
 * a Cartesian chart, where swapping row order never changes the plot — axis ORDER is
 * itself the encoding: adjacent axes create visual peaks and valleys that read as
 * relationships between them. Two axes that are uncorrelated in the data can look
 * strongly linked just because a caller happened to declare them next to each other,
 * and the reverse is true too. So axis order has to be an analytical choice made by
 * whoever configures the chart, not an accident of however the upstream data happened
 * to be sorted.
 *
 * This module holds no Svelte state and reaches into no chart context — it is called
 * from both the `Radar` geom (inside `Plot`) and any future sparkline-style radar, so
 * it must stay a plain data-in/data-out transform.
 */

/**
 * @typedef {Object} AxisSpec
 * @property {string} key - field name in the data this axis reads from
 * @property {string} [label] - display label; defaults to `key`
 * @property {string} [unit] - appended to the label in parentheses for `displayLabel`
 * @property {[number, number]} [domain] - explicit value domain; otherwise inferred later
 * @property {number} [ticks] - number of tick rings to draw
 * @property {string[]} [tickLabels] - custom labels for each tick ring
 * @property {Function} [format] - value formatter for ticks/tooltips
 * @property {number} [weight] - relative angular share of the circle; defaults to 1
 */

/**
 * @typedef {Object} ResolvedAxis
 * @property {string} key
 * @property {string} label
 * @property {string} displayLabel
 * @property {[number, number]} [domain]
 * @property {number} [ticks]
 * @property {string[]} [tickLabels]
 * @property {Function} [format]
 * @property {number} weight
 */

/**
 * Fills in the derived fields shared by every axis, regardless of which of the two
 * accepted shorthand forms it started from.
 *
 * @param {string|AxisSpec} entry
 * @returns {ResolvedAxis}
 */
function normaliseAxis(entry) {
	const spec = typeof entry === 'string' ? { key: entry } : entry
	const label = spec.label ?? spec.key
	return {
		...spec,
		label,
		displayLabel: spec.unit ? `${label} (${spec.unit})` : label,
		weight: spec.weight ?? 1
	}
}

/**
 * Resolves the `axes` prop of a Radar chart to a normalised, ordered list.
 *
 * When `axes` is supplied it is the sole source of truth for both membership and
 * order: axes it names but the data lacks are kept anyway (the geom renders an empty
 * spoke for them — better a visible gap than a silently reshaped polygon), and data
 * axes it doesn't name are dropped, with a dev warning, since silently adding an
 * un-requested spoke would change the shape just as surely as silently reordering one.
 *
 * When `axes` is omitted entirely we fall back to first-appearance order in the data.
 * That fallback exists so a bare `<Radar axis="metric" value="score" />` still renders
 * something, but because radar shape is order-sensitive we warn every time it's used —
 * the resulting order depends on incidental upstream row order, not an analytical
 * choice, and should not be relied on for anything the caller shows to someone else.
 *
 * @param {(string|AxisSpec)[]|undefined} axes
 * @param {Object[]} data
 * @param {string} axisField - the data field naming which axis a row belongs to
 * @returns {ResolvedAxis[]}
 */
export function resolveAxes(axes, data, axisField) {
	if (!axes) {
		warnInferredAxisOrder()
		return axisKeysInData(data, axisField).map(normaliseAxis)
	}

	const resolved = axes.map(normaliseAxis)
	const declaredKeys = new Set(resolved.map((a) => a.key))
	warnDroppedAxes(axisKeysInData(data, axisField).filter((key) => !declaredKeys.has(key)))
	return resolved
}

/**
 * Distinct axis keys present in the data, in first-appearance order. Shared by
 * both branches of `resolveAxes`, which previously walked the rows twice with
 * near-identical loops.
 * @param {Object[]} data
 * @param {string} axisField
 * @returns {unknown[]}
 */
function axisKeysInData(data, axisField) {
	const seen = new Set()
	for (const row of data) {
		const key = row?.[axisField]
		if (key !== undefined) seen.add(key)
	}
	return [...seen]
}

function warnInferredAxisOrder() {
	// eslint-disable-next-line no-console
	console.warn(
		'[Radar] No `axes` prop given — falling back to first-appearance order in the data. ' +
			'Radar shape is order-sensitive (adjacent axes read as related), so pass an explicit ' +
			'`axes` array to make the order an analytical choice rather than an accident of row order.'
	)
}

/** @param {unknown[]} dropped */
function warnDroppedAxes(dropped) {
	if (dropped.length === 0) return
	// eslint-disable-next-line no-console
	console.warn(
		`[Radar] Data axis(es) not named in \`axes\` were dropped: ${dropped.join(', ')}. ` +
			'Add them to `axes` if they belong on the chart.'
	)
}

/**
 * Angle in degrees for each axis — first axis at the top, proceeding clockwise.
 *
 * Each axis owns a wedge proportional to its weight and sits at that wedge's
 * MIDPOINT, so the wedge is symmetric around its spoke. Midpoint placement alone
 * would put axis 0 half a sector past the top, so axis 0's half-wedge is
 * subtracted to rotate the whole diagram back.
 *
 * At equal weights this reduces exactly to -90 + i*360/n. A test asserts that for
 * n=3..6, because an earlier draft of this formula omitted the rotation term and was
 * off by 180/n for every n — nothing sat at the top.
 *
 * @param {number[]} weights - one per axis; non-positive or non-finite treated as 1
 * @returns {number[]} degrees, -90 = top
 */
export function anglesFor(weights) {
	const w = weights.map((x) => (Number.isFinite(x) && x > 0 ? x : 1))
	const total = w.reduce((a, b) => a + b, 0)
	if (!total) return []
	const half0 = w[0] / 2
	let before = 0
	return w.map((wi) => {
		const angle = -90 + (360 * (before + wi / 2 - half0)) / total
		before += wi
		return angle
	})
}

/**
 * Value domain per axis for a radar/spider chart.
 *
 * A radar's most-cited honesty problem is that per-axis domains are usually INFERRED from
 * whichever rows happen to be present: filter a comparator series out of `data` and every
 * remaining series' radius moves, because the domain that normalises it just shrank — the
 * rendered shape becomes a property of the query, not of the entity being plotted. A
 * DECLARED `AxisSpec.domain` fixes this by being used verbatim regardless of which rows are
 * in `data`, so removing a comparator moves nothing. That is why declaring `domain` is the
 * documented recommendation rather than an advanced option — this module's spec asserts the
 * stability directly: the same series computes identical domains with and without a
 * much-larger comparator series under a declared domain, and DIFFERENT domains under an
 * inferred one, so the distinction is provably real rather than assumed.
 *
 * Inferred domains (no declared `domain`) are `[0, max]` for non-negative data. An axis whose
 * values include a negative infers `[min, max]` instead of clamping the low end to 0 —
 * clamping would silently delete the part of the shape that dips below centre, which is a
 * worse failure than an occasionally-asymmetric domain. Non-finite values (a stray string, a
 * missing field) are filtered out of the min/max computation entirely, so they cannot poison
 * a domain to `NaN`.
 *
 * `opts.sharedDomain` collapses every undeclared axis onto one `[min, max]` computed across
 * ALL axes' values (still applying the negatives-extend rule globally, so one negative
 * anywhere widens every shared-mode axis down), for callers who want one consistent scale
 * across mixed axes instead of a per-axis one. A declared `domain` still wins per-axis even
 * when `sharedDomain` is on — declaring an axis is a stronger, more specific statement than a
 * chart-wide default.
 *
 * An axis with no data at all (named in `axes` but absent from every row) gets the finite,
 * degenerate domain `[0, 0]` rather than `NaN` — enough for a caller to render an empty spoke
 * without the radius math blowing up.
 *
 * @param {ResolvedAxis[]} axes
 * @param {Object[]} data
 * @param {{ x: string, y: string }} channels - `x` names the axis field, `y` the value field
 * @param {{ sharedDomain?: boolean }} [opts]
 * @returns {[number, number][]} one domain per axis, positionally aligned with `axes`
 */
export function domainsFor(axes, data, channels, opts = {}) {
	const valuesByKey = finiteValuesByAxis(axes, data, channels)
	const shared = opts.sharedDomain ? inferDomain([...valuesByKey.values()].flat()) : null
	return axes.map((axis) => axis.domain ?? shared ?? inferDomain(valuesByKey.get(axis.key)))
}

/**
 * Finite values bucketed per axis key. Rows naming an axis that isn't declared
 * are skipped — `resolveAxes` has already warned about them.
 * @param {ResolvedAxis[]} axes
 * @param {Object[]} data
 * @param {{ x: string, y: string }} channels
 * @returns {Map<unknown, number[]>}
 */
function finiteValuesByAxis(axes, data, { x: axisField, y: valueField }) {
	const byKey = new Map(axes.map((axis) => [axis.key, []]))
	for (const row of data) {
		const values = byKey.get(row?.[axisField])
		if (!values) continue
		const value = row?.[valueField]
		if (Number.isFinite(value)) values.push(value)
	}
	return byKey
}

/**
 * Domain covering `values`, anchored at 0 unless the data goes negative. An
 * axis with no values gets `[0, 0]` — enough to render an empty spoke without
 * the radius math blowing up (see `radiusFor`).
 * @param {number[]} values
 * @returns {[number, number]}
 */
function inferDomain(values) {
	if (values.length === 0) return [0, 0]
	const min = Math.min(...values)
	const max = Math.max(...values)
	return min < 0 ? [min, max] : [0, max]
}

/**
 * Maps a value to a radius, in pixels, for one axis of a radar/spider chart.
 *
 * The centre is `domain.min`, NOT zero: on a domain of `[-5, 10]` with `R = 100`, a value of 0
 * sits at `R * 5/15 ≈ 33.33`, not at the centre. Centring on 0 unconditionally would silently
 * misplace every axis whose domain doesn't start at zero — this follows `domainsFor`'s own
 * inferred-negative-domain rule (`[min, max]`, never clamped to 0): whatever `domainsFor` decided
 * an axis's low end is, THAT is the value drawn at the centre, not literal zero.
 *
 * `transform` is `'linear'` (`R * ratio`) or `'sqrt'` (`R * sqrt(ratio)`) — see
 * `resolveRadiusTransform` for why a caller would ever want the latter. Anything other than the
 * literal string `'sqrt'` is treated as `'linear'`.
 *
 * Two failure modes are handled explicitly rather than left to produce `NaN`:
 *
 * - A zero-width domain (`min === max`, e.g. the `[0, 0]` `domainsFor` returns for an axis
 *   absent from every row) would divide by zero. Rather than `NaN`, it resolves to `0` — the
 *   centre — continuing the promise `domainsFor`'s own doc comment already makes for that case:
 *   "enough for a caller to render an empty spoke without the radius math blowing up."
 * - A non-finite `value` (missing field, a stray string that slipped past upstream filtering)
 *   returns `null` rather than being coerced to some position. Plotting it anyway — at the
 *   centre, say — would silently reshape the polygon exactly the way `resolveAxes` already
 *   refuses to do for axis membership ("better a visible gap than a silently reshaped polygon").
 *   The geom is expected to break the line at a `null` vertex rather than draw a false one.
 *
 * A finite value outside `[min, max]` is clamped into `[0, R]` rather than left to overshoot the
 * ring (linear) or hand a negative ratio to `sqrt`, which has no real root and would produce
 * `NaN`. `domainsFor` treats an out-of-domain value as "the caller/renderer problem, not
 * domainsFor's" — `radiusFor` *is* that renderer, so this is where the clamp belongs.
 *
 * @param {number} value
 * @param {[number, number]} domain
 * @param {number} R - outer radius in pixels
 * @param {'linear'|'sqrt'} transform
 * @returns {number|null} radius in pixels, or `null` for a non-finite value
 */
export function radiusFor(value, domain, R, transform) {
	if (!Number.isFinite(value)) return null

	const [min, max] = domain
	const span = max - min
	if (span === 0) return 0

	let ratio = (value - min) / span
	if (ratio < 0) ratio = 0
	else if (ratio > 1) ratio = 1

	return transform === 'sqrt' ? R * Math.sqrt(ratio) : R * ratio
}

/**
 * Picks the radius transform for a radar chart, given its axis weights.
 *
 * A wedge's area is ~½θr². `anglesFor` already makes θ (a wedge's angular width) proportional to
 * weight for a weighted radar. If radius stayed linear in value, a heavily-weighted axis would get
 * both a wider wedge AND a radius growing at the ordinary linear rate for the same value — the two
 * compound, so swept area grows faster than `weight × value`, stacking on top of radar's already
 * well-known area exaggeration (a 2x difference in a linear radius already reads as ~4x in swept
 * area). Making radius track `√value` cancels exactly one factor of that compounding: with
 * `r² ∝ value`, area becomes `∝ θ * value ∝ weight * value` — the honest claim a weighted radar is
 * making about its data in the first place. (This module's spec asserts that proportionality
 * numerically rather than arguing it, since it is the entire reason this branch exists.)
 *
 * At equal weights every wedge is the same width regardless of transform, so there is nothing to
 * compensate for — `'linear'` is used, matching conventional radar (whose area exaggeration is a
 * documented, accepted limitation, not something this module tries to fix).
 *
 * `requested` lets a caller pin the transform explicitly; an explicit `'linear'` or `'sqrt'`
 * always wins over the weight-derived choice, so a consumer who has deliberately chosen one never
 * has it silently swapped out from under them the next time someone adds an unequal weight to the
 * axes list.
 *
 * Weights are normalised the same way `anglesFor` normalises them (non-positive or non-finite
 * treated as 1) before the equality check, so this function's answer always matches the wedges
 * `anglesFor` actually draws for the same `weights` array.
 *
 * @param {number[]} weights - one per axis, the same array `anglesFor` would receive
 * @param {'linear'|'sqrt'|'auto'} [requested] - defaults to `'auto'`
 * @returns {'linear'|'sqrt'}
 */
export function resolveRadiusTransform(weights, requested = 'auto') {
	if (requested === 'linear' || requested === 'sqrt') return requested

	const w = weights.map((x) => (Number.isFinite(x) && x > 0 ? x : 1))
	const allEqual = w.every((x) => x === w[0])
	return allEqual ? 'linear' : 'sqrt'
}

/**
 * @typedef {Object} Vertex
 * @property {string} axisKey - the axis this vertex belongs to
 * @property {number} value - the plotted value; the average when the `(series, axis)` cell had
 *   more than one row
 * @property {number} angle - degrees, taken from `angles` at this axis's position
 * @property {number} radius - pixels, from `radiusFor`; never `null` here because `value` is
 *   always finite by construction (non-finite readings are filtered out before averaging)
 * @property {Record<string, unknown>} row - one of the original rows for this cell, chosen so `===` identity with
 *   the container's `data` array survives averaging
 */

/**
 * Turns rows into one polygon's worth of vertices per series, positionally aligned with `axes`.
 *
 * A row belongs to the `(series, axis)` cell identified by `channels.color` (or the single
 * implicit series `undefined`, when no series channel is given at all) crossed with
 * `channels.x`. Two situations a naive per-cell lookup would mishandle are resolved explicitly,
 * for reasons that matter more than they look like they should:
 *
 * DUPLICATE cells — more than one row landing on the same `(series, axis)` pair — are averaged
 * HERE, inside this module, rather than by routing through the generic `stat`/`applyGeomStat`
 * machinery the rest of the package uses for aggregation. `applyGeomStat` calls
 * `groupDataByKeys`, which builds a FRESH row object containing only the group-by keys plus the
 * summarised value — a new allocation that fails `===` identity against anything in the
 * container's `data` array. Every geom in this package computes its `onselect` index as
 * `plotState.data.indexOf(row)`, so an aggregated row would report `index: -1` and silently drop
 * every field that wasn't a channel. That is not a rare edge case for radar: long-format
 * `(series × axis)` data duplicating a cell is the single most common data-shape mistake a radar
 * consumer will make, so aggregation cannot be allowed to degrade interactivity the way a generic
 * stat would. The fix: average the values, but keep a reference to one of the ORIGINAL row
 * objects (the first one encountered) as the vertex's `row`, so identity survives. A repeated
 * `(series, axis)` pair also `console.warn`s in dev, matching this file's existing warn
 * register — axis is a small, fixed enum rather than a repeated-measurement field, so a duplicate
 * is almost always a mistake rather than intentional multiple sampling.
 *
 * MISSING cells — a `(series, axis)` pair with no matching row at all, or one whose only
 * matching row(s) all have a non-finite value — resolve to `null`, never to a value of `0`. Zero
 * is a real, meaningful position on almost every axis (the centre, per `radiusFor`'s own
 * contract), so defaulting a gap to it would silently invent a score and render as a real low
 * value rather than as missing data — the same "better a visible gap than a silently reshaped
 * polygon" principle `resolveAxes` already applies to axis membership. The geom is expected to
 * break the polygon's outline at a `null` vertex instead of drawing a line through it.
 *
 * The geometry arguments travel as one bag rather than six positionals, matching `ringsFor`'s
 * `(axes, { R, rings, domains, transform })` shape. At the call site that is the difference
 * between `verticesFor(data, axes, angles, domains, 100, 'linear', channels)` — where the reader
 * has to count commas to learn what `100` and `'linear'` mean — and naming each one.
 *
 * @param {Object[]} data
 * @param {ResolvedAxis[]} axes - from `resolveAxes`; vertex order follows this array
 * @param {{ x: string, y: string, color?: string }} channels - `x` names the axis field, `y` the
 *   value field, `color` the series field — mirroring `fill ?? color`'s role as the series
 *   channel in every other geom. Omitting it entirely means one implicit series.
 * @param {Object} geometry
 * @param {number[]} geometry.angles - from `anglesFor(axes.map(a => a.weight))`, aligned with `axes`
 * @param {[number, number][]} geometry.domains - from `domainsFor`, aligned with `axes`
 * @param {number} geometry.R - outer radius in pixels, forwarded to `radiusFor`
 * @param {'linear'|'sqrt'} geometry.transform - forwarded to `radiusFor`
 * @returns {Map<unknown, (Vertex|null)[]>} one entry per distinct series value (or the single key
 *   `undefined` when `channels.color` is omitted), each holding one vertex — or `null` for a
 *   gap — per axis, in `axes` order
 */
export function verticesFor(data, axes, channels, { angles, domains, R, transform }) {
	const { y: valueField } = channels
	const cells = cellsBySeriesAndAxis(data, channels)

	const result = new Map()
	for (const [seriesKey, bySeries] of cells) {
		const vertices = axes.map((axis, i) => {
			const rows = bySeries.get(axis.key)
			if (!rows) return null
			const value = cellValue(rows, { axisKey: axis.key, seriesKey, valueField })
			if (value === null) return null
			return {
				axisKey: axis.key,
				value,
				angle: angles[i],
				radius: radiusFor(value, domains[i], R, transform),
				row: rows[0]
			}
		})
		result.set(seriesKey, vertices)
	}

	return result
}

/**
 * Group rows two levels deep, series → axis → rows, because a radar cell is
 * identified by the `(series, axis)` pair rather than by either alone.
 * @param {Object[]} data
 * @param {{ x: string, color?: string }} channels
 * @returns {Map<unknown, Map<unknown, Object[]>>}
 */
function cellsBySeriesAndAxis(data, { x: axisField, color: seriesField }) {
	const cells = new Map()
	for (const row of data) {
		const seriesKey = seriesField !== undefined ? row?.[seriesField] : undefined
		const axisKey = row?.[axisField]
		if (!cells.has(seriesKey)) cells.set(seriesKey, new Map())
		const bySeries = cells.get(seriesKey)
		if (!bySeries.has(axisKey)) bySeries.set(axisKey, [])
		bySeries.get(axisKey).push(row)
	}
	return cells
}

/**
 * The single value a `(series, axis)` cell contributes: the mean of its finite
 * values, or `null` when it has none. See this module's `verticesFor` doc for
 * why a repeated pair is averaged AND warned about rather than silently picked.
 * @param {Object[]} rows
 * @param {{ axisKey: unknown, seriesKey: unknown, valueField: string }} cell
 * @returns {number|null}
 */
function cellValue(rows, { axisKey, seriesKey, valueField }) {
	if (rows.length > 1) warnDuplicateCell(rows.length, axisKey, seriesKey)
	const values = rows.map((row) => row[valueField]).filter(Number.isFinite)
	if (values.length === 0) return null
	return values.reduce((a, b) => a + b, 0) / values.length
}

/**
 * @param {number} count
 * @param {unknown} axisKey
 * @param {unknown} seriesKey
 */
function warnDuplicateCell(count, axisKey, seriesKey) {
	// eslint-disable-next-line no-console
	console.warn(
		`[Radar] Duplicate (series, axis) cell — axis "${axisKey}"` +
			`${seriesKey !== undefined ? `, series "${seriesKey}"` : ''} has ${count} rows; ` +
			'averaging their values. A repeated (series, axis) pair is almost always a data bug, ' +
			'since axis is a small fixed enum rather than a repeated-measurement field.'
	)
}

/**
 * @typedef {Object} Ring
 * @property {number} radius - pixels from centre
 * @property {(string|number)[]} labels - one label per axis, positionally aligned with `axes`
 */

/**
 * How many concentric rings the shared grid draws, and why it can only ever be one number
 * for the whole chart rather than one per axis.
 *
 * @param {ResolvedAxis[]} axes
 * @param {number} fallbackRings
 * @returns {number}
 */
function resolveRingCount(axes, fallbackRings) {
	const ticks = axes.map((axis) => axis.ticks)
	// Vacuously false when axes is empty, which is what we want: nothing to agree on, so fall
	// through to the fallback rather than reading `ticks[0]` off an empty array.
	const uniform = axes.length > 0 && ticks.every((t) => t !== undefined && t === ticks[0])
	if (uniform) return ticks[0]

	if (ticks.some((t) => t !== undefined)) {
		// eslint-disable-next-line no-console
		console.warn(
			'[Radar] AxisSpec.ticks differ across axes — falling back to `opts.rings` ' +
				`(${fallbackRings}) for the shared grid. The geom draws ONE grid, common to every ` +
				'spoke, so per-spoke ring counts cannot be honoured; declare the same `ticks` on ' +
				'every axis if a ring is meant to read as "k of n" everywhere.'
		)
	}
	return fallbackRings
}

/**
 * Inverts `radiusFor` to answer "what value does ring `ratio` (a fraction of R) sit at, on
 * THIS axis's domain and transform?" — needed because rings are laid out evenly in RADIUS
 * (see `ringsFor`), so the value a given ring represents depends on the axis's domain and,
 * under `sqrt`, on the transform too: `radius = R * sqrt(ratio)` inverts to `valueRatio =
 * ratio^2`, not `ratio` itself.
 *
 * @param {number} ratio - `i / ringCount`, the SAME fraction of R every ring uses
 * @param {[number, number]} domain
 * @param {'linear'|'sqrt'} transform
 * @returns {number}
 */
function valueAtRing(ratio, domain, transform) {
	const [min, max] = domain
	const valueRatio = transform === 'sqrt' ? ratio ** 2 : ratio
	return min + valueRatio * (max - min)
}

/**
 * Concentric grid rings for a radar chart — one shared set of circles, evenly spaced in
 * RADIUS, that every spoke is drawn against.
 *
 * Ring *i* sits at `(i / ringCount) * R`. This follows directly from `radiusFor`'s own linear
 * mapping between radius and normalised position: since every spoke shares one `R` and the
 * grid is one set of concentric circles (not one grid per axis), the only spacing that keeps
 * "ring 2 is twice as far out as ring 1" true on EVERY spoke simultaneously is spacing by
 * radius. Spacing the rings evenly in VALUE instead would only coincide with this for a
 * domain that starts at 0 (see the spec: a `[20, 120]`-style domain exposes the divergence,
 * because splitting an unanchored domain into equal value steps and converting each through
 * `radiusFor` on ITS OWN axis does not reduce to `(i/ringCount) * R` the way it would for a
 * zero-anchored domain).
 *
 * Ring COUNT has to be one number for the whole grid, because there is only one grid, drawn
 * once. When every `AxisSpec` declares the same `ticks`, that count is used verbatim and ring
 * *k* genuinely means "k of n" on every spoke. When they disagree, honouring any one axis's
 * count would silently mislabel every other axis's rings, so this falls back to `opts.rings`
 * (default 4) and warns — the geom cannot draw a different number of rings per spoke.
 *
 * Ring LABELS are resolved per axis (each ring has one label per axis, since the same radius
 * means a different value on each spoke): a declared `tickLabels` entry wins outright — it is
 * the ordinal vocabulary of a Likert-style axis and has no "value" to compute at all. Absent
 * that, the ring's value on that axis (via `valueAtRing`) is run through the axis's `format`
 * if one is given, else left as the bare number. A DECLARED domain makes this value a stable,
 * meaningful tick; an INFERRED one (no `domain` supplied anywhere for this axis) makes it only
 * an approximation of "if the current rows were the whole story."
 *
 * @param {ResolvedAxis[]} axes
 * @param {{ R: number, rings?: number, domains?: [number, number][], transform?: 'linear'|'sqrt' }} opts
 * @returns {Ring[]}
 */
export function ringsFor(axes, opts = {}) {
	const { R, rings: fallbackRings = 4, domains, transform = 'linear' } = opts
	const ringCount = resolveRingCount(axes, fallbackRings)

	return Array.from({ length: ringCount }, (_, idx) => {
		const i = idx + 1
		const radius = (i / ringCount) * R
		const labels = axes.map((axis, axisIndex) => {
			if (Array.isArray(axis.tickLabels) && axis.tickLabels[idx] !== undefined) {
				return axis.tickLabels[idx]
			}
			const domain = domains?.[axisIndex] ?? axis.domain ?? [0, 0]
			const value = valueAtRing(i / ringCount, domain, transform)
			return typeof axis.format === 'function' ? axis.format(value) : value
		})
		return { radius, labels }
	})
}

/**
 * Zero-reference marker, per axis — a dashed ring segment (in the geom, not here) at the
 * radius where the value 0 actually sits on that spoke.
 *
 * `radiusFor` centres each spoke on `domain.min`, not on 0, because `domainsFor` lets a
 * negative value extend a domain rather than clamping it. That is honest about the data but
 * has a real cost: the hub means a DIFFERENT value on every spoke whose domain doesn't start
 * at 0, so a reader has no way to tell where "nothing" is just by looking at the centre. An
 * all-zeros row would then bow OUTWARD to wherever 0 lands on each axis instead of collapsing
 * to a point at the centre — the opposite of how a radar's most basic case is meant to read.
 *
 * So: any axis whose domain CONTAINS zero (`min <= 0 <= max`) but does not START there
 * (`min !== 0`) gets a marker at `radiusFor(0, domain, R, transform)`. Two axes need none:
 *
 * - `min === 0` — the hub already is zero, nothing to mark.
 * - the domain EXCLUDES zero entirely (`min > 0` or `max < 0`) — there is no honest position
 *   for "zero" ON this spoke at all. `radiusFor` would clamp value `0` to whichever end of
 *   `[0, R]` is nearest, which is exactly the position `domain.min` already occupies — drawing
 *   a "this is zero" marker there would misrepresent `domain.min` as zero, which is worse than
 *   drawing nothing. This module returns `null` for that case rather than a clamped radius.
 *
 * @param {ResolvedAxis[]} axes
 * @param {[number, number][]} domains - aligned with `axes`, from `domainsFor`
 * @param {number} R
 * @param {'linear'|'sqrt'} transform
 * @returns {(number|null)[]} one entry per axis, positionally aligned with `axes`
 */
export function zeroRingFor(axes, domains, R, transform) {
	return axes.map((_, i) => {
		const [min, max] = domains[i]
		const containsZero = min <= 0 && max >= 0
		return containsZero && min !== 0 ? radiusFor(0, domains[i], R, transform) : null
	})
}

/**
 * @typedef {Object} RadarLayout
 * @property {ResolvedAxis[]} axes
 * @property {number[]} angles - from `anglesFor`, aligned with `axes`
 * @property {[number, number][]} domains - from `domainsFor`, aligned with `axes`
 * @property {Map<unknown, (import('./polar.js').Vertex|null)[]>} series - from `verticesFor`
 * @property {Ring[]} rings - from `ringsFor`
 * @property {(number|null)[]} zeroRings - from `zeroRingFor`, aligned with `axes`
 * @property {number} radius - the outer radius, `R`, every other measurement is relative to
 * @property {'linear'|'sqrt'} transform - resolved via `resolveRadiusTransform`
 */

/**
 * Composes every piece of this module into the one call a `Radar` geom actually needs — the
 * public entry point, and the reason the rest of the module is allowed to stay a set of small,
 * separately-testable functions instead of one large one.
 *
 * This function makes the ordering dependency between those functions explicit, because it is
 * real, not incidental: `axes` must exist before weights can be read off it for `anglesFor`/
 * `resolveRadiusTransform`; domains must exist before `verticesFor` (which places vertices) or
 * `zeroRingFor` (which needs to know each axis's centre) can run; and the resolved `transform`
 * must be shared between `verticesFor` and `ringsFor`/`zeroRingFor` so a ring drawn at "80% of
 * R" and a vertex plotted at "80% of R" agree on what value that actually represents.
 *
 * `channels` follows the same `{ x, y, color? }` convention as `domainsFor`/`verticesFor` — `x`
 * names the axis field, `y` the value field, `color` the series field. `opts.axes` is the
 * `Radar` component's own `axes` prop (bare strings, full `AxisSpec`s, or a mix — see
 * `resolveAxes`); `opts.R` defaults to `100` so this function is independently callable (by
 * tests, tooling, anything that isn't a geom mid-render) without having to invent a pixel
 * radius — a real `Radar.svelte` is expected to pass its actual computed outer radius instead.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {{ axes?: (string|AxisSpec)[], sharedDomain?: boolean, rings?: number,
 *   radiusScale?: 'linear'|'sqrt'|'auto', R?: number }} [opts]
 * @returns {RadarLayout}
 */
export function buildRadarLayout(data, channels, opts = {}) {
	const R = opts.R ?? 100
	const axes = resolveAxes(opts.axes, data, channels.x)
	const weights = axes.map((axis) => axis.weight)
	const angles = anglesFor(weights)
	const domains = domainsFor(axes, data, channels, { sharedDomain: opts.sharedDomain })
	const transform = resolveRadiusTransform(weights, opts.radiusScale)
	const series = verticesFor(data, axes, channels, { angles, domains, R, transform })
	const rings = ringsFor(axes, { R, rings: opts.rings, domains, transform })
	const zeroRings = zeroRingFor(axes, domains, R, transform)

	return { axes, angles, domains, series, rings, zeroRings, radius: R, transform }
}
