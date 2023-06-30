import { describe, it, expect } from 'vitest'
import { persistable } from '../../src/stores/persist'
import { writable, get } from 'svelte/store'

/**
 * @vitest-environment node
 */
describe('persistable', () => {
	const key = 'test_key'
	it('should not fail when running on node env', () => {
		const value = { test: 'Alpha' }
		localStorage.setItem(key, JSON.stringify(value))
		const store = persistable(key, writable())

		expect(get(store)).toEqual({})
		expect(JSON.parse(localStorage.getItem())).toEqual({})
		store.set(value)
		expect(get(store)).toEqual(value)
		store.destroy()
	})
})
