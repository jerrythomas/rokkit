export const PARSE_ERROR_MESSAGE =
	'Unable to parse value from local storage for key: '

if (typeof window === 'undefined') {
	global.localStorage = {
		getItem: () => '{}',
		setItem: () => {}
	}
}
export function persistable(key, store) {
	let value
	const storageEventListener = (event) => {
		if (event.key === key) {
			event.stopPropagation()
			event.preventDefault()
			try {
				const newValue = JSON.parse(event.newValue)
				set(newValue)
			} catch (e) {
				console.error(PARSE_ERROR_MESSAGE, key)
			}
		}
	}

	try {
		value = JSON.parse(localStorage.getItem(key))
		// console.log(value)
		store.set(value)
	} catch {
		console.error(PARSE_ERROR_MESSAGE, key)
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
		window.addEventListener('storage', storageEventListener)
	}

	return {
		subscribe: store.subscribe,
		set,
		update,
		destroy() {
			if (typeof window !== 'undefined') {
				window.removeEventListener('storage', storageEventListener)
			}
		}
	}
}
