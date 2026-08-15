import { pie, arc } from 'd3-shape'
import { toPatternId } from '../../brewing/patterns.js'

/**
 * Builds arc geometry for pie/donut charts.
 * @param {Record<string, unknown>[]} data
 * @param {{ color?: string, y?: string, pattern?: string }} channels
 * @param {Map} colors
 * @param {number} width
 * @param {number} height
 * @param {{ innerRadius?: number }} opts
 * @param {Map<unknown, string>} [patterns]
 * @returns {{ d: string | null, fill: string, stroke: string, key: unknown, patternId: string | null, pct: number, centroid: [number, number], data: Record<string, unknown> }[]}
 */
export function buildArcs(data, channels, colors, width, height, opts = {}, patterns) {
	const { color: lf, y: yf } = channels
	const radius = Math.min(width, height) / 2
	// innerRadius: a value <= 1 is a fraction of the radius (responsive donut);
	// a value > 1 is absolute pixels. Clamp below the outer radius so a bad value
	// (e.g. a fraction/pixel mixup) can never invert the arc into a giant ring
	// rendered outside the circle.
	const rawInner = opts.innerRadius ?? 0
	const innerPx = rawInner <= 1 ? rawInner * radius : rawInner
	const innerRadius = Math.max(0, Math.min(innerPx, radius * 0.98))
	const pieGen = pie().value((d) => Number(d[yf]))
	const arcGen = arc().innerRadius(innerRadius).outerRadius(radius)
	const slices = pieGen(data)
	const total = slices.reduce((s, sl) => s + (sl.endAngle - sl.startAngle), 0)
	// Label radius: midpoint between inner and outer (or 70% out for solid pie)
	const labelRadius = innerRadius > 0 ? (innerRadius + radius) / 2 : radius * 0.65
	const labelArc = arc().innerRadius(labelRadius).outerRadius(labelRadius)
	return slices.map((slice) => {
		const key = slice.data[lf]
		const colorEntry = colors?.get(key) ?? { fill: '#888', stroke: '#fff' }
		const patternId =
			key !== null && key !== undefined && patterns?.has(key) ? toPatternId(String(key)) : null
		const pct = Math.round(((slice.endAngle - slice.startAngle) / total) * 100)
		const [cx, cy] = labelArc.centroid(slice)
		return {
			d: arcGen(slice),
			fill: colorEntry.fill,
			stroke: colorEntry.stroke,
			key,
			patternId,
			pct,
			centroid: [cx, cy],
			data: slice.data
		}
	})
}
