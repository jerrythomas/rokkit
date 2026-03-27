import { extent } from 'd3-array'
import { dataset } from '@rokkit/data'

/**
 * Extracts animation frames from data, keyed by time field value.
 * Preserves insertion order of time values.
 *
 * @param {Object[]} data
 * @param {string} timeField
 * @returns {Map<unknown, Object[]>}
 */
export function extractFrames(data, timeField) {
	const map = new Map()
	for (const row of data) {
		const key = row[timeField]
		if (!map.has(key)) map.set(key, [])
		map.get(key).push(row)
	}
	return map
}

/**
 * Ensures all frame values (byField) appear for every (x, color?) combination.
 * Uses dataset alignBy to fill missing frame-value combos with y=0 so bars
 * animate smoothly rather than disappearing between frames.
 *
 * Call after pre-aggregation. The result can be split directly by extractFrames
 * with no further per-frame normalization needed.
 *
 * @param {Object[]} data - pre-aggregated rows, one per (x, color?, byField)
 * @param {{ x?: string, y: string, color?: string }} channels
 * @param {string} byField - the frame field (e.g. 'year')
 * @returns {Object[]}
 */
export function completeFrames(data, channels, byField) {
	const { x: xf, y: yf, color: cf } = channels
	const groupFields = [xf, ...(cf ? [cf] : [])].filter(Boolean)

	if (groupFields.length === 0) return data

	const nested = dataset(data)
		.groupBy(...groupFields)
		.alignBy(byField)
		.usingTemplate({ [yf]: 0 })
		.rollup()
		.select()

	return nested.flatMap((row) => {
		const groupKey = groupFields.reduce((acc, f) => ({ ...acc, [f]: row[f] }), {})
		// strip the actual_flag marker added by alignBy
		return row.children.map(({ actual_flag: _af, ...child }) => ({ ...groupKey, ...child }))
	})
}

/**
 * Computes static x/y domains from the full (pre-split) data array.
 * These domains stay constant throughout the animation so values are
 * always comparable across frames.
 *
 * NOTE: y domain is pinned to [0, max] — assumes bar chart semantics.
 * Pass an explicit yDomain override for scatter/line charts where y can
 * be negative.
 *
 * @param {Object[]} data - full dataset (before frame extraction)
 * @param {{ x: string, y: string }} channels
 * @returns {{ xDomain: unknown[], yDomain: [number, number] }}
 */
export function computeStaticDomains(data, channels) {
	const { x: xf, y: yf } = channels

	const sampleX = data[0]?.[xf]
	const xDomain =
		typeof sampleX === 'string'
			? [...new Set(data.map((d) => d[xf]))]
			: extent(data, (d) => Number(d[xf]))

	const [, yMax] = extent(data, (d) => Number(d[yf]))
	const yDomain = [0, yMax ?? 0]

	return { xDomain, yDomain }
}
