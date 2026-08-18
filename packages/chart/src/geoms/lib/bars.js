import { scaleBand } from 'd3-scale'
import { stack, stackOffsetExpand } from 'd3-shape'
import { toPatternId } from '../../lib/brewing/patterns.js'
import { isLiteralColor } from '../../lib/brewing/colors.js'

/**
 * Returns a band scale suitable for bar x-positioning.
 * When xScale is already a band scale, returns it unchanged.
 * When xScale is a linear scale (numeric x field like year/month),
 * derives a band scale from the distinct values in the data.
 */
function ensureBandX(xScale, data, xField) {
	if (typeof xScale?.bandwidth === 'function') return xScale
	const [r0, r1] = xScale.range()
	const domain = [...new Set(data.map((d) => d[xField]))]
	return scaleBand().domain(domain).range([r0, r1]).padding(0.2)
}

/**
 * Returns the sub-band fields: distinct non-x fields among [group, color, pattern].
 * These are the fields that cause multiple bars within a single x-band (dodge/grouping).
 * `group` (the explicit grouping channel) takes precedence as the first sub-band.
 */
function subBandFields(channels) {
	const { x: xf, group: gf, color: cf, pattern: pf } = channels
	const seen = new Set()
	const out = []
	for (const f of [gf, cf, pf]) {
		if (f && f !== xf && !seen.has(f) && !isLiteralColor(f)) {
			seen.add(f)
			out.push(f)
		}
	}
	return out
}

/**
 * The one bar builder. Expresses each bar in abstract (category, value) space and maps it to
 * screen via `place()`, so it renders vertical or horizontal (flip) with the same code.
 *
 * Category (x) positioning has two modes:
 * - band (default): a scaleBand slots each category; sub-bands split grouped series.
 * - continuous (`continuousCategory`): a LINEAR position scale (e.g. a bar-chart race's tweened
 *   `_rank`). Each bar centres on `xScale(pos)` with a fixed thickness from the scale step, so a
 *   fractional position tweens smoothly (a band scale can only jump between slots). No sub-banding.
 */
export function buildBars(
	data,
	channels,
	xScale,
	yScale,
	colors,
	innerHeight,
	patterns,
	place = (x, y) => ({ x, y }),
	continuousCategory = false,
	dodge = true
) {
	const { x: xf, y: yf, color: cf, pattern: pf } = channels

	// No sub-banding for a continuous (race) axis or position='identity' (dodge=false → overlap).
	const subFields = continuousCategory || !dodge ? [] : subBandFields(channels)
	const getSubKey = (d) => subFields.map((f) => String(d[f])).join('::')

	let positionOf
	let thicknessOf
	if (continuousCategory) {
		const [r0, r1] = xScale.range()
		const [d0, d1] = xScale.domain()
		const step = Math.max(Math.abs(r0 - r1) / Math.max(d1 - d0, 1), 1)
		const thickness = step * 0.9
		thicknessOf = () => thickness
		positionOf = (d) => (xScale(Number(d[xf])) ?? 0) - thickness / 2
	} else {
		const bandScale = ensureBandX(xScale, data, xf)
		const subDomain = subFields.length > 0 ? [...new Set(data.map(getSubKey))] : []
		const subScale =
			subDomain.length > 1
				? scaleBand().domain(subDomain).range([0, bandScale.bandwidth()]).padding(0.05)
				: null
		thicknessOf = () => (subScale ? subScale.bandwidth() : bandScale.bandwidth())
		positionOf = (d) => {
			const bandX = bandScale(d[xf]) ?? 0
			const subX = subScale ? (subScale(getSubKey(d)) ?? 0) : 0
			return bandX + subX
		}
	}

	// Value baseline: at value=0 when the domain spans zero (supports negative bars), else the
	// value-axis origin (yScale.range()[0] — innerHeight when vertical, 0 when flipped).
	const yDomain = typeof yScale.bandwidth !== 'function' ? yScale.domain?.() : null
	const baseline =
		yDomain && yDomain[0] <= 0 && yDomain[yDomain.length - 1] >= 0
			? (yScale(0) ?? yScale.range()[0])
			: yScale.range()[0]

	return data.map((d, i) => {
		const xVal = d[xf]
		const colorKey = cf ? d[cf] : null
		const patternKey = pf ? d[pf] : null
		const subKey = getSubKey(d)

		const colorEntry = colors?.get(colorKey) ??
			colors?.values().next().value ?? { fill: '#888', stroke: '#888' }
		const patternId =
			patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
				? toPatternId(String(patternKey))
				: null

		const barBand = positionOf(d)
		const barThickness = thicknessOf(d)
		const barValue = yScale(d[yf]) ?? baseline
		// Two opposite corners in (band, value) space, placed to screen — transposes under flip.
		const c1 = place(barBand, baseline)
		const c2 = place(barBand + barThickness, barValue)

		// Continuous mode keys by _entity so Svelte reuses each bar as its position tweens (a
		// race's rows reorder every frame); band mode keys by category + sub-band + index.
		const key = continuousCategory
			? `${String(d._entity ?? xVal)}::${String(colorKey ?? '')}`
			: `${String(xVal)}::${subKey}::${i}`

		return {
			data: d,
			key,
			x: Math.min(c1.x, c2.x),
			y: Math.min(c1.y, c2.y),
			width: Math.abs(c2.x - c1.x),
			height: Math.abs(c2.y - c1.y),
			fill: colorEntry.fill,
			stroke: colorEntry.stroke,
			patternId
		}
	})
}

export function buildStackedBars(data, channels, xScale, yScale, colors, innerHeight, patterns, place = (x, y) => ({ x, y }), normalize = false) {
	const { x: xf, y: yf, color: cf, pattern: pf } = channels

	const bandScale = ensureBandX(xScale, data, xf)

	// Stack dimension: first non-x grouping field (prefer pattern, then color)
	const subFields = subBandFields(channels)
	if (subFields.length === 0) {
		return buildBars(data, channels, xScale, yScale, colors, innerHeight, patterns, place)
	}
	const stackField = subFields[0]

	const xCategories = [...new Set(data.map((d) => d[xf]))]
	const stackCategories = [...new Set(data.map((d) => d[stackField]))]

	const lookup = new Map()
	for (const d of data) {
		if (!lookup.has(d[xf])) lookup.set(d[xf], {})
		lookup.get(d[xf])[d[stackField]] = Number(d[yf])
	}

	const wide = xCategories.map((xVal) => {
		const row = { [xf]: xVal }
		for (const sk of stackCategories) row[sk] = lookup.get(xVal)?.[sk] ?? 0
		return row
	})

	const stackGen = stack().keys(stackCategories)
	// position='fill' → normalize each x column to [0,1] (100% stacked).
	if (normalize) stackGen.offset(stackOffsetExpand)
	const layers = stackGen(wide)

	const bars = []
	for (const layer of layers) {
		const stackKey = layer.key

		for (const point of layer) {
			const [y0, y1] = point
			const xVal = point.data[xf]

			// Color lookup: cf may equal xf (= xVal) or stackField (= stackKey)
			const colorKey = cf ? (cf === xf ? xVal : cf === stackField ? stackKey : null) : null
			const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#888' }

			// Pattern lookup: pf may equal xf (= xVal) or stackField (= stackKey)
			const patternKey = pf ? (pf === xf ? xVal : pf === stackField ? stackKey : null) : null
			const patternId =
				patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
					? toPatternId(String(patternKey))
					: null

			// Two opposite corners in (band, value) space, mapped through place() so the
			// stack transposes under orientation='horizontal' (identity default → unchanged).
			// Without this a grouped stack/fill ignored place() and always drew vertically.
			const band = bandScale(xVal) ?? 0
			const c1 = place(band, yScale(y0))
			const c2 = place(band + bandScale.bandwidth(), yScale(y1))
			bars.push({
				data: point.data,
				key: `${String(xVal)}::${String(stackKey)}`,
				x: Math.min(c1.x, c2.x),
				y: Math.min(c1.y, c2.y),
				width: Math.abs(c2.x - c1.x),
				height: Math.abs(c2.y - c1.y),
				fill: colorEntry.fill,
				stroke: colorEntry.stroke,
				patternId
			})
		}
	}
	return bars
}
