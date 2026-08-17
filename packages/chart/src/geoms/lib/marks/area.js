import { buildAreas, buildStackedAreas } from '../areas.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable area segments. Interior is grouped/filled by `fill ?? color`
 * (ggplot geom_area's fill). A border stroke is drawn only when BOTH `fill` and `color`
 * are set — so an old `color`-only area stays border-less (backward compatible); the
 * border uses the interior group's darker stroke shade. Per-field border coloring
 * (fill ≠ color, two legends) is the deferred dual-scale follow-up.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildAreaMarks({ data, plot, channels, options = {}, alpha, type = 'area' }) {
	const { xScale, yScale, colors, patterns } = plot
	if (!data?.length || !xScale || !yScale || !channels.x || !channels.y) return []

	const interiorField = channels.fill ?? channels.color
	const hasBorder = Boolean(channels.fill && channels.color)
	const place = plot.place.bind(plot)
	const areaChannels = {
		x: channels.x,
		y: channels.y,
		color: interiorField,
		pattern: channels.pattern
	}
	const raw = options.stack
		? buildStackedAreas(data, areaChannels, xScale, yScale, colors, options.curve, patterns, place)
		: buildAreas(data, areaChannels, xScale, yScale, colors, options.curve, patterns, place)

	const a = resolveAlpha(alpha, type, plot.chartPreset)
	return raw.map((seg) => ({
		...seg,
		stroke: hasBorder ? (colors.get(seg.key)?.stroke ?? 'none') : 'none',
		alpha: a
	}))
}
