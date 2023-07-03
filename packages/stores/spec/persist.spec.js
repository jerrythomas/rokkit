import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { persistable, PARSE_ERROR_MESSAGE } from '../src/persist'
import { writable, get } from 'svelte/store'

describe('persistable', () => {
	const key = 'test_key'

	let expectedValue = null

	beforeEach(() => {
		console.error = vi.fn()
		expectedValue = {}
		localStorage.setItem(key, JSON.stringify(expectedValue))
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('should retrieve the value from local storage', () => {
		const value = { test: 'Alpha' }
		localStorage.setItem(key, JSON.stringify(value))
		const store = persistable(key, writable())

		expect(get(store)).toEqual(value)
		expect(JSON.parse(localStorage.getItem(key))).toEqual(value)

		store.destroy()
	})

	it('should save the value to local storage', () => {
		const store = persistable(key, writable())

		expect(get(store)).toEqual({})
		expect(JSON.parse(localStorage.getItem(key))).toEqual({})

		const newValue = { test: 'Beta' }
		store.set(newValue)
		expect(get(store)).toEqual(newValue)
		expect(JSON.parse(localStorage.getItem(key))).toEqual(newValue)

		store.destroy()
	})

	it('should update the value in local storage', () => {
		const store = persistable(key, writable())
		const newValue = { test: 'Charlie' }

		expect(get(store)).toEqual({})
		expect(JSON.parse(localStorage.getItem(key))).toEqual({})

		store.update(() => newValue)
		expect(get(store)).toEqual(newValue)
		expect(JSON.parse(localStorage.getItem(key))).toEqual(newValue)
		store.destroy()
	})

	it('should update the store if the value in local storage changes', () => {
		const store = persistable(key, writable())

		expect(get(store)).toEqual({})
		expect(JSON.parse(localStorage.getItem(key))).toEqual({})

		const newValue = { test: 'Delta' }
		expectedValue = newValue
		localStorage.setItem(key, JSON.stringify(newValue))
		window.dispatchEvent(
			new StorageEvent('storage', { key, newValue: JSON.stringify(newValue) })
		)
		expect(get(store)).toEqual(newValue)
		expect(JSON.parse(localStorage.getItem(key))).toEqual(newValue)

		store.destroy()
	})

	it('should not update the store if the value in local storage is the same', () => {
		const store = persistable(key, writable())
		expect(get(store)).toEqual({})
		expect(JSON.parse(localStorage.getItem(key))).toEqual({})

		expectedValue = { test: 'Echo' }
		store.set(expectedValue)
		expect(get(store)).toEqual(expectedValue)
		expect(JSON.parse(localStorage.getItem(key))).toEqual(expectedValue)

		const spy = vi.spyOn(store, 'set')
		localStorage.setItem(key, JSON.stringify(expectedValue))
		window.dispatchEvent(
			new StorageEvent('storage', {
				key,
				newValue: JSON.stringify(expectedValue)
			})
		)
		expect(spy).not.toHaveBeenCalled()
		store.destroy()
	})

	it('should not update the store if the value in local storage is invalid', () => {
		localStorage.setItem(key, '{]')
		const store = persistable(key, writable({}))
		expect(get(store)).toEqual({})
		expect(console.error).toHaveBeenCalledWith(PARSE_ERROR_MESSAGE, key)
		expect(console.error).toHaveBeenCalledOnce()
		store.destroy()
	})
	it('should not update the store if when other task messes the data', () => {
		const store = persistable(key, writable({}))
		expect(get(store)).toEqual({})

		window.dispatchEvent(
			new StorageEvent('storage', {
				key,
				newValue: '[}'
			})
		)
		expect(get(store)).toEqual({})
		expect(console.error).toHaveBeenCalledWith(PARSE_ERROR_MESSAGE, key)
		expect(console.error).toHaveBeenCalledOnce()
		store.destroy()
	})
})
