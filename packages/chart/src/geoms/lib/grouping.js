/**
 * Shared by the geoms that summarise GROUPS of points (Hull, Contour) rather than drawing one
 * mark per row: bucket rows by the group field, and place each row on screen — or drop it
 * when it has no usable coordinate, which is a normal state in a partially-measured dataset.
 */

/**
 * Screen position of one value on a scale, or null when the row has no usable coordinate
 * (null / empty / a category the scale does not know / NaN). A band category resolves to its
 * centre, where a point in that category is drawn.
 *
 * @param {any} scale
 * @param {unknown} v
 * @returns {number | null}
 */
export function coordOf(scale, v) {
	if (v === null || v === undefined || v === '') return null
	const s = scale(v)
	if (s === null || s === undefined || Number.isNaN(s)) return null
	return typeof scale.bandwidth === 'function' ? s + scale.bandwidth() / 2 : s
}

/**
 * Rows bucketed by `field`, in first-seen order. One bucket (key `null`) without a field.
 *
 * @param {Record<string, unknown>[]} data
 * @param {string | undefined} field
 * @returns {Map<unknown, Record<string, unknown>[]>}
 */
export function groupRows(data, field) {
	const groups = new Map()
	for (const row of data) {
		const key = field ? row[field] : null
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key).push(row)
	}
	return groups
}

/**
 * Screen points for rows, after orientation `place`, skipping rows with no coordinate.
 *
 * @param {Record<string, unknown>[]} rows
 * @param {any} plot
 * @param {{ x?: string, y?: string }} channels
 * @returns {Array<[number, number]>}
 */
export function screenPoints(rows, plot, channels) {
	/** @type {Array<[number, number]>} */
	const pts = []
	for (const row of rows) {
		const u = coordOf(plot.xScale, row[channels.x ?? ''])
		const v = coordOf(plot.yScale, row[channels.y ?? ''])
		if (u === null || v === null) continue
		const p = plot.place(u, v)
		pts.push([p.x, p.y])
	}
	return pts
}
