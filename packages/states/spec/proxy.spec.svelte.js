import { describe, it, expect } from 'vitest'
import { Proxy } from '../src/proxy.svelte.js'
import { defaultFields } from '@rokkit/core'
import { flushSync } from 'svelte'

describe('Proxy', () => {
	it('should create a new proxy for string', () => {
		const proxy = new Proxy('123')
		expect(proxy.value).toEqual('123')
		expect(proxy.has('text')).toBe(true)
		expect(proxy.has('value')).toBe(false)
		expect(proxy.has('id')).toBe(false)
		expect(proxy.get('text')).toEqual('123')
		expect(proxy.fields).toEqual(defaultFields)
		expect(proxy.hasChildren).toBe(false)
	})

	it('should create a new proxy for string with custom fields', () => {
		const proxy = new Proxy('123', { text: 't' })
		expect(proxy.value).toEqual('123')
		expect(proxy.has('text')).toBe(true)
		expect(proxy.has('value')).toBe(false)
		expect(proxy.has('id')).toBe(false)
		expect(proxy.get('text')).toEqual('123')
		expect(proxy.fields).toEqual({ ...defaultFields, text: 't' })
		expect(proxy.hasChildren).toBe(false)
	})

	it('should create proxy for object', () => {
		const proxy = new Proxy({ id: '123', name: 'John' })
		expect(proxy.get('id')).toBe('123')
		expect(proxy.has('icon')).toBe(false)
		expect(proxy.has('name')).toBe(false)
		expect(proxy.hasChildren).toBe(false)
	})

	it('should handle field mapping', () => {
		const input = $state({ name: 'John', avatar: 'avatar.jpg' })
		const proxy = new Proxy(input, { text: 'name', icon: 'avatar' })
		expect(proxy.get('text')).toEqual('John')
		expect(proxy.get('icon')).toEqual('avatar.jpg')

		proxy.value = { name: 'Jane', avatar: 'avatar2.jpg' }
		flushSync()
		expect(proxy.get('text')).toEqual('Jane')
		expect(proxy.get('icon')).toEqual('avatar2.jpg')
		expect(proxy.value).toBe(input)

		proxy.fields = { icon: 'avatar' }
		flushSync()
		expect(proxy.fields).toEqual({ ...defaultFields, icon: 'avatar' })
		expect(proxy.hasChildren).toBe(false)
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
		expect(proxy.fields).toEqual({ ...defaultFields, icon: 'avatar' })
	})

	it('should identify if item has children', () => {
		const proxy = new Proxy({ children: [] })
		expect(proxy.hasChildren).toBe(false)
		proxy.value = { children: [{ id: '123', name: 'John' }] }
		flushSync()
		expect(proxy.hasChildren).toBe(true)

		proxy.fields = { children: 'items' }
		expect(proxy.hasChildren).toBe(false)
		proxy.value = { items: [{ id: '123', name: 'John' }] }
		flushSync()
		expect(proxy.hasChildren).toBe(true)
	})
})
