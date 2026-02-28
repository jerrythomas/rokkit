import { describe, it, expect, vi } from 'vitest'
import { Proxy } from '../src/proxy.svelte.js'
import { DEFAULT_FIELDS } from '@rokkit/core'
import { flushSync } from 'svelte'

describe('Proxy', () => {
	it('should create a new proxy for string', () => {
		const proxy = new Proxy('123')
		expect(proxy.value).toEqual('123')
		expect(proxy.has('text')).toBe(true)
		expect(proxy.has('value')).toBe(false)
		expect(proxy.has('id')).toBe(false)
		expect(proxy.get('text')).toEqual('123')
		expect(proxy.id).toEqual('123')
		expect(proxy.fields).toEqual(DEFAULT_FIELDS)
		expect(proxy.hasChildren).toBe(false)

		proxy.value = '345'
		proxy.id = 1
		expect(proxy.value).toEqual('345')
		expect(proxy.get('text')).toBe('345')
		expect(proxy.id).toEqual('1')

		proxy.id = '123'
		expect(proxy.id).toEqual('123')
	})

	it('should create a new proxy for null', () => {
		const proxy = new Proxy(null)
		expect(proxy.value).toEqual(null)
		expect(proxy.has('text')).toBe(false)
		expect(proxy.has('value')).toBe(false)
		expect(proxy.has('id')).toBe(false)
		expect(proxy.get('text')).toBeUndefined()
		expect(proxy.id).toBeTruthy()
		expect(proxy.fields).toEqual(DEFAULT_FIELDS)
		expect(proxy.hasChildren).toBe(false)

		proxy.value = '345'
		proxy.id = 1
		expect(proxy.value).toEqual('345')
		expect(proxy.get('text')).toBe('345')
		expect(proxy.id).toEqual('1')

		proxy.id = '123'
		expect(proxy.id).toEqual('123')
	})

	it('should create a new proxy for string with custom fields', () => {
		const proxy = new Proxy('123', { text: 't' })
		expect(proxy.value).toEqual('123')
		expect(proxy.has('text')).toBe(true)
		expect(proxy.has('value')).toBe(false)
		expect(proxy.has('id')).toBe(false)
		expect(proxy.get('text')).toEqual('123')
		expect(proxy.id).toEqual('123')
		expect(proxy.fields).toEqual({ ...DEFAULT_FIELDS, text: 't' })
		expect(proxy.hasChildren).toBe(false)
		expect(proxy.children).toEqual([])
	})

	it('should create proxy for object', () => {
		const proxy = new Proxy({ id: '123', name: 'John' })
		expect(proxy.get('id')).toBe('123')
		expect(proxy.has('icon')).toBe(false)
		expect(proxy.has('name')).toBe(false)
		expect(proxy.id).toEqual('123')
		expect(proxy.hasChildren).toBe(false)
		expect(proxy.children).toEqual([])
	})

	it('should handle field mapping', () => {
		const input = $state({ name: 'John', avatar: 'avatar.jpg' })
		const proxy = new Proxy(input, { text: 'name', icon: 'avatar' })
		expect(proxy.get('text')).toEqual('John')
		expect(proxy.get('icon')).toEqual('avatar.jpg')
		expect(proxy.id.length > 8).toBeTruthy()

		proxy.value = { name: 'Jane', avatar: 'avatar2.jpg' }
		flushSync()
		expect(proxy.get('text')).toEqual('Jane')
		expect(proxy.get('icon')).toEqual('avatar2.jpg')
		expect(proxy.value).toBe(input)

		proxy.fields = { icon: 'avatar' }
		flushSync()
		expect(proxy.fields).toEqual({ ...DEFAULT_FIELDS, icon: 'avatar' })
		expect(proxy.hasChildren).toBe(false)
		expect(proxy.children).toEqual([])
	})

	it('should handle default value', () => {
		const input = $state({})
		const proxy = new Proxy(input, { text: 'name', icon: 'avatar' })
		expect(proxy.get('text', 'unknown')).toEqual('unknown')
		expect(proxy.get('icon', 'missing')).toEqual('missing')

		proxy.value = { name: 'Jane', avatar: 'avatar2.jpg' }
		flushSync()
		expect(proxy.get('text')).toEqual('Jane')
		expect(proxy.get('icon')).toEqual('avatar2.jpg')
		expect(proxy.value).toBe(input)

		proxy.fields = { icon: 'avatar' }
		flushSync()
		expect(proxy.fields).toEqual({ ...DEFAULT_FIELDS, icon: 'avatar' })
	})

	it('should identify if item has children', () => {
		const proxy = new Proxy({ children: [] })
		expect(proxy.hasChildren).toBe(false)
		expect(proxy.children).toEqual([])

		proxy.value = { children: [{ id: '123', name: 'John' }] }
		flushSync()
		expect(proxy.hasChildren).toBe(true)
		expect(proxy.children.length).toEqual(1)
		expect(proxy.children[0].value).toEqual(proxy.value.children[0])

		proxy.fields = { children: 'items' }
		expect(proxy.hasChildren).toBe(false)
		proxy.value = { items: [{ id: '123', name: 'John' }] }
		flushSync()
		expect(proxy.hasChildren).toBe(true)
	})
	it('should handle invalid children atribute', () => {
		const proxy = new Proxy({ children: 'x' })
		expect(proxy.hasChildren).toBe(false)
		expect(proxy.children).toEqual([])
	})
	it('should return a snippet', () => {
		const fallback = vi.fn().mockReturnValue('fallback')
		const snippets = {
			child: vi.fn().mockReturnValue('child'),
			other: vi.fn().mockReturnValue('other')
		}
		const item = $state({})
		const proxy = new Proxy(item)
		let snippet = proxy.getSnippet(snippets)
		expect(snippet).toBeUndefined()
		snippet = proxy.getSnippet(snippets, fallback)
		expect(snippet()).toEqual('fallback')

		item.snippet = 'child'
		flushSync()
		snippet = proxy.getSnippet(snippets, fallback)
		expect(snippet()).toEqual('child')

		item.snippet = 'other'
		flushSync()
		snippet = proxy.getSnippet(snippets, fallback)
		expect(snippet()).toEqual('other')
	})

	it('should handle expanded property getter (read-only)', () => {
		// Test with object that has expanded field
		const item = $state({ id: '123', name: 'John', _expanded: true })
		const proxy = new Proxy(item, { expanded: '_expanded' })

		// Getter returns the original item's expanded value
		expect(proxy.expanded).toBe(true)

		// Without expanded field — returns false
		const itemWithoutExpanded = $state({ id: '456', name: 'Jane' })
		const proxyWithoutExpanded = new Proxy(itemWithoutExpanded)
		expect(proxyWithoutExpanded.expanded).toBe(false)

		// String proxy — returns false
		const stringProxy = new Proxy('test string')
		expect(stringProxy.expanded).toBe(false)
	})

	it('should read expanded with default fields', () => {
		const item = $state({ id: '123', name: 'John', _expanded: true })
		const proxy = new Proxy(item)
		expect(proxy.expanded).toBe(true)

		// Without the field — returns false
		const itemNoExpanded = $state({ id: '456', name: 'Jane' })
		const proxyNoExpanded = new Proxy(itemNoExpanded)
		expect(proxyNoExpanded.expanded).toBe(false)
	})

	it('should not mutate original item (expanded is read-only on proxy)', () => {
		const item = $state({ id: '123', name: 'John' })
		const proxy = new Proxy(item)
		// Proxy reads initial state — no _expanded on item means false
		expect(proxy.expanded).toBe(false)
		// Original item should NOT have _expanded set
		expect(item._expanded).toBeUndefined()
	})

	it('should handle edge cases in processChildren', () => {
		// Test with null value to trigger isNil(this.#value) condition
		const proxy = new Proxy(null)
		expect(proxy.children).toEqual([])
		expect(proxy.hasChildren).toBe(false)

		// Test with undefined to ensure we cover the condition
		const proxy2 = new Proxy(undefined)
		expect(proxy2.children).toEqual([])
		expect(proxy2.hasChildren).toBe(false)
	})

	it('should handle fields being set to null or undefined', () => {
		// Test that setting fields to null/undefined still works due to spread operator
		const item = $state({ children: [{ id: '1', name: 'child' }] })
		const proxy = new Proxy(item)

		// Setting fields to null results in DEFAULT_FIELDS due to spread operator
		proxy.fields = null
		flushSync()
		expect(proxy.fields).toEqual(DEFAULT_FIELDS)
		expect(proxy.children.length).toBe(1) // Children are processed normally

		// Setting fields to undefined also results in DEFAULT_FIELDS
		proxy.fields = undefined
		flushSync()
		expect(proxy.fields).toEqual(DEFAULT_FIELDS)
		expect(proxy.children.length).toBe(1) // Children are processed normally
	})
})
