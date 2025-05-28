/**
 * Get fill patterns for a set of values
 *
 * @param {Array} values - Array of values
 * @param {Object} swatch - Object with keys for color, gray, and pattern
 * @param {Boolean} gray - Boolean to determine if gray or color
 * @returns {Object} - Object with keys for pattern and color
 */
export function getFillPatterns(values, swatch, gray = false) {
	const colors = gray ? swatch.keys.gray : swatch.keys.color
	const max_colors = colors.length
	const max_patterns = swatch.keys.pattern.length

	const mix = values
		.map((value, index) => ({
			[value]: {
				pattern: swatch.keys.pattern[index % max_patterns],
				color: colors[index % max_colors]
			}
		}))
		.reduce((acc, current) => ({ ...acc, ...current }), {})
	return mix
}

// export function getStrokePatterns() {}
