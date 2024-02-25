export function getTicks(lower, upper, steps = { major: 10, minor: 0 }) {
	if (steps.major === 0 && steps.minor === 0) return []
	const minorTicks = Array.from(
		{ length: Math.floor((upper - lower) / steps.minor) + 1 },
		(_, i) => ({
			position: i * steps.minor,
			label: i * steps.minor,
			type: 'minor'
		})
	)
	const majorTicks = Array.from(
		{ length: Math.floor((upper - lower) / steps.major) + 1 },
		(_, i) => ({
			position: i * steps.major,
			label: i * steps.major,
			type: 'major'
		})
	)
	const end = [
		{ position: upper, label: upper, type: 'end' },
		{ position: lower, label: lower, type: 'end' }
	]

	return [...minorTicks, ...majorTicks, ...end].sort((a, b) => a.position - b.position)
}
