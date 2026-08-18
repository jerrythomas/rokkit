import { line, curveCatmullRom } from 'd3-shape'
import { toPatternId } from '../patterns.js'
import { literalColor, markEntry } from '../colors.js'

// Relative widths at each stat anchor (fraction of max half-width)
const DENSITY_AT = { iqr_min: 0.08, q1: 0.55, median: 1.0, q3: 0.55, iqr_max: 0.08 }
const ANCHOR_ORDER = ['iqr_max', 'q3', 'median', 'q1', 'iqr_min']

/**
 * Builds a closed violin shape path for each group.
 * Input rows must have { q1, median, q3, iqr_min, iqr_max } from applyBoxStat.
 *
 * When `fill` differs from `x`, violins are sub-grouped within each x-band
 * (one narrower violin per fill value per x category, like grouped bars).
 * Violin body uses the lighter fill shade; outline uses the darker stroke shade.
 *
 * @param {Object[]} data
 * @param {{ x?: string, fill?: string, pattern?: string }} channels
 *   `fill` drives violin interior and outline (defaults to x-field).
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map} colors
 * @returns {Array}
 */
// Build the silhouette points for one violin. `side` selects half vs full:
//  'right'  → density bulges right of the centre line, flat edge at cx
//  'left'   → density bulges left, flat edge at cx
//  'center' → symmetric (both sides) — the default
function violinPoints(cx, halfMax, d, yScale, side) {
	const right = ANCHOR_ORDER.map((key) => ({ x: cx + halfMax * DENSITY_AT[key], y: yScale(d[key]) }))
	const left = [...ANCHOR_ORDER].reverse().map((key) => ({
		x: cx - halfMax * DENSITY_AT[key],
		y: yScale(d[key])
	}))
	const topY = yScale(d.iqr_max)
	const botY = yScale(d.iqr_min)
	if (side === 'right') return [...right, { x: cx, y: botY }, { x: cx, y: topY }]
	if (side === 'left') return [...left, { x: cx, y: topY }, { x: cx, y: botY }]
	return [...right, ...left, right[0]]
}

export function buildViolins(
	data,
	channels,
	xScale,
	yScale,
	colors,
	place = (x, y) => ({ x, y }),
	side = 'center',
	patterns
) {
	const { x: xf, fill: ff, pattern: pf } = channels
	// A literal fill colours every violin directly; a field sub-groups within each x-band.
	const lit = literalColor(ff)
	const field = lit ? undefined : ff
	const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 40
	const grouped = field && field !== xf
	// Texture fill: patternId per violin from the pattern channel value (null = solid fill).
	const patternIdFor = (d) => {
		const key = pf ? d[pf] : null
		return key !== null && key !== undefined && patterns?.has(key) ? toPatternId(String(key)) : null
	}

	const pathGen = line()
		.x((pt) => pt.x)
		.y((pt) => pt.y)
		.curve(curveCatmullRom.alpha(0.5))

	if (grouped) {
		const fillValues = [...new Set(data.map((d) => d[ff]))]
		const n = fillValues.length
		const subBandWidth = bw / n
		const halfMax = subBandWidth * 0.45

		return data.map((d) => {
			const fillVal = d[ff]
			const subIndex = fillValues.indexOf(fillVal)
			const bandStart = xScale(d[xf]) ?? 0
			const cx = bandStart + subIndex * subBandWidth + subBandWidth / 2
			const colorEntry = markEntry(lit, fillVal, colors, { fill: '#aaa', stroke: '#666' })

			return {
				data: d,
				cx,
				d: pathGen(violinPoints(cx, halfMax, d, yScale, side).map((pt) => place(pt.x, pt.y))),
				fill: colorEntry.fill,
				stroke: colorEntry.stroke,
				patternId: patternIdFor(d)
			}
		})
	}

	// Non-grouped: one violin per x category
	const halfMax = bw * 0.45

	return data.map((d) => {
		const fillKey = field ? d[field] : d[xf]
		const colorEntry = markEntry(lit, fillKey, colors, { fill: '#aaa', stroke: '#666' })
		const cx = (xScale(d[xf]) ?? 0) + (typeof xScale.bandwidth === 'function' ? bw / 2 : 0)

		return {
			data: d,
			cx,
			d: pathGen(violinPoints(cx, halfMax, d, yScale, side).map((pt) => place(pt.x, pt.y))),
			fill: colorEntry.fill,
			stroke: colorEntry.stroke,
			patternId: patternIdFor(d)
		}
	})
}
