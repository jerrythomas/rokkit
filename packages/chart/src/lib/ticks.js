function ticksByType(lower, upper, steps, type) {
	return Array.from({ length: Math.floor((upper - lower) / steps[type]) + 1 }, (_, i) => ({
		position: i * steps[type],
		label: i * steps[type],
		type
	}))
}

export function getTicks(lower, upper, steps = { major: 10, minor: 0 }) {
	if (steps.major === 0 && steps.minor === 0) return []
	const minorTicks = ticksByType(lower, upper, steps.major, 'major')
	const majorTicks = ticksByType(lower, upper, steps.minor, 'minor')
	const end = [
		{ position: upper, label: upper, type: 'end' },
		{ position: lower, label: lower, type: 'end' }
	]

	return [...minorTicks, ...majorTicks, ...end].sort((a, b) => a.position - b.position)
}
