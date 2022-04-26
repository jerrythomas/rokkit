/**
 * Fetch current value from a writable
 *
 * @param {writable} store
 * @returns {*} current value of the store
 */
export function getSubscribedData(store) {
	let result
	const unsubscribe = store.subscribe((data) => {
		result = data
	})
	unsubscribe()
	return result
}
