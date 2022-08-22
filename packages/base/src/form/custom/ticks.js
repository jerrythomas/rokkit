export function generateTicks(
	lowerBound,
	upperBound,
	minorTickStep,
	majorTickStep = 1
) {
	minorTickStep = minorTickStep ? minorTickStep : upperBound - lowerBound
	const length = 1 + Math.ceil((upperBound - lowerBound) / minorTickStep)
	const ticks = Array.from({ length }, (_, i) => ({
		value: i == length - 1 ? upperBound : lowerBound + minorTickStep * i,
		show: i == 0 || i == length - 1 || i % majorTickStep == 0
	})).map(({ value, show }) => ({ value, label: show ? value : '' }))

	return ticks
}
