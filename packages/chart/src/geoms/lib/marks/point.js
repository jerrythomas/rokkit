import { scaleSqrt } from 'd3-scale'
import { buildPoints } from '../../../lib/brewing/marks/points.js'
import { resolveFillStroke, resolveAlpha } from '../aesthetics.js'

/**
 * Size scale for a bubble/size channel — sqrt so area (not radius) is proportional.
 * @returns {import('d3-scale').ScalePower<number, number> | null}
 */
function buildSizeScale(data, sizeField, options) {
	if (!sizeField || !data?.length) return null
	const vals = data.map((d) => Number(d[sizeField])).filter((v) => !isNaN(v))
	if (!vals.length) return null
	return scaleSqrt()
		.domain([Math.min(...vals), Math.max(...vals)])
		.range([options?.minRadius ?? 3, options?.maxRadius ?? 20])
}

/**
 * Build renderable point marks: geometry (from buildPoints) + shared aesthetics
 * (fill/color split + alpha) + value/display. The geom template just renders these.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildPointMarks({ data, plot, channels, options = {}, alpha, type = 'point' }) {
	const { xScale, yScale, colors } = plot
	if (!data?.length || !xScale || !yScale) return []

	const sizeScale = buildSizeScale(data, channels.size, options)
	const raw = buildPoints(
		data,
		channels,
		xScale,
		yScale,
		colors,
		sizeScale,
		plot.symbols,
		options.radius ?? 4,
		options.jitter ?? null
	)
	const a = resolveAlpha(alpha, type, plot.chartPreset)
	const yf = channels.y

	return raw.map((p, i) => {
		const { fill, stroke } = resolveFillStroke(p.data, channels, colors)
		// Horizontal orientation: swap each point's screen coords via place().
		const s = plot.isFlipped ? plot.place(p.cx, p.cy) : { x: p.cx, y: p.cy }
		return {
			...p,
			cx: s.x,
			cy: s.y,
			fill,
			stroke,
			alpha: a,
			value: yf ? p.data[yf] : undefined,
			display: yf ? String(p.data[yf] ?? '') : '',
			key: `${i}::${p.data[channels.x ?? '']}::${p.data[yf ?? '']}`
		}
	})
}
