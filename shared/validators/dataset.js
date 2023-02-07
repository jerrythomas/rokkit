export const toHaveValidData = (received, expected) => {
	const actual = { ...received.dataset }
	if (actual === expected) {
		return {
			message: () => `expected ${actual} to match ${expected}`,
			pass: false
		}
	}
	return { pass: true }
}
