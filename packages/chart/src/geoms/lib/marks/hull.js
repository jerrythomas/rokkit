import { convexHull, hullPath } from '../../../lib/hull.js'
import { centroid } from '../../../lib/region.js'
import { resolveFillStroke, resolveAlpha } from '../aesthetics.js'

/** Screen position of one value, or null when the row has no usable coordinate. */
function coord(scale, v) {
	if (v === null || v === undefined || v === '') return null
	const s = scale(v)
	if (s === null || s === undefined || Number.isNaN(s)) return null
	return typeof scale.bandwidth === 'function' ? s + scale.bandwidth() / 2 : s
}

/** Rows bucketed by the group field, in first-seen order. One bucket when there is no field. */
function groupRows(data, field) {
	const groups = new Map()
	for (const row of data) {
		const key = field ? row[field] : null
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key).push(row)
	}
	return groups
}

/**
 * One outline per group of the `fill` (else `color`) channel — ggplot's discrete-colour
 * grouping. The hull is computed in SCREEN space after `place`, so it is convex as drawn,
 * whatever the scales (a hull in data space is not convex on a log axis).
 *
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildHullMarks({ data, plot, channels, alpha, type = 'hull' }) {
	const { xScale, yScale, colors } = plot
	if (!data?.length || !xScale || !yScale) return []
	const groupField = channels.fill ?? channels.color
	const a = resolveAlpha(alpha, type, plot.chartPreset)

	const marks = []
	for (const [key, rows] of groupRows(data, groupField)) {
		const pts = []
		for (const row of rows) {
			const u = coord(xScale, row[channels.x])
			const v = coord(yScale, row[channels.y])
			if (u === null || v === null) continue
			const p = plot.place(u, v)
			pts.push([p.x, p.y])
		}
		if (pts.length === 0) continue
		const hull = convexHull(pts)
		const { fill } = resolveFillStroke(rows[0], { fill: groupField }, colors)
		marks.push({
			key: `hull-${String(key)}`,
			group: key,
			d: hullPath(hull),
			fill,
			alpha: a,
			at: centroid(hull.map(([x, y]) => ({ x, y }))),
			count: rows.length
		})
	}
	return marks
}
