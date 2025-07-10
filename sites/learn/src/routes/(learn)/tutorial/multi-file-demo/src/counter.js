export function createCounter() {
	let count = $state(0)

	return {
		get value() {
			return count
		},
		increment() {
			count++
		},
		decrement() {
			count--
		},
		reset() {
			count = 0
		}
	}
}
