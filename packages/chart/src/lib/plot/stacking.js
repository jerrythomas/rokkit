import { isLiteralColor } from '../brewing/colors.js'

/**
 * The distinct non-x fields among [group, color, pattern] — the fields that put more than one
 * bar in a single x band (dodge) or more than one segment in a column (stack). `group`, the
 * explicit grouping channel, comes first. Literal colours are paint, not fields.
 *
 * @param {{ x?: string, group?: string, color?: string, pattern?: string }} channels
 * @returns {string[]}
 */
export function subBandFields(channels) {
	const { x: xf, group: gf, color: cf, pattern: pf } = channels
	const out = []
	for (const f of [gf, cf, pf]) {
		if (f && f !== xf && !out.includes(f) && !isLiteralColor(f)) out.push(f)
	}
	return out
}

/**
 * The field a stacked bar stacks by, from a bar's own channels — or null when there is none,
 * in which case the builder draws plain bars. One rule for the builder that draws the stack
 * and the domain that sizes the axis to it: two copies disagreed, and the axis ended below
 * the tallest bar.
 *
 * `group` defaults to the interior (`fill ?? color`), exactly as the bar marks resolve it.
 *
 * @param {{ x?: string, group?: string, fill?: string, color?: string, pattern?: string }} channels
 * @returns {string | null}
 */
export function stackFieldOf({ x, group, fill, color, pattern }) {
	const interior = fill ?? color
	return subBandFields({ x, group: group ?? interior, color: interior, pattern })[0] ?? null
}
