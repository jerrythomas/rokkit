import { noop } from '@rokkit/core'
export const PARSE_ERROR_MESSAGE = 'Unable to parse value from local storage for key: '

if (typeof window === 'undefined') {
	global.localStorage = {
		getItem: () => '{}',
		setItem: noop
	}
}

export function persistable(key, store) {
	let value = getStoredValue(key, store)
	const handler = createStorageEventHandler(key, store)

	if (typeof window !== 'undefined') {
		window.addEventListener('storage', handler)
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
			const updatedValue = fn(currentValue)
			localStorage.setItem(key, JSON.stringify(updatedValue))
			return updatedValue
		})
	}

	const destroy = () => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('storage', handler)
		}
	}

	return {
		subscribe: store.subscribe,
		set,
		update,
		destroy
	}
}

function getStoredValue(key, store) {
	try {
		const value = JSON.parse(localStorage.getItem(key) ?? '{}')
		store.set(value)
		return value
	} catch {
		console.error(PARSE_ERROR_MESSAGE, key)
	}
}

function createStorageEventHandler(key, store) {
	return (event) => {
		if (event.key === key) {
			event.stopPropagation()
			event.preventDefault()
			try {
				const newValue = JSON.parse(event.newValue)
				store.set(newValue)
			} catch (e) {
				console.error(PARSE_ERROR_MESSAGE, key)
			}
		}
	}
}
