import { buildBars, buildStackedBars } from '../bars.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable bar marks. Interior is grouped/filled by `fill ?? color` (the existing
 * single-channel model, which also drives sub-band/dodge + stack keys and the bar-race);
 * buildBars yields fill + a matching stroke. Adds the geom's fixed `alpha`. A true fill ≠
 * color border split is the deferred dual-scale follow-up (it would change the sub-band keys).
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildBarMarks({ data, plot, channels, options = {}, alpha, type = 'bar' }) {
	const { xScale, yScale, colors, patterns } = plot
	if (!data?.length || !xScale || !yScale) return []

	const interiorField = channels.fill ?? channels.color
	const barChannels = {
		x: channels.x,
		y: channels.y,
		color: interiorField,
		pattern: channels.pattern
	}
	const place = plot.place.bind(plot)
	const raw = options.stack
		? buildStackedBars(data, barChannels, xScale, yScale, colors, plot.innerHeight, patterns, place)
		: buildBars(
				data,
				barChannels,
				xScale,
				yScale,
				colors,
				plot.innerHeight,
				patterns,
				place,
				plot.continuousCategory
			)

	const a = resolveAlpha(alpha, type, plot.chartPreset)
	return raw.map((bar) => ({ ...bar, alpha: a }))
}
