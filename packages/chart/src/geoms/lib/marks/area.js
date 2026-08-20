import { buildAreas, buildStackedAreas } from '../areas.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable area segments. Interior is grouped/filled by `fill ?? color`
 * (ggplot geom_area's fill). A border stroke is drawn only when BOTH `fill` and `color`
 * are set — so an old `color`-only area stays border-less (backward compatible); the
 * border uses the interior group's darker stroke shade. Per-field border coloring
 * (fill ≠ color, two legends) is the deferred dual-scale follow-up.
 * `options.baseline`, when set, is passed straight to `buildAreas` (identity-position charts
 * only — stacked/100% areas ignore it) and splits each segment into signed above/below copies
 * (#148).
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
	// Areas don't dodge; position selects stack | fill (100%) | identity (overlap, default).
	const position = options.position ?? (options.stack ? 'stack' : 'identity')
	const stacked = position === 'stack' || position === 'fill'
	const raw = stacked
		? buildStackedAreas(data, areaChannels, xScale, yScale, colors, options.curve, patterns, place, position === 'fill')
		: buildAreas(data, areaChannels, xScale, yScale, colors, options.curve, patterns, place, options.baseline)

	const a = resolveAlpha(alpha, type, plot.chartPreset)
	return raw.map((seg) => ({
		// `d`/`fill`/`key`/`patternId`/`sign` all flow through unchanged via this spread;
		// only `stroke` and `alpha` are actually recomputed below.
		...seg,
		// `seg.groupKey` (when present) is the raw, unsigned group value — a baseline split
		// gives `seg.key` a sign suffix, so looking the border color up by `seg.key` directly
		// would miss for every signed segment. `buildStackedAreas` segments don't carry a
		// groupKey (they're never signed), so `seg.key` there is already the raw colorKey.
		stroke: hasBorder ? (colors.get(seg.groupKey ?? seg.key)?.stroke ?? 'none') : 'none',
		alpha: a
	}))
}
