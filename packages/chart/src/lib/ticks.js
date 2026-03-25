/**
 * @typedef {Object} TickSteps
 * @property {number} major - count of major ticks
 * @property {number} minor - count of minor ticks
 */

/**
 * Generate an array of ticks for a given axis and the tick type
 *
 * @param {number}    lower - The lower bound of the axis
 * @param {number}    upper - The upper bound of the axis
 * @param {TickSteps} steps - The number of steps between major and minor ticks
 * @param {string}    type  - The type of tick to generate
 *
 * @returns {Array} - An array of objects representing the ticks
 */
export function ticksByType(lower, upper, steps, type) {
	if (steps <= 0) return []
	return Array.from({ length: Math.floor((upper - lower) / steps) + 1 }, (_, i) => ({
		position: i * steps,
		label: i * steps,
		type
	})).filter((tick) => tick.position > lower && tick.position < upper)
}

/**
 * Generate an array of ticks for a given axis
 *
 * @param {number}    lower - The lower bound of the axis
 * @param {number}    upper - The upper bound of the axis
 * @param {TickSteps} steps - The number of steps between major and minor ticks
 *
 * @returns {Array} - An array of objects representing the ticks
 */
export function getTicks(lower, upper, steps = { major: 10, minor: 0 }) {
	const majorTicks = ticksByType(lower, upper, steps.major, 'major')
	const minorTicks = ticksByType(lower, upper, steps.minor, 'minor').filter(
		(tick) => !majorTicks.find((major) => major.position === tick.position)
	)
	const end = [
		{ position: upper, label: upper, type: 'end' },
		{ position: lower, label: lower, type: 'end' }
	]

	return [...minorTicks, ...majorTicks, ...end].sort((a, b) => a.position - b.position)
}
