import { contourDensity } from 'd3-contour'
import { resolveFillStroke, resolveAlpha } from '../aesthetics.js'

/** Screen position of one value, or null when the row has no usable coordinate. */
function coord(scale, v) {
	if (v === null || v === undefined || v === '') return null
	const s = scale(v)
	if (s === null || s === undefined || Number.isNaN(s)) return null
	return typeof scale.bandwidth === 'function' ? s + scale.bandwidth() / 2 : s
}

/**
 * SVG path data for a GeoJSON MultiPolygon's coordinates — every ring of every polygon a
 * closed subpath, so holes cut out under the default nonzero/evenodd rules d3-contour's
 * winding produces.
 *
 * @param {number[][][][]} coordinates
 */
export function multiPolygonPath(coordinates) {
	const fmt = (/** @type {number} */ n) => Math.round(n * 100) / 100
	return coordinates
		.flatMap((polygon) => polygon.map((ring) => `M${ring.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join('L')}Z`))
		.join('')
}

function groupRows(data, field) {
	const groups = new Map()
	for (const row of data) {
		const key = field ? row[field] : null
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key).push(row)
	}
	return groups
}

/** Screen points for a group's rows, after orientation `place`. */
function screenPoints(rows, plot, channels) {
	const pts = []
	for (const row of rows) {
		const u = coord(plot.xScale, row[channels.x])
		const v = coord(plot.yScale, row[channels.y])
		if (u === null || v === null) continue
		const p = plot.place(u, v)
		pts.push([p.x, p.y])
	}
	return pts
}

/**
 * Kernel-density contours per group of the `fill` (else `color`) field.
 *
 * Density is estimated in SCREEN space over the plot area, so `bandwidth` is in pixels — the
 * unit a reader judges smoothness in — and the result is the same at any data scale. Level 0
 * is the outermost (lowest-density) ring; filled bands ramp opacity toward `alpha` at the
 * densest core, so pile-ups read darkest.
 *
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildContourMarks({ data, plot, channels, options = {}, alpha, type = 'contour' }) {
	if (!data?.length || !plot.xScale || !plot.yScale) return []
	const groupField = channels.fill ?? channels.color
	const a = resolveAlpha(alpha, type, plot.chartPreset)
	const w = Math.max(1, Math.round(plot.innerWidth))
	const h = Math.max(1, Math.round(plot.innerHeight))

	const marks = []
	for (const [key, rows] of groupRows(data, groupField)) {
		const pts = screenPoints(rows, plot, channels)
		if (pts.length === 0) continue
		const density = contourDensity()
			.x((d) => d[0])
			.y((d) => d[1])
			.size([w, h])
			.bandwidth(options.bandwidth ?? 20)
			.thresholds(options.thresholds ?? 8)(pts)
		const { fill, stroke } = resolveFillStroke(rows[0], { fill: channels.fill, color: channels.color }, plot.colors)
		density.forEach((level, i) => {
			marks.push({
				key: `contour-${String(key)}-${i}`,
				group: key,
				level: i,
				value: level.value,
				d: multiPolygonPath(level.coordinates),
				fill,
				stroke,
				fillAlpha: (a * (i + 1)) / density.length
			})
		})
	}
	return marks
}
