/**
 * Generates an array of tick marks for a range of values.
 *
 * @param {number} lowerBound                            - The lower bound of the range.
 * @param {number} upperBound                            - The upper bound of the range.
 * @param {number} [minorTickStep=upperBound-lowerBound] - The step size for minor ticks.
 * @param {number} [majorTickStep=1]                     - The step size for major ticks.
 * @returns {import('./types').TickMark[]>} An array of tick mark objects.
 */
export function generateTicks(
	lowerBound,
	upperBound,
	minorTickStep = upperBound - lowerBound,
	majorTickStep = 1
) {
	const length = 1 + Math.ceil((upperBound - lowerBound) / minorTickStep)
	return Array.from({ length }, (_, i) => {
		const value = i === length - 1 ? upperBound : lowerBound + minorTickStep * i
		const major = i === 0 || i === length - 1 || i % majorTickStep === 0
		return {
			value,
			label: major ? value : '',
			major
		}
	})
}
