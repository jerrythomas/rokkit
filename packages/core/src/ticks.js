export function generateTicks(
	lowerBound,
	upperBound,
	minorTickStep,
	majorTickStep = 1,
	formatter = new Intl.NumberFormat('en-US', { CompactDisplay: 'short' })
) {
	minorTickStep = minorTickStep ? minorTickStep : upperBound - lowerBound
	const length = 1 + Math.ceil((upperBound - lowerBound) / minorTickStep)
	const ticks = Array.from({ length }, (_, i) => ({
		value: i == length - 1 ? upperBound : lowerBound + minorTickStep * i,
		major: i == 0 || i == length - 1 || i % majorTickStep == 0
	})).map(({ value, major }) => ({
		value,
		label: major ? formatter.format(value) : '',
		major
	}))

	return ticks
}
