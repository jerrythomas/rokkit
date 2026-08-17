import { buildBoxes } from '../../../lib/brewing/marks/boxes.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable box marks. Body fill + outline (whiskers/median/caps) come from the
 * `fill` channel (defaulting to `x`); an explicit `color` channel overrides the outline
 * stroke (interior stays from `fill`). Adds the geom's fixed `alpha`.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildBoxMarks({ data, plot, channels, options = {}, alpha, type = 'box' }) {
	const { xScale, yScale, colors } = plot
	if (!data?.length || !xScale || !yScale) return []

	const fillField = channels.fill ?? channels.x
	const boxes = buildBoxes(
		data,
		{ x: channels.x, fill: fillField, pattern: channels.pattern },
		xScale,
		yScale,
		colors,
		{ side: options.side, width: options.width, patterns: plot.patterns }
	)
	const a = resolveAlpha(alpha, type, plot.chartPreset)
	const colorField = channels.color
	return boxes.map((box) => ({
		...box,
		stroke: colorField ? (colors.get(box.data[colorField])?.stroke ?? box.stroke) : box.stroke,
		alpha: a
	}))
}
