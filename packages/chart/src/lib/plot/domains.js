/**
 * Axis domains that a geom's own geometry decides, rather than the raw extent of its rows.
 *
 * A box spans its whiskers and outliers, not its rows' y; a stacked bar reaches its column
 * TOTAL; a waterfall bar sits on a running total. Pure functions over the rows a geom draws,
 * so they are testable without Svelte, and `resolveValueDomain` asks them in a fixed order —
 * a new geom with a geometry-driven domain adds a row to that table instead of editing the
 * scale code.
 */
import { stackFieldOf } from './stacking.js'
import { runningSpans } from './running.js'

const valid = (v) => v !== null && v !== undefined && !isNaN(v)

/**
 * Band categories ordered by their summed value — "sort bars by size". Null when not sorting.
 *
 * @param {Record<string, unknown>[][]} datasets - every geom's rows
 * @param {string | undefined} xf
 * @param {string | undefined} yf
 * @param {'asc' | 'desc' | undefined} sort
 */
export function sortedBandDomain(datasets, xf, yf, sort) {
	if (!sort || !xf || !yf) return null
	// A Map, not an object: keys are raw values (numbers, Dates) an object would stringify.
	const totals = new Map()
	for (const rows of datasets) {
		for (const d of rows) totals.set(d[xf], (totals.get(d[xf]) ?? 0) + (Number(d[yf]) || 0))
	}
	const dir = sort === 'asc' ? 1 : -1
	return [...totals.keys()].sort((a, b) => dir * (totals.get(a) - totals.get(b)))
}

/**
 * A box/violin spans its whiskers (`iqr_min` / `iqr_max`) and every outlier.
 *
 * @param {Record<string, any>[]} rows - box-stat rows
 */
export function boxDomain(rows) {
	const outliers = rows.flatMap((d) => d.outliers ?? []).filter(valid)
	const mins = [...rows.map((d) => d.iqr_min).filter(valid), ...outliers]
	const maxs = [...rows.map((d) => d.iqr_max).filter(valid), ...outliers]
	return mins.length > 0 && maxs.length > 0 ? [Math.min(...mins), Math.max(...maxs)] : null
}

/**
 * A stacked bar reaches its column total; a 100%-filled one reaches 1.
 *
 * Summed per (x, stack key), keeping the LAST value per key — the builder's own lookup does the
 * same, so rows sharing a key under an identity stat do not double-count. The stack key is the
 * builder's (`stackFieldOf`); with none, the builder draws plain bars, so there is no total to
 * size to and the normal extent applies (null).
 *
 * @param {Record<string, unknown>[]} rows
 * @param {{ x?: string, y?: string, group?: string, fill?: string, color?: string, pattern?: string }} channels
 * @param {'stack' | 'fill' | undefined} position
 */
export function stackDomain(rows, channels, position) {
	if (position === 'fill') return [0, 1]
	const stackField = stackFieldOf(channels)
	if (!channels.x || rows.length === 0 || !stackField) return null
	const columns = new Map()
	for (const d of rows) {
		const column = columns.get(d[channels.x]) ?? new Map()
		column.set(String(d[stackField]), Number(d[channels.y]) || 0)
		columns.set(d[channels.x], column)
	}
	const totals = [...columns.values()].map((c) => [...c.values()].reduce((s, v) => s + v, 0))
	return [0, Math.max(0, ...totals)]
}

/**
 * A waterfall spans its running total: each step from where the last ended, a total row from 0.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {string} field
 * @param {string} [totalField] - rows flagged here are totals, drawn from zero
 */
export function waterfallDomain(rows, field, totalField) {
	if (rows.length === 0) return null
	const spans = runningSpans(rows, field, totalField)
	return [Math.min(0, ...spans.map((s) => s.lo)), Math.max(0, ...spans.map((s) => s.hi))]
}

/** A geom's channels without the keys it left undefined (to inherit). */
const definedOf = (channels = {}) =>
	Object.fromEntries(Object.entries(channels).filter(([, v]) => v !== undefined))

const isStacked = (g) =>
	g.options?.stack || g.options?.position === 'stack' || g.options?.position === 'fill'

/**
 * Geom types whose geometry decides the VALUE axis, asked in order; the first to return a
 * domain wins. Each resolver reads the first mounted geom it matches.
 */
const VALUE_DOMAINS = [
	{ matches: (g) => g.type === 'box' || g.type === 'violin', domain: (rows) => boxDomain(rows) },
	{
		matches: isStacked,
		// The geom's OWN channels win — `group` exists only there — over the effective ones.
		domain: (rows, geom, channels, field) =>
			stackDomain(
				rows,
				{ ...channels, ...definedOf(geom.channels), y: field },
				geom.options?.position === 'fill' ? 'fill' : 'stack'
			)
	},
	{
		matches: (g) => g.type === 'waterfall',
		domain: (rows, geom, _channels, field) => waterfallDomain(rows, field, geom.options?.totalField)
	}
]

/**
 * The value-axis domain the mounted geoms' geometry demands, or null for the plain extent.
 *
 * @param {Array<{ id: string, type: string, options?: Record<string, any> }>} geoms
 * @param {(id: string) => Record<string, unknown>[]} rowsOf - a geom's rows (post-stat)
 * @param {{ x?: string, fill?: string, color?: string, pattern?: string }} channels - effective
 * @param {string} field - the value channel
 */
export function resolveValueDomain(geoms, rowsOf, channels, field) {
	for (const resolver of VALUE_DOMAINS) {
		const geom = geoms.find(resolver.matches)
		if (!geom) continue
		const domain = resolver.domain(rowsOf(geom.id), geom, channels, field)
		if (domain) return domain
	}
	return null
}
