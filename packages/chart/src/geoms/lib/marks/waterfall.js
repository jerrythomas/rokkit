import { resolveAlpha } from '../aesthetics.js'

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
	let cumulative = 0

	return data.map((d, i) => {
		const xVal = d[channels.x ?? '']
		const yVal = Number(d[channels.y ?? ''])
		const isTotal = totalField ? Boolean(d[totalField]) : false
		const xPos = xScale(xVal) ?? 0
		let barTop
		let barBottom
		let fill

		if (isTotal) {
			barTop = yScale(Math.max(0, cumulative)) ?? 0
			barBottom = yScale(0) ?? 0
			fill = totalColor
		} else {
			const start = cumulative
			cumulative += yVal
			barTop = yScale(Math.max(start, cumulative)) ?? 0
			barBottom = yScale(Math.min(start, cumulative)) ?? 0
			fill = yVal >= 0 ? positiveColor : negativeColor
		}

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
			cumY: yScale(cumulative) ?? 0,
			data: d
		}
	})
}
