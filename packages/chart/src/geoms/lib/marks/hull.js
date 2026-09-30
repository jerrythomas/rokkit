import { convexHull, hullPath } from '../../../lib/hull.js'
import { centroid } from '../../../lib/region.js'
import { resolveFillStroke, resolveAlpha } from '../aesthetics.js'
import { groupRows, screenPoints } from '../grouping.js'

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
		const pts = screenPoints(rows, plot, channels)
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
