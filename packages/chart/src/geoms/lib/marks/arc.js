import { buildArcs } from '../../../lib/brewing/marks/arcs.js'
import { resolveAlpha } from '../aesthetics.js'

/**
 * Build renderable pie/donut arcs. Slice interior + border come from `fill ?? color`
 * through the shared palette (buildArcs already yields fill + a darker stroke). Adds the
 * geom's fixed `alpha`.
 * @param {{ data: any[], plot: any, channels: any, options?: any, alpha?: number, type?: string }} ctx
 */
export function buildArcMarks({ data, plot, channels, options = {}, alpha, type = 'arc' }) {
	if (!data?.length) return []
	const interiorField = channels.fill ?? channels.color
	// Guard: skip until data catches up after a fill-field change — otherwise a stale row set
	// (missing the new field) produces all-undefined keys and duplicate-key errors.
	if (interiorField && data[0] && !(interiorField in data[0])) return []

	const arcs = buildArcs(
		data,
		{ color: interiorField, y: channels.y, pattern: channels.pattern },
		plot.colors,
		plot.innerWidth,
		plot.innerHeight,
		{ innerRadius: options.innerRadius ?? 0 },
		plot.patterns
	)
	const a = resolveAlpha(alpha, type, plot.chartPreset)
	return arcs.map((arc) => ({ ...arc, alpha: a }))
}
