/* eslint-disable no-console */
import { noop } from '@rokkit/core'

export const PARSE_ERROR_MESSAGE = 'Unable to parse value from local storage for key: '

if (typeof window === 'undefined') {
	global.localStorage = {
		getItem: () => '{}',
		setItem: noop
	}
}

/**
 * Create a persistable store
 *
 * @param {string} key - The key to use for the local storage
 * @param {Writable} store - The store to set the value to
 * @returns {Object} The persistable store
 */
export function persistable(key, store) {
	let value = getStoredValue(key, store)
	const handler = createStorageEventHandler(key, store)

	if (typeof window !== 'undefined') window.addEventListener('storage', handler)

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
		if (typeof window !== 'undefined') window.removeEventListener('storage', handler)
	}

	return {
		subscribe: store.subscribe,
		set,
		update,
		destroy
	}
}

/**
 * Get the stored value from local storage
 * @param {string} key - The key to use for the local storage
 * @param {Writable} store - The store to set the value to
 * @returns {Object} The stored value
 */
function getStoredValue(key, store) {
	try {
		const value = JSON.parse(localStorage.getItem(key) ?? '{}')
		store.set(value)
		return value
	} catch {
		console.error(PARSE_ERROR_MESSAGE, key)
	}
	return {}
}

/**
 * Create a storage event handler
 *
 * @param {string} key - The key to use for the local storage
 * @param {Writable} store - The store to set the value to
 * @returns {Function} The storage event handler
 */
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
