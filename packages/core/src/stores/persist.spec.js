import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { persistable } from './persist'
import { writable } from 'svelte/store'

describe('persistable', () => {
	const key = 'test_key'

	let expectedValue = null
	let storeValidator

	beforeEach(() => {
		expectedValue = {}
		localStorage.setItem(key, JSON.stringify(expectedValue))
		storeValidator = vi.fn().mockImplementation((data) => {
			expect(data).toEqual(expectedValue)
			const storedValue = JSON.parse(localStorage.getItem(key))
			expect(storedValue).toEqual(expectedValue)
		})
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should retrieve the value from local storage', () => {
		const value = { test: 'Alpha' }
		localStorage.setItem(key, JSON.stringify(value))
		const store = persistable(key, writable())

		expectedValue = value
		store.subscribe(storeValidator)
		expect(storeValidator).toHaveBeenCalled()
	})

	it('should save the value to local storage', () => {
		const store = persistable(key, writable())

		// expect(JSON.parse(localStorage.getItem(key))).toEqual(expectedValue)
		store.subscribe(storeValidator)
		expect(storeValidator).toHaveBeenCalledTimes(1)

		const newValue = { test: 'Beta' }
		expectedValue = newValue
		store.set(newValue)
		expect(storeValidator).toHaveBeenCalledTimes(2)
	})

	it('should update the value in local storage', () => {
		const store = persistable(key, writable())
		const newValue = { test: 'Charlie' }

		store.subscribe(storeValidator)
		expect(storeValidator).toHaveBeenCalledTimes(1)

		expectedValue = newValue
		store.update(() => newValue)
		expect(storeValidator).toHaveBeenCalledTimes(2)
	})

	it('should update the store if the value in local storage changes', () => {
		const store = persistable(key, writable())

		store.subscribe(storeValidator)
		expect(storeValidator).toHaveBeenCalledTimes(1)

		const newValue = { test: 'Delta' }
		expectedValue = newValue
		localStorage.setItem(key, JSON.stringify(newValue))
		window.dispatchEvent(
			new StorageEvent('storage', { key, newValue: JSON.stringify(newValue) })
		)
		expect(storeValidator).toHaveBeenCalledTimes(2)
	})

	it('should not update the store if the value in local storage is the same', () => {
		const store = persistable(key, writable())

		store.subscribe(storeValidator)
		expect(storeValidator).toHaveBeenCalledTimes(1)

		expectedValue = { test: 'Echo' }
		store.set(expectedValue)
		expect(storeValidator).toHaveBeenCalledTimes(2)

		const spy = vi.spyOn(store, 'set')
		localStorage.setItem(key, JSON.stringify(expectedValue))
		window.dispatchEvent(
			new StorageEvent('storage', {
				key,
				newValue: JSON.stringify(expectedValue)
			})
		)
		expect(spy).not.toHaveBeenCalled()
	})
})
