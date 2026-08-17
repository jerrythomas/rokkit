import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable candlesticks. Body + wick color is semantic (up/down from options), not
 * the shared palette. Adds fixed `alpha`. Places (band, value) corners through place() so the
 * candle transposes under orientation flip.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildCandleMarks({ data, plot, channels, options = {}, alpha, type = 'candlestick' }) {
	const { xScale, yScale } = plot
	if (!data?.length || !xScale || !yScale) return []

	const open = options.open ?? 'open'
	const high = options.high ?? 'high'
	const low = options.low ?? 'low'
	const close = options.close ?? 'close'
	const upColor = options.upColor ?? '#22c55e'
	const downColor = options.downColor ?? '#ef4444'
	const a = resolveAlpha(alpha, type, plot.chartPreset)

	const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 10
	const bodyWidth = bw * 0.6
	const bodyOffset = (bw - bodyWidth) / 2

	return data.map((d, i) => {
		const xPos = (xScale(d[channels.x ?? '']) ?? 0) + bodyOffset
		const openVal = Number(d[open])
		const closeVal = Number(d[close])
		const isUp = closeVal >= openVal
		const bodyTop = yScale(isUp ? closeVal : openVal)
		const bodyBottom = yScale(isUp ? openVal : closeVal)

		const b1 = plot.place(xPos, bodyTop)
		const b2 = plot.place(xPos + bodyWidth, bodyBottom)
		const wa = plot.place(xPos + bodyWidth / 2, yScale(Number(d[high])))
		const wb = plot.place(xPos + bodyWidth / 2, yScale(Number(d[low])))
		return {
			key: `${d[channels.x ?? '']}-${i}`,
			bodyX: Math.min(b1.x, b2.x),
			bodyY: Math.min(b1.y, b2.y),
			bodyWidth: Math.abs(b2.x - b1.x),
			bodyHeight: Math.max(1, Math.abs(b2.y - b1.y)),
			fill: isUp ? upColor : downColor,
			alpha: a,
			wickX1: wa.x,
			wickY1: wa.y,
			wickX2: wb.x,
			wickY2: wb.y,
			data: d
		}
	})
}
