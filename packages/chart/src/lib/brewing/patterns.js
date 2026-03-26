/**
 * Converts a data key to a safe SVG element ID for pattern references.
 * Spaces and non-word characters are replaced to avoid broken url(#...) refs.
 * @param {unknown} key
 * @returns {string}
 */
export function toPatternId(key) {
	return `chart-pat-${String(key)
		.replace(/\s+/g, '-')
		.replace(/[^\w-]/g, '_')}`
}

// Keys must match the keys in packages/chart/src/patterns/patterns.js
export const PATTERN_ORDER = [
	'diagonal',
	'dots',
	'triangles',
	'hatch',
	'lattice',
	'swell',
	'checkerboard',
	'waves',
	'petals',
	'brick',
	'diamonds',
	'tile',
	'scales',
	'circles',
	'pip',
	'rings',
	'chevrons',
	'shards',
	'wedge',
	'argyle',
	'shell'
]

/**
 * Assigns patterns from PATTERN_ORDER to an array of distinct values.
 * @param {unknown[]} values
 * @returns {Map<unknown, string>}
 */
export function assignPatterns(values) {
	return new Map(values.map((v, i) => [v, PATTERN_ORDER[i % PATTERN_ORDER.length]]))
}
