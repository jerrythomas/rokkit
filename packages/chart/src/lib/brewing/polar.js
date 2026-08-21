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
		const seen = new Set()
		for (const row of data) {
			const key = row?.[axisField]
			if (key !== undefined && !seen.has(key)) seen.add(key)
		}
		// eslint-disable-next-line no-console
		console.warn(
			'[Radar] No `axes` prop given — falling back to first-appearance order in the data. ' +
				'Radar shape is order-sensitive (adjacent axes read as related), so pass an explicit ' +
				'`axes` array to make the order an analytical choice rather than an accident of row order.'
		)
		return [...seen].map(normaliseAxis)
	}

	const resolved = axes.map(normaliseAxis)

	const declaredKeys = new Set(resolved.map((a) => a.key))
	const dataKeys = new Set()
	for (const row of data) {
		const key = row?.[axisField]
		if (key !== undefined) dataKeys.add(key)
	}
	const dropped = [...dataKeys].filter((key) => !declaredKeys.has(key))
	if (dropped.length > 0) {
		// eslint-disable-next-line no-console
		console.warn(
			`[Radar] Data axis(es) not named in \`axes\` were dropped: ${dropped.join(', ')}. ` +
				'Add them to `axes` if they belong on the chart.'
		)
	}

	return resolved
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
	const { x: axisField, y: valueField } = channels
	const sharedDomain = opts.sharedDomain ?? false

	const valuesByKey = new Map(axes.map((axis) => [axis.key, []]))
	for (const row of data) {
		const values = valuesByKey.get(row?.[axisField])
		if (!values) continue
		const value = row?.[valueField]
		if (Number.isFinite(value)) values.push(value)
	}

	const infer = (values) => {
		if (values.length === 0) return [0, 0]
		const min = Math.min(...values)
		const max = Math.max(...values)
		return min < 0 ? [min, max] : [0, max]
	}

	const shared = sharedDomain ? infer([...valuesByKey.values()].flat()) : null

	return axes.map((axis) => axis.domain ?? shared ?? infer(valuesByKey.get(axis.key)))
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
