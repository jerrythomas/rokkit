/**
 * @typedef GridPoint
 * @property {number} x
 * @property {number} y
 * @property {number} r
 */

/**
 * @typedef SwatchGrid
 * @property {number} width
 * @property {number} height
 * @property {GridPoint[]} data
 */
/**
 * Calculates a grid of centres to fit a list of items of `size` within the number of `columns` and `rows`.
 *
 * - Attempts to find a best fit square if both columns and rows are not specified
 * - Value in columns is prioritized over rows for recalculating the grid
 * - Supports padding between the items
 *
 * @param {number} count
 * @param {number} size
 * @param {number} pad
 * @param {number} columns
 * @param {number} rows
 * @returns {SwatchGrid}
 */
export function swatchGrid(count, size, pad = 0, columns = 0, rows = 0) {
	if (columns > 0) {
		rows = Math.ceil(count / columns)
	} else if (rows > 0) {
		columns = Math.ceil(count / rows)
	} else {
		columns = Math.ceil(Math.sqrt(count))
		rows = Math.ceil(count / columns)
	}

	const width = (size + pad) * columns + pad
	const height = (size + pad) * rows + pad
	const radius = size / 2
	const data = [...Array(count).keys()].map((index) => ({
		x: pad + radius + (index % columns) * (size + pad),
		y: pad + radius + Math.floor(index / columns) * (size + pad),
		r: radius
	}))

	return { width, height, data }
}

export function spreadValuesAsPatterns(values, patterns, palette) {
	values
		.map((value, index) => ({
			pattern: patterns[index % patterns.length],
			color: palette[index % palette.length],
			value
		}))
		.reduce(
			(acc, { value, pattern, color }) => ({
				...acc,
				[value]: {
					id: pattern + '_' + color,
					pattern,
					color
				}
			}),
			{}
		)
}
