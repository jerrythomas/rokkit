/**
 * Assemble the SelectDetail handed to a chart's onselect callback.
 *
 * Takes one named bag rather than six positionals: the tail of the old
 * signature read `…, { x, y }, 'line', seg?.key, event)` at every call site,
 * where nothing but the argument order told you which of the trailing values
 * was the geom and which was the series.
 *
 * @param {Object} args
 * @param {Record<string, unknown>} args.datum
 * @param {number} args.index  index within the geom's rendered data
 * @param {{ x?: string, y?: string }} args.channels
 * @param {'line'|'point'|'area'|'bar'|'radar'} args.geom
 * @param {unknown} [args.series]  color/group value, or undefined
 * @param {MouseEvent|KeyboardEvent} args.event
 */
export function buildSelectDetail({ datum, index, channels, geom, series, event }) {
	const { x, y } = channels
	return {
		datum,
		index,
		series: series ?? undefined,
		value: y ? datum[y] : undefined,
		x: x ? datum[x] : undefined,
		y: y ? datum[y] : undefined,
		geom,
		event
	}
}
