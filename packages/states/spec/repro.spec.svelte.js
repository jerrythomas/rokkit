import { describe, it, expect } from 'vitest'
import { isNil, has } from 'ramda'
// import { flushSync } from 'svelte'

const defaultFields = { children: 'children' }

class Proxy {
	#value = $state()
	constructor(value, fields) {
		this.fields = fields
		this.#value = value
	}
	get value() {
		return this.#value
	}
	set value(new_value) {
		this.#value = new_value
	}
	get(fieldName, defaultValue) {
		return this.has(fieldName) ? this.value[this.fields[fieldName]] : defaultValue
	}
	has(fieldName) {
		const mappedField = this.fields[fieldName]
		return !isNil(mappedField) && has(mappedField, this.value)
	}

	get hasChildren() {
		return this.has('children') && Array.isArray(this.value[this.fields.children])
	}
}

export function deriveLookupWithProxy(items, fields = defaultFields, path = []) {
	const lookup = new Map()
	// console.log($state.snapshot(items))

	items.forEach((item, index) => {
		const itemPath = [...path, index]
		const key = itemPath.join('-')
		const proxy = new Proxy(item, fields)

		lookup.set(key, proxy)
		console.log(key)
		const children = proxy.value[fields.children] ?? []
		if (children.length > 0) {
			const childLookup = deriveLookupWithProxy(children, fields, itemPath)
			for (const [childKey, childValue] of childLookup.entries()) {
				lookup.set(childKey, childValue)
			}
		}
	})
	return lookup
}

describe('deriveLookupWithProxy', () => {
	it.only('should handle a nested array', () => {
		const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
		const lookup = $derived(deriveLookupWithProxy(items))
		const result = () => lookup
		expect(Array.from(result().keys())).toEqual(['0', '1', '2'])

		const addChildren = () => {
			items[0].children = [{ text: 'A1' }, { text: 'A2' }]
		}
		addChildren()
		// flushSync()
		expect(Array.from(result().keys())).toEqual(['0', '0-0', '0-1', '1', '2'])
	})
})
