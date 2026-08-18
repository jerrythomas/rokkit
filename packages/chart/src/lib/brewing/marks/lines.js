import { line, curveCatmullRom, curveStep } from 'd3-shape'
import { literalColor } from '../colors.js'

/**
 * @param {Object[]} data
 * @param {{ x?: string, y?: string, color?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @returns {{ d: string | null, fill: string, stroke: string, points: {x:number, y:number, data: Record<string, unknown>, i: number}[], key?: unknown }[]}
 */
export function buildLines(data, channels, xScale, yScale, colors, curve, place = (x, y) => ({ x, y })) {
	const { x: xf, y: yf } = channels
	// A literal color (var()/oklch()/hex/currentColor) is NOT a data field — it's the exact
	// stroke the caller wants for THIS geom. Don't group the series on it, and don't fall
	// back to the shared color scale (which is one value across all geoms); use it directly.
	const lit = literalColor(channels.color)
	const cf = lit ? undefined : channels.color
	const xPos = (d) =>
		typeof xScale.bandwidth === 'function' ? xScale(d[xf]) + xScale.bandwidth() / 2 : xScale(d[xf])
	// Screen points, sorted by the x-channel position, each mapped through place() so the
	// whole line transposes under orientation='horizontal' (identity default → unchanged).
	const screenPoints = (rows) => {
		const withIndices = rows.map((d, i) => ({ data: d, i }))
		withIndices.sort((a, b) => xPos(a.data) - xPos(b.data))
		return withIndices.map(({ data: d, i }) => {
			const p = place(xPos(d), yScale(d[yf]))
			return { x: p.x, y: p.y, data: d, i }
		})
	}
	const makeGen = () => {
		const gen = line()
			// A null y-value is a GAP (a missing period), not a zero: break the path there
			// (d3 `.defined`) instead of letting yScale(null) collapse it onto the 0 baseline.
			// A genuine 0 stays defined and plots.
			.defined((p) => Number.isFinite(p.y) && (yf === undefined || yf === null || (p.data?.[yf] !== undefined && p.data?.[yf] !== null)))
			.x((p) => p.x)
			.y((p) => p.y)
		if (curve === 'smooth') gen.curve(curveCatmullRom)
		else if (curve === 'step') gen.curve(curveStep)
		return gen
	}

	if (!cf) {
		const pts = screenPoints(data)
		// A literal color IS the stroke; a single-series field uses the shared shade.
		const stroke = lit ?? colors?.values().next().value?.stroke ?? '#888'
		return [{ d: makeGen()(pts), fill: 'none', stroke, points: pts }]
	}
	const groups = groupBy(data, cf)
	return [...groups.entries()].map(([key, rows]) => {
		const pts = screenPoints(rows)
		const colorEntry = colors?.get(key) ?? { fill: 'none', stroke: '#888' }
		return {
			d: makeGen()(pts),
			fill: 'none',
			stroke: colorEntry.stroke,
			points: pts,
			key
		}
	})
}

function groupBy(arr, field) {
	const map = new Map()
	for (const item of arr) {
		const key = item[field]
		if (!map.has(key)) map.set(key, [])
		map.get(key).push(item)
	}
	return map
}
