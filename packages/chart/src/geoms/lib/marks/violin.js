import { buildViolins } from '../../../lib/brewing/marks/violins.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable violin silhouettes. Interior + outline come from `fill` (defaulting to
 * `x`); an explicit `color` channel overrides the outline stroke. Adds fixed `alpha`.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildViolinMarks({ data, plot, channels, options = {}, alpha, type = 'violin' }) {
	const { xScale, yScale, colors } = plot
	if (!data?.length || !xScale || !yScale) return []

	const fillField = channels.fill ?? channels.x
	const violins = buildViolins(
		data,
		{ x: channels.x, fill: fillField, pattern: channels.pattern },
		xScale,
		yScale,
		colors,
		plot.place.bind(plot),
		options.side,
		plot.patterns
	)
	const a = resolveAlpha(alpha, type, plot.chartPreset)
	const colorField = channels.color
	return violins.map((v) => ({
		...v,
		stroke: colorField ? (colors.get(v.data[colorField])?.stroke ?? v.stroke) : v.stroke,
		alpha: a
	}))
}
