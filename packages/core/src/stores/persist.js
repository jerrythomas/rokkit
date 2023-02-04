if (typeof window === 'undefined') {
	global.localStorage = {
		getItem: () => '',
		setItem: () => {}
	}
}
export function persistable(key, store) {
	let value
	try {
		value = JSON.parse(localStorage.getItem(key))
		store.set(value)
	} catch {
		console.error('Unable to parse value from local storage for key: ', key)
	}

	const set = (newValue) => {
		if (value !== newValue) {
			value = newValue
			localStorage.setItem(key, JSON.stringify(value))
			store.set(value)
		}
	}

	const update = (fn) => {
		store.update((currentValue) => {
			const value = fn(currentValue)
			localStorage.setItem(key, JSON.stringify(value))
			return value
		})
	}

	if (typeof window !== 'undefined') {
		window.addEventListener('storage', (event) => {
			if (event.key === key) {
				try {
					const newValue = JSON.parse(event.newValue)
					set(newValue)
				} catch (e) {
					console.error(
						'Unable to parse value from local storage for key: ',
						key
					)
				}
			}
		})
	}

	return {
		subscribe: store.subscribe,
		set,
		update
	}
}
