import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { createNavigator } from '../src/navigation'

describe('list-navigation', () => {
	const items = Array.from({ length: 10 }, (_, i) => i + 1)

	it('should create a store for navigation', () => {
		const store = createNavigator(items)
		expect(get(store)).toEqual({ index: -1, value: null })
		expect(store).toHaveProperty('next')
		expect(store).toHaveProperty('previous')
		expect(store).toHaveProperty('first')
		expect(store).toHaveProperty('last')
		expect(store).toHaveProperty('select')
		expect(store).toHaveProperty('moveByOffset')
		expect(store).toHaveProperty('selectByIndex')
		expect(store).toHaveProperty('subscribe')
		expect(store).not.toHaveProperty('set')
		expect(store).not.toHaveProperty('update')
	})

	it('should move position by offset', () => {
		const store = createNavigator(items)
		store.moveByOffset(1)
		expect(get(store)).toEqual({ index: 0, value: 1 })
		store.moveByOffset(-1)
		expect(get(store)).toEqual({ index: 0, value: 1 })
		store.moveByOffset(5)
		expect(get(store)).toEqual({ index: 5, value: 6 })
		store.moveByOffset(15)
		expect(get(store)).toEqual({ index: 9, value: 10 })
		store.moveByOffset(-6)
		expect(get(store)).toEqual({ index: 3, value: 4 })
		store.moveByOffset(-15)
		expect(get(store)).toEqual({ index: 0, value: 1 })
	})

	it('should move to next item', () => {
		const store = createNavigator(items)
		expect(get(store)).toEqual({ index: -1, value: null })
		store.next()
		expect(get(store)).toEqual({ index: 0, value: 1 })
		store.next()
		expect(get(store)).toEqual({ index: 1, value: 2 })
	})

	it('should move to previous item', () => {
		const store = createNavigator(items)
		expect(get(store)).toEqual({ index: -1, value: null })
		store.previous()
		expect(get(store)).toEqual({ index: 0, value: 1 })
		store.next()
		expect(get(store)).toEqual({ index: 1, value: 2 })
		store.previous()
		expect(get(store)).toEqual({ index: 0, value: 1 })
	})
	it('should move to first item', () => {
		const store = createNavigator(items)
		expect(get(store)).toEqual({ index: -1, value: null })
		store.first()
		expect(get(store)).toEqual({ index: 0, value: 1 })
		store.moveByOffset(5)
		expect(get(store)).toEqual({ index: 5, value: 6 })
		store.first()
		expect(get(store)).toEqual({ index: 0, value: 1 })
	})

	it('should move to last item', () => {
		const store = createNavigator(items)
		expect(get(store)).toEqual({ index: -1, value: null })
		store.last()
		expect(get(store)).toEqual({ index: 9, value: 10 })
		store.moveByOffset(-5)
		expect(get(store)).toEqual({ index: 4, value: 5 })
		store.last()
		expect(get(store)).toEqual({ index: 9, value: 10 })
	})

	it('should select item by value', () => {
		const store = createNavigator(items)
		expect(get(store)).toEqual({ index: -1, value: null })
		store.select(5)
		expect(get(store)).toEqual({ index: 4, value: 5 })
		store.select(15)
		expect(get(store)).toEqual({ index: 4, value: 5 })
		store.select(-5)
		expect(get(store)).toEqual({ index: 4, value: 5 })
	})

	it('should select item by index', () => {
		const store = createNavigator(items)
		expect(get(store)).toEqual({ index: -1, value: null })
		store.select(5)
		expect(get(store)).toEqual({ index: 4, value: 5 })
		store.select(15)
		expect(get(store)).toEqual({ index: 4, value: 5 })
		store.select(-5)
		expect(get(store)).toEqual({ index: 4, value: 5 })
	})
})
