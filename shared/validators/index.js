export const toIncludeAll = (received, expected) => {
	const result = expected.every((v) => received.includes(v))
	if (!result) {
		return {
			message: () =>
				`expected "[${received}]" to include all of "[${expected}]"`,
			pass: false
		}
	}
	return { pass: true }
}

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

export function getSubscribedData(store) {
	let result
	let unsubscribe = store.subscribe((data) => {
		result = data
	})
	unsubscribe()
	return result
}
