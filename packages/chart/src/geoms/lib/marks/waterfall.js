import { resolveAlpha } from '../aesthetics.js'
import { runningSpans } from '../../../lib/plot/running.js'

/**
 * Build renderable waterfall bars. Bar color is semantic (positive/negative/total from
 * options), not the shared palette. Adds fixed `alpha` and carries connector anchors.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildWaterfallMarks({ data, plot, channels, options = {}, alpha, type = 'waterfall' }) {
	const { xScale, yScale } = plot
	if (!data?.length || !xScale || !yScale) return []

	const positiveColor = options.positiveColor ?? '#22c55e'
	const negativeColor = options.negativeColor ?? '#ef4444'
	const totalColor = options.totalColor ?? '#3b82f6'
	const totalField = options.totalField ?? undefined
	const a = resolveAlpha(alpha, type, plot.chartPreset)

	const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 10
	const spans = runningSpans(data, channels.y ?? '', totalField)

	return data.map((d, i) => {
		const xVal = d[channels.x ?? '']
		const { lo, hi, total, isTotal, delta } = spans[i]
		const xPos = xScale(xVal) ?? 0
		const barTop = yScale(hi) ?? 0
		const barBottom = yScale(lo) ?? 0
		const fill = isTotal ? totalColor : delta >= 0 ? positiveColor : negativeColor

		const c1 = plot.place(xPos, barTop)
		const c2 = plot.place(xPos + bw, barBottom)
		return {
			key: `${xVal}-${i}`,
			x: Math.min(c1.x, c2.x),
			y: Math.min(c1.y, c2.y),
			width: Math.abs(c2.x - c1.x),
			height: Math.max(1, Math.abs(c2.y - c1.y)),
			fill,
			alpha: a,
			bandStart: xPos,
			bandEnd: xPos + bw,
			cumY: yScale(total) ?? 0,
			data: d
		}
	})
}
