import { buildBars, buildStackedBars } from '../bars.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable bar marks. Interior is grouped/filled by `fill ?? color`; the `group`
 * channel (default `fill ?? color`) drives the sub-series partitioned by `position`:
 *  - stack: cumulative segments      - dodge: side-by-side sub-bands (default)
 *  - fill:  100% (normalized) stack  - identity: overlapping full-width bars
 * `options.stack: true` maps to position 'stack' (back-compat). Adds the geom's fixed `alpha`.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildBarMarks({ data, plot, channels, options = {}, alpha, type = 'bar' }) {
	const { xScale, yScale, colors, patterns } = plot
	if (!data?.length || !xScale || !yScale) return []

	const interiorField = channels.fill ?? channels.color
	const groupField = channels.group ?? channels.fill ?? channels.color
	const barChannels = {
		x: channels.x,
		y: channels.y,
		color: interiorField,
		pattern: channels.pattern,
		group: groupField
	}
	const place = plot.place.bind(plot)
	const ih = plot.innerHeight
	const position = options.position ?? (options.stack ? 'stack' : 'dodge')

	let raw
	if (position === 'stack') {
		raw = buildStackedBars(data, barChannels, xScale, yScale, colors, ih, patterns, place, false)
	} else if (position === 'fill') {
		raw = buildStackedBars(data, barChannels, xScale, yScale, colors, ih, patterns, place, true)
	} else if (position === 'identity') {
		raw = buildBars(data, barChannels, xScale, yScale, colors, ih, patterns, place, plot.continuousCategory, false)
	} else {
		// dodge (default): side-by-side sub-bands
		raw = buildBars(data, barChannels, xScale, yScale, colors, ih, patterns, place, plot.continuousCategory, true)
	}

	const a = resolveAlpha(alpha, type, plot.chartPreset)
	return raw.map((bar) => ({ ...bar, alpha: a }))
}
