export function getSubscribedData(store) {
	let result
	let received = false
	let unsubscribe = store.subscribe((data) => {
		result = data
		received = true
	})
	while (!received) {}
	unsubscribe()
	return result
}
