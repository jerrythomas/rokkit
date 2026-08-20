import { area, stack, stackOffsetExpand, curveCatmullRom, curveStep } from 'd3-shape'
import { toPatternId } from '../../lib/brewing/patterns.js'
import { literalColor, markEntry } from '../../lib/brewing/colors.js'

/**
 * Builds area path geometry for multi-series area charts.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string, pattern?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @param {Map<unknown, string>} [patterns]
 * @param {Function} [place] - orientation mapper (x, y) => {x, y}
 * @param {number} [baselineValue] - data-space value to anchor/split the fill at. When set,
 *   each segment is emitted twice (sign: 'above' | 'below'), both anchored at this value's
 *   pixel position instead of the chart bottom, so themes can colour the two independently.
 *   Fed straight into `yScale()`, so a value outside the scale's domain extrapolates (e.g.
 *   100 against a domain of [-5, 5] gives pixel -475) rather than clamping to the chart edge.
 * @returns {{ d: string, fill: string, stroke: string, key: unknown, groupKey: unknown, patternId: string|null, sign?: 'above'|'below' }[]}
 */
export function buildAreas(data, channels, xScale, yScale, colors, curve, patterns, place = (x, y) => ({ x, y }), baselineValue = undefined) {
	const { x: xf, y: yf, pattern: pf } = channels
	// A literal color (var()/oklch()/hex/currentColor) isn't a data field — it's the exact
	// fill the caller wants for THIS area. Don't group on it, and don't fall back to the
	// shared color scale (one value across all geoms); use it directly.
	const lit = literalColor(channels.color)
	const cf = lit ? undefined : channels.color
	// Number.isFinite (not a loose !=null check) also rejects NaN/Infinity — a caller-computed
	// stat (e.g. a mean over an empty group) can easily produce NaN, which would otherwise sail
	// through and emit literal "NaN" path commands.
	const hasBaseline = Number.isFinite(baselineValue)
	const baseline = hasBaseline ? yScale(baselineValue) : yScale.range()[0] // bottom of the chart (y pixel max) unless an explicit baseline value is given

	const xPos = (d) =>
		typeof xScale.bandwidth === 'function' ? xScale(d[xf]) + xScale.bandwidth() / 2 : xScale(d[xf])

	// Each area edge (baseline + top) is placed so the area transposes under orientation.
	// `sign` clamps the top edge to one side of the baseline — 'above' never dips below it,
	// 'below' never rises above it — the same technique proven in Sparkline (#148). This MUST
	// happen here, in value space, before `place()` runs: `place` is how horizontal/flipped
	// orientation is implemented (it can swap x/y), so clamping the post-place coordinate would
	// clamp whatever axis ends up there — including the category axis on a flipped chart. `v`
	// carries the raw y-value so the generator can break the area at a gap (null).
	const toEdge = (d, sign) => {
		const rawTop = yScale(d[yf])
		const clampedTop = sign === 'above' ? Math.min(rawTop, baseline) : sign === 'below' ? Math.max(rawTop, baseline) : rawTop
		return { base: place(xPos(d), baseline), top: place(xPos(d), clampedTop), v: d[yf] }
	}
	const makeGen = () => {
		const gen = area()
			// A null y-value is a GAP (a missing period): break the area there instead of
			// dropping it onto the 0 baseline. A genuine 0 stays defined and fills.
			.defined((p) => Number.isFinite(p.top.y) && (yf === undefined || yf === null || (p.v !== undefined && p.v !== null)))
			.x0((p) => p.base.x)
			.y0((p) => p.base.y)
			.x1((p) => p.top.x)
			.y1((p) => p.top.y)
		if (curve === 'smooth') gen.curve(curveCatmullRom)
		else if (curve === 'step') gen.curve(curveStep)
		return gen
	}
	// One unsigned segment normally; with a baseline, an above and a below copy so themes can
	// colour positive vs negative fill independently. Mirrors the approach proven in Sparkline
	// (#148). Also owns the "no baseline" `d` computation so both call sites just hand over rows.
	const splitBySign = (segBase, rows) => {
		if (!hasBaseline) return [{ ...segBase, d: makeGen()(rows.map((d) => toEdge(d))) }]
		return ['above', 'below'].map((sign) => ({
			...segBase,
			d: makeGen()(rows.map((d) => toEdge(d, sign))),
			sign,
			// A single-series segment's key is `null` (not `undefined`, see below); either way,
			// there's nothing meaningful to prefix, so the sign alone is the key. For a real
			// group key, a template literal alone would string-coerce it — colliding distinct
			// values that share a string form (number 5 and string '5' both become "5::above").
			// Prefixing with `typeof` keeps those apart without losing the original key's value.
			key:
				segBase.key === undefined || segBase.key === null
					? sign
					: `${typeof segBase.key}:${segBase.key}::${sign}`
		}))
	}

	// For band (categorical) x scales, sort by domain index to preserve intended ordering.
	// For continuous scales, sort numerically so the path draws left-to-right.
	const sortByX = (rows) => {
		if (typeof xScale.bandwidth === 'function') {
			const domain = xScale.domain()
			return [...rows].sort((a, b) => domain.indexOf(a[xf]) - domain.indexOf(b[xf]))
		}
		return [...rows].sort((a, b) => (a[xf] < b[xf] ? -1 : a[xf] > b[xf] ? 1 : 0))
	}

	if (!cf) {
		// A literal color IS the fill; a single-series field uses the shared shade.
		const entry = markEntry(lit, undefined, colors, colors?.values().next().value ?? { fill: '#888', stroke: '#888' })
		const patternKey = pf ? data[0]?.[pf] : null
		const patternId =
			patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
				? toPatternId(String(patternKey))
				: null
		// `groupKey` is the untouched, unsigned group discriminator (here always null): callers
		// that need to look a segment back up in a colors/patterns Map (keyed by the raw group
		// value, not by our render key) should use this instead of `key`, since `key` gets a
		// sign suffix once a baseline is in effect.
		return splitBySign({ fill: entry.fill, stroke: 'none', key: null, groupKey: null, patternId }, sortByX(data))
	}

	// Group by color field
	const groups = new Map()
	for (const d of data) {
		const key = d[cf]
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key).push(d)
	}
	// For different-field patterns, assign positionally so each area gets a distinct pattern
	const orderedPatternKeys = pf && pf !== cf ? [...(patterns?.keys() ?? [])] : null

	return [...groups.entries()].flatMap(([key, rows], i) => {
		const entry = colors?.get(key) ?? { fill: '#888', stroke: '#888' }
		// Same field or no pf: look up by colorKey. Different field: assign positionally.
		const patternKey = !pf
			? key
			: pf === cf
				? key
				: (orderedPatternKeys?.[i % orderedPatternKeys.length] ?? null)
		const patternId =
			patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
				? toPatternId(String(patternKey))
				: null
		return splitBySign({ fill: entry.fill, stroke: 'none', key, groupKey: key, patternId }, sortByX(rows))
	})
}

/**
 * Builds stacked area paths using d3 stack layout.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string, pattern?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @param {Map<unknown, string>} [patterns]
 * @returns {{ d: string, fill: string, stroke: string, key: unknown, patternId: string|null }[]}
 */
export function buildStackedAreas(data, channels, xScale, yScale, colors, curve, patterns, place = (x, y) => ({ x, y }), normalize = false) {
	const { x: xf, y: yf, color: cf, pattern: pf } = channels
	if (!cf) return buildAreas(data, channels, xScale, yScale, colors, curve, patterns)

	const xCategories = [...new Set(data.map((d) => d[xf]))].sort((a, b) =>
		a < b ? -1 : a > b ? 1 : 0
	)
	const colorCategories = [...new Set(data.map((d) => d[cf]))]

	// Build wide-form lookup: xVal → { colorKey: yVal }
	const lookup = new Map()
	for (const d of data) {
		if (!lookup.has(d[xf])) lookup.set(d[xf], {})
		lookup.get(d[xf])[d[cf]] = Number(d[yf])
	}

	const wide = xCategories.map((xVal) => {
		const row = { [xf]: xVal }
		for (const c of colorCategories) row[c] = lookup.get(xVal)?.[c] ?? 0
		return row
	})

	const xPos = (d) =>
		typeof xScale.bandwidth === 'function'
			? xScale(d.data[xf]) + xScale.bandwidth() / 2
			: xScale(d.data[xf])

	const toEdge = (d) => ({ base: place(xPos(d), yScale(d[0])), top: place(xPos(d), yScale(d[1])) })
	const makeGen = () => {
		const gen = area()
			.x0((p) => p.base.x)
			.y0((p) => p.base.y)
			.x1((p) => p.top.x)
			.y1((p) => p.top.y)
		if (curve === 'smooth') gen.curve(curveCatmullRom)
		else if (curve === 'step') gen.curve(curveStep)
		return gen
	}

	const stackGen = stack().keys(colorCategories)
	// position='fill' → normalize each x column to [0,1] (100% stacked area).
	if (normalize) stackGen.offset(stackOffsetExpand)
	const layers = stackGen(wide)

	const orderedPatternKeys = pf && pf !== cf ? [...(patterns?.keys() ?? [])] : null

	return layers.map((layer, i) => {
		const colorKey = layer.key
		const entry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#888' }
		// Same field (or no pf): look up by colorKey. Different field: assign positionally.
		const patternKey = !pf
			? colorKey
			: pf === cf
				? colorKey
				: (orderedPatternKeys?.[i % orderedPatternKeys.length] ?? null)
		const patternId =
			patternKey !== null && patternKey !== undefined && patterns?.has(patternKey)
				? toPatternId(String(patternKey))
				: null
		return {
			d: makeGen()(layer.map(toEdge)) ?? '',
			fill: entry.fill,
			stroke: 'none',
			key: colorKey,
			patternId
		}
	})
}
