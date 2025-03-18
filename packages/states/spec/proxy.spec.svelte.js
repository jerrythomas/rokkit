import { describe, it, expect } from 'vitest'
import { Proxy } from '../src/proxy.svelte.js'
import { defaultFields } from '@rokkit/core'
import { flushSync } from 'svelte'

describe('Proxy', () => {
	it('should create a new proxy for string', () => {
		const proxy = new Proxy('123')
		expect(proxy.value).toEqual({ text: '123' })
		expect(proxy.has('text')).toBe(true)
		expect(proxy.has('id')).toBe(false)
		expect(proxy.get('text')).toEqual('123')
		expect(proxy.fields).toEqual(defaultFields)
	})

	it('should create proxy for object', () => {
		const proxy = new Proxy({ id: '123', name: 'John' })
		expect(proxy.get('id')).toBe('123')
		expect(proxy.has('icon')).toBe(false)
		expect(proxy.has('name')).toBe(false)
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
	})
})
