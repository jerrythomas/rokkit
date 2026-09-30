/**
 * A waterfall's geometry: where each bar starts and ends on the value axis.
 *
 * One function for the builder that draws the bars and the domain that sizes the axis to them —
 * two copies disagreed: the builder drew a negative total as a 1px sliver at zero, and let a
 * missing value turn every later bar into NaN, while the axis was sized as if neither happened.
 *
 * A step runs from the running total before it to the running total after; a total row (flagged
 * by `totalField`) runs from 0 to the running total, in whichever direction that is. A missing
 * or non-numeric value is a step of 0.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {string} field
 * @param {string} [totalField]
 * @returns {Array<{ lo: number, hi: number, total: number, isTotal: boolean, delta: number }>}
 */
export function runningSpans(rows, field, totalField) {
	let running = 0
	return rows.map((d) => {
		const isTotal = Boolean(totalField && d[totalField])
		const delta = isTotal ? 0 : Number(d[field]) || 0
		const start = isTotal ? 0 : running
		running += delta
		return {
			lo: Math.min(start, running),
			hi: Math.max(start, running),
			total: running,
			isTotal,
			delta
		}
	})
}
