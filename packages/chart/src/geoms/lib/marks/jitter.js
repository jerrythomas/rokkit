import { buildSwarm } from '../../../lib/brewing/marks/swarm.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable jitter/swarm points. Fill + outline come from `fill` (defaulting to
 * `x`); an explicit `color` channel overrides the outline stroke. Adds fixed `alpha`.
 * Horizontal orientation swaps each point's screen coords via place().
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildJitterMarks({ data, plot, channels, options = {}, alpha, type = 'jitter' }) {
	const { xScale, yScale, colors } = plot
	if (!data?.length || !xScale || !yScale) return []

	const fillField = channels.fill ?? channels.x
	const raw = buildSwarm(
		data,
		{ x: channels.x, y: channels.y, fill: fillField },
		xScale,
		yScale,
		colors,
		{ method: options.method, r: options.r, side: options.side }
	)
	const a = resolveAlpha(alpha, type, plot.chartPreset)
	const colorField = channels.color
	const flip = plot.isFlipped
	return raw.map((p) => {
		const s = flip ? plot.place(p.cx, p.cy) : { x: p.cx, y: p.cy }
		return {
			...p,
			cx: s.x,
			cy: s.y,
			stroke: colorField ? (colors.get(p.data[colorField])?.stroke ?? p.stroke) : p.stroke,
			alpha: a
		}
	})
}
