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
