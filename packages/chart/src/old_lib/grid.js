/**
 * @typedef GridPoint
 * @property {number} x - x-coordinate of the point
 * @property {number} y - y-coordinate of the point
 * @property {number} r - radius of the point
 */

/**
 * @typedef SwatchGrid
 * @property {number}      width  - width of the grid
 * @property {number}      height - height of the grid
 * @property {GridPoint[]} data   - data points of the grid
 */

/**
 * @tyoedef {Object} GridOptions
 * @property {number} [pad=0]     - The padding between the items
 * @property {number} [columns=0] - The number of columns
 * @property {number} [rows=0]    - The number of rows
 */

/**
 * Calculates a grid of centres to fit a list of items of `size` within the number of `columns` and `rows`.
 *
 * - Attempts to find a best fit square if both columns and rows are not specified
 * - Value in columns is prioritized over rows for recalculating the grid
 * - Supports padding between the items
 *
 * @param {number}      count   - number of items
 * @param {number}      size    - size of the items
 * @param {GridOptions} options - options for the grid
 * @returns {SwatchGrid}
 */
export function swatchGrid(count, size, options) {
	const { pad = 0 } = options || {}
	let { columns = 0, rows = 0 } = options || {}
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

/**
 * Spreads values as patterns with colors from a palette
 *
 * @param {number[]} values   - values to spread
 * @param {string[]} patterns - patterns to spread
 * @param {string[]} palette  - colors to spread
 * @returns {Record<number, { id: string, pattern: string, color: string }>}
 */
export function spreadValuesAsPatterns(values, patterns, palette) {
	const result = values
		.map((value, index) => ({
			pattern: patterns[index % patterns.length],
			color: palette[index % palette.length],
			value
		}))
		.reduce(
			(acc, { value, pattern, color }) => ({
				...acc,
				[value]: {
					id: `${pattern}_${color}`,
					pattern,
					color
				}
			}),
			{}
		)
	return result
}
