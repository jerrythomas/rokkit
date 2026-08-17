import { buildLines } from '../../../lib/brewing/marks/lines.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable line segments. A line has no interior, so its single aesthetic is
 * the stroke — driven by `color`, with `fill` accepted as an alias (ggplot geom_line
 * uses `colour`). Each segment gets the geom's fixed `alpha`.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildLineMarks({ data, plot, channels, options = {}, alpha, type = 'line' }) {
	const { xScale, yScale, colors } = plot
	if (!data?.length || !xScale || !yScale) return []
	const lineColor = channels.color ?? channels.fill
	const segs = buildLines(
		data,
		{ x: channels.x, y: channels.y, color: lineColor },
		xScale,
		yScale,
		colors,
		options.curve,
		plot.place.bind(plot)
	)
	const a = resolveAlpha(alpha, type, plot.chartPreset)
	return segs.map((seg) => ({ ...seg, alpha: a }))
}
