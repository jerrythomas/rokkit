import { resolveAlpha } from '../aesthetics.js'
import { literalColor } from '../../../lib/brewing/colors.js'

/**
 * Build renderable heatmap cells. Cell fill is the continuous color scale (numeric color
 * field) or the categorical palette entry, from `fill ?? color`. Adds fixed `alpha`.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildHeatmapMarks({ data, plot, channels, alpha, type = 'heatmap' }) {
	const { xScale, yScale, colors } = plot
	if (!data?.length || !xScale || !yScale) return []

	const colorField = channels.fill ?? channels.color
	// A literal fill/color paints every cell directly, skipping the value/palette scale.
	const lit = literalColor(colorField)
	const field = lit ? undefined : colorField
	const continuous = plot.continuousColorScale
	const bwX = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 0
	const bwY = typeof yScale.bandwidth === 'function' ? yScale.bandwidth() : 0
	const a = resolveAlpha(alpha, type, plot.chartPreset)

	return data.map((d, i) => {
		const xVal = d[channels.x ?? '']
		const yVal = d[channels.y ?? '']
		const colorVal = field ? d[field] : null
		let fill = lit ?? '#ccc'
		if (!lit) {
			if (continuous) fill = continuous.scale(Number(colorVal))
			else {
				const entry = colors?.get(colorVal)
				if (entry) fill = entry.fill
			}
		}
		return {
			key: `${xVal}-${yVal}-${i}`,
			x: xScale(xVal) ?? 0,
			y: yScale(yVal) ?? 0,
			width: bwX,
			height: bwY,
			fill,
			alpha: a,
			value: colorVal,
			display: String(colorVal ?? ''),
			data: d
		}
	})
}
