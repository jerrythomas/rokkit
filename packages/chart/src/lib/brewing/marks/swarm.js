import { ascending } from 'd3-array'

/**
 * Deterministic pseudo-random in [0, 1) from a non-negative integer seed.
 * Avoids Math.random so layouts are stable across renders (repo rule).
 *
 * @param {number} n
 * @returns {number}
 */
function hashUnit(n) {
	const x = Math.sin(n + 1) * 43758.5453
	return x - Math.floor(x)
}

/**
 * Places one point per datum within each x-band. Two layouts:
 *  - 'jitter': deterministic horizontal offset seeded by index-in-group.
 *  - 'swarm':  1-D beeswarm — sort by y, dodge horizontally to avoid overlap.
 *
 * @param {Object[]} data - raw rows (stat=identity)
 * @param {{ x?: string, y?: string, fill?: string }} channels
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map<unknown, {fill:string, stroke:string}>} colors
 * @param {{ method?: 'jitter'|'swarm', r?: number, side?: 'left'|'right'|'center' }} opts
 *   `side` confines points to one half of the band (for raincloud/half-plots).
 * @returns {Array<{ cx:number, cy:number, fill:string, stroke:string, data:Record<string, unknown> }>}
 */
export function buildSwarm(data, channels, xScale, yScale, colors, opts = {}) {
	const { x: xf, y: yf, fill: ff } = channels
	const { method = 'jitter', r = 2, side = 'center' } = opts
	const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 40
	// One-sided layouts get the full half-band on their side; centred straddles ±halfBand.
	const halfBand = (bw / 2) * 0.8 // leave a small gutter

	// Group rows by x value, preserving first-seen order.
	const groups = new Map()
	for (const d of data) {
		const key = d[xf]
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key).push(d)
	}

	const result = []
	for (const [xVal, rows] of groups) {
		const bandStart = typeof xScale.bandwidth === 'function' ? (xScale(xVal) ?? 0) : (xScale(xVal) ?? 0) - bw / 2
		const center = bandStart + bw / 2
		const offsets =
			method === 'swarm'
				? swarmOffsets(rows, yf, yScale, r, halfBand, side)
				: rows.map((_, i) => jitterOffset(hashUnit(i), halfBand, side))

		rows.forEach((d, i) => {
			const fillKey = ff ? d[ff] : xVal
			const colorEntry = colors?.get(fillKey) ?? { fill: '#aaa', stroke: '#666' }
			result.push({
				data: d,
				cx: center + offsets[i],
				cy: yScale(d[yf]),
				fill: colorEntry.fill,
				stroke: colorEntry.stroke
			})
		})
	}
	return result
}

// Map a [0,1) hash to a horizontal offset, confined to the requested side.
//  center → [-halfBand, halfBand];  right → [0, halfBand];  left → [-halfBand, 0]
function jitterOffset(u, halfBand, side) {
	if (side === 'right') return u * halfBand
	if (side === 'left') return -u * halfBand
	return (u * 2 - 1) * halfBand
}

/**
 * Computes horizontal offsets for a beeswarm: sort by y, then for each point
 * pick the smallest-magnitude offset that doesn't collide (distance >= 2r) with
 * any already-placed point in the group. When the band is over capacity (more
 * points than fit at 2r spacing), fall back to the least-crowded slot (max
 * separation) so overflow points spread across the band instead of stacking at
 * the center — a best-effort layout, not a hard non-overlap guarantee.
 * `side` confines candidates to one half of the band. Returns offsets in INPUT order.
 */
function swarmOffsets(rows, yf, yScale, r, halfBand, side = 'center') {
	const order = rows
		.map((d, i) => ({ i, cy: yScale(d[yf]) }))
		.sort((a, b) => ascending(a.cy, b.cy))
	const placed = []
	const offsetByIndex = new Array(rows.length).fill(0)
	const step = r / 2
	const kMax = Math.ceil((2 * halfBand) / step)

	for (const { i, cy } of order) {
		let chosen = 0
		let placedOne = false
		let best = { offset: 0, sep: -Infinity }
		for (let k = 0; k <= kMax; k++) {
			const candidate =
				side === 'right'
					? k * step
					: side === 'left'
						? -k * step
						: k === 0
							? 0
							: (k % 2 === 1 ? 1 : -1) * Math.ceil(k / 2) * step
			if (Math.abs(candidate) > halfBand) continue
			const sep = placed.length
				? Math.min(...placed.map((p) => Math.hypot(candidate - p.offset, cy - p.cy)))
				: Infinity
			if (sep >= 2 * r) {
				chosen = candidate
				placedOne = true
				break
			}
			if (sep > best.sep) best = { offset: candidate, sep }
		}
		// Band over capacity: fall back to the least-crowded slot (max separation)
		// rather than stacking every overflow point at the center.
		if (!placedOne) chosen = best.offset
		placed.push({ offset: chosen, cy })
		offsetByIndex[i] = chosen
	}
	return offsetByIndex
}
