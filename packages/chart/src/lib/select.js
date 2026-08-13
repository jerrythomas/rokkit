/**
 * Assemble the SelectDetail handed to a chart's onselect callback.
 * @param {Record<string, unknown>} datum
 * @param {number} index  index within the geom's rendered data
 * @param {{ x?: string, y?: string }} channels
 * @param {'line'|'point'|'area'|'bar'} geom
 * @param {unknown} series  color/group value, or undefined
 * @param {MouseEvent|KeyboardEvent} event
 */
export function buildSelectDetail(datum, index, channels, geom, series, event) {
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
