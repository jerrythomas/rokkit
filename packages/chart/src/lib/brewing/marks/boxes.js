import { toPatternId } from '../patterns.js'

/**
 * Builds box geometry for box plot charts.
 * Input data rows must already contain { q1, median, q3, iqr_min, iqr_max } —
 * computed by applyBoxStat before reaching this function.
 *
 * When `fill` differs from `x`, boxes are sub-grouped within each x-band
 * (one narrower box per fill value per x category, like grouped bars).
 * Box body uses the lighter fill shade; whiskers and median use the darker stroke shade.
 *
 * @param {Object[]} data - Pre-aggregated rows with quartile fields
 * @param {{ x?: string, fill?: string, pattern?: string }} channels
 *   `fill` drives the box and whisker color (defaults to x-field).
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map<unknown, {fill:string, stroke:string}>} colors
 * @param {{ side?: 'left'|'right'|'center', width?: number, patterns?: Map<unknown, string> }} [opts]
 *   `side` offsets the box to one half of the band; `width` is the box thickness as a
 *   fraction of the (sub-)band (for a thin raincloud box); `patterns` maps a pattern-channel
 *   value to a pattern name for texture fills. Defaults preserve the full box.
 * @returns {Array}
 */
export function buildBoxes(data, channels, xScale, yScale, colors, opts = {}) {
	const { x: xf, fill: ff, pattern: pf } = channels
	const { side = 'center', width, patterns } = opts
	const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 20
	const grouped = ff && ff !== xf
	// Offset the box centre to the middle of the chosen half-lane.
	const laneOffset = (unit) => (side === 'left' ? -unit / 4 : side === 'right' ? unit / 4 : 0)
	// Texture fill: patternId per box from the pattern channel value (null = solid fill).
	const patternIdFor = (d) => {
		const key = pf ? d[pf] : null
		return key !== null && key !== undefined && patterns?.has(key) ? toPatternId(String(key)) : null
	}

	if (grouped) {
		const fillValues = [...new Set(data.map((d) => d[ff]))]
		const n = fillValues.length
		const subBandWidth = bw / n
		const boxWidth = width !== undefined ? subBandWidth * width : subBandWidth * 0.75
		const whiskerWidth = width !== undefined ? boxWidth * 0.53 : subBandWidth * 0.4

		return data.map((d) => {
			const fillVal = d[ff]
			const subIndex = fillValues.indexOf(fillVal)
			const bandStart = xScale(d[xf]) ?? 0
			const cx = bandStart + subIndex * subBandWidth + subBandWidth / 2 + laneOffset(subBandWidth)
			const colorEntry = colors?.get(fillVal) ?? { fill: '#aaa', stroke: '#666' }

			return {
				data: d,
				cx,
				q1: yScale(d.q1),
				median: yScale(d.median),
				q3: yScale(d.q3),
				iqr_min: yScale(d.iqr_min),
				iqr_max: yScale(d.iqr_max),
				outliers: (d.outliers ?? []).map((v) => ({ cy: yScale(v), value: v })),
				width: boxWidth,
				whiskerWidth,
				fill: colorEntry.fill,
				stroke: colorEntry.stroke,
				patternId: patternIdFor(d)
			}
		})
	}

	// Non-grouped: one box per x category
	const boxWidth = width !== undefined ? bw * width : bw * 0.6
	const whiskerWidth = width !== undefined ? boxWidth * 0.5 : bw * 0.3

	return data.map((d) => {
		const fillKey = ff ? d[ff] : d[xf]
		const colorEntry = colors?.get(fillKey) ?? { fill: '#aaa', stroke: '#666' }
		const cx =
			(xScale(d[xf]) ?? 0) +
			(typeof xScale.bandwidth === 'function' ? bw / 2 : 0) +
			laneOffset(bw)
		return {
			data: d,
			cx,
			q1: yScale(d.q1),
			median: yScale(d.median),
			q3: yScale(d.q3),
			iqr_min: yScale(d.iqr_min),
			iqr_max: yScale(d.iqr_max),
			outliers: (d.outliers ?? []).map((v) => ({ cy: yScale(v), value: v })),
			width: boxWidth,
			whiskerWidth,
			fill: colorEntry.fill,
			stroke: colorEntry.stroke,
			patternId: patternIdFor(d)
		}
	})
}
