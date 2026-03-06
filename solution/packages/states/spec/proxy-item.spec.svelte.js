import { describe, it, expect, vi } from 'vitest'
import { ProxyItem, LazyProxyItem, BASE_FIELDS } from '../src/proxy-item.svelte.js'
import { normalizeFields } from '@rokkit/core'
import { flushSync } from 'svelte'

describe('BASE_FIELDS', () => {
	it('should have 17 keys', () => {
		expect(Object.keys(BASE_FIELDS)).toHaveLength(17)
	})

	it('should have correct semantic key mappings', () => {
		expect(BASE_FIELDS.label).toBe('label')
		expect(BASE_FIELDS.subtext).toBe('description')
		expect(BASE_FIELDS.tooltip).toBe('title')
		expect(BASE_FIELDS.avatar).toBe('image')
		expect(BASE_FIELDS.hrefTarget).toBe('target')
	})

	it('should have identity fields', () => {
		expect(BASE_FIELDS.id).toBe('id')
		expect(BASE_FIELDS.value).toBe('value')
	})

	it('should have structure fields', () => {
		expect(BASE_FIELDS.children).toBe('children')
		expect(BASE_FIELDS.type).toBe('type')
		expect(BASE_FIELDS.snippet).toBe('snippet')
		expect(BASE_FIELDS.href).toBe('href')
	})

	it('should have state fields', () => {
		expect(BASE_FIELDS.disabled).toBe('disabled')
		expect(BASE_FIELDS.expanded).toBe('expanded')
		expect(BASE_FIELDS.selected).toBe('selected')
	})
})

describe('normalizeFields', () => {
	it('should pass through text key unchanged (no longer a legacy key)', () => {
		expect(normalizeFields({ text: 'name' })).toEqual({ text: 'name' })
	})

	it('should pass through non-legacy keys unchanged', () => {
		expect(normalizeFields({ icon: 'myicon' })).toEqual({ icon: 'myicon' })
	})

	it('should return empty object for null', () => {
		expect(normalizeFields(null)).toEqual({})
	})

	it('should return empty object for undefined', () => {
		expect(normalizeFields(undefined)).toEqual({})
	})

	it('should remap combined legacy and non-legacy keys', () => {
		expect(normalizeFields({ text: 'name', description: 'desc', icon: 'x' })).toEqual({
			text: 'name',
			subtext: 'desc',
			icon: 'x'
		})
	})

	it('should remap all legacy keys (text is no longer legacy)', () => {
		expect(normalizeFields({ text: 'a', description: 'b', title: 'c', image: 'd', target: 'e' })).toEqual({
			text: 'a',
			subtext: 'b',
			tooltip: 'c',
			avatar: 'd',
			hrefTarget: 'e'
		})
	})
})

describe('ProxyItem', () => {
	describe('id', () => {
		it('should return item id field when present', () => {
			const proxy = new ProxyItem({ text: 'A', id: 'my-id' }, {}, '0', 1)
			expect(proxy.id).toBe('my-id')
		})

		it('should auto-generate id when item lacks id field', () => {
			const proxy = new ProxyItem({ text: 'A' }, {}, '0', 1)
			expect(proxy.id).toMatch(/^proxy-\d+$/)
		})

		it('should return stable id across multiple accesses', () => {
			const proxy = new ProxyItem({ text: 'A' }, {}, '0', 1)
			const first = proxy.id
			expect(proxy.id).toBe(first)
		})

		it('should generate unique ids for different proxies', () => {
			const p1 = new ProxyItem({ text: 'A' }, {}, '0', 1)
			const p2 = new ProxyItem({ text: 'B' }, {}, '1', 1)
			expect(p1.id).not.toBe(p2.id)
		})

		it('should use custom id field mapping', () => {
			const proxy = new ProxyItem({ text: 'A', code: 'abc' }, { id: 'code' }, '0', 1)
			expect(proxy.id).toBe('abc')
		})

		it('should auto-generate for primitives', () => {
			const proxy = new ProxyItem('hello', {}, '0', 1)
			expect(proxy.id).toMatch(/^proxy-\d+$/)
		})
	})

	describe('set()', () => {
		it('should write to the underlying object item via field mapping', () => {
			const raw = { label: 'hello', value: 1 }
			const proxy = new ProxyItem(raw, {}, '0', 1)

			proxy.set('label', 'world')
			expect(raw.label).toBe('world')
			expect(proxy.label).toBe('world')
		})

		it('should modify the original raw item reference', () => {
			const raw = { name: 'Alice', id: 42 }
			const proxy = new ProxyItem(raw, { label: 'name', value: 'id' }, '0', 1)

			proxy.set('label', 'Bob')
			expect(raw.name).toBe('Bob')
			expect(proxy.label).toBe('Bob')
		})

		it('should use unmapped field name as raw key when not in fields config', () => {
			const raw = { text: 'hello', custom: 'abc' }
			const proxy = new ProxyItem(raw, {}, '0', 1)

			proxy.set('custom', 'xyz')
			expect(raw.custom).toBe('xyz')
		})

		it('should trigger children recomputation when setting children', () => {
			const raw = { label: 'parent', children: [] }
			const proxy = new ProxyItem(raw, {}, '0', 1)

			expect(proxy.hasChildren).toBe(false)
			expect(proxy.children).toEqual([])

			proxy.set('children', [{ label: 'child1' }, { label: 'child2' }])
			flushSync()

			expect(raw.children).toHaveLength(2)
			expect(raw.children[0].label).toBe('child1')
			expect(proxy.hasChildren).toBe(true)
			expect(proxy.children).toHaveLength(2)
			expect(proxy.children[0].label).toBe('child1')
			expect(proxy.children[1].label).toBe('child2')
		})

		it('should update children from empty to populated', () => {
			const raw = { text: 'node', value: 'n1' }
			const proxy = new ProxyItem(raw, {}, '0', 1)

			expect(proxy.hasChildren).toBe(false)

			proxy.set('children', [{ text: 'a', value: 'a1' }])
			flushSync()

			expect(proxy.hasChildren).toBe(true)
			expect(proxy.children).toHaveLength(1)
			expect(proxy.children[0].value).toBe('a1')
		})

		it('should work with custom children field mapping', () => {
			const raw = { text: 'parent', items: [] }
			const proxy = new ProxyItem(raw, { children: 'items' }, '0', 1)

			expect(proxy.hasChildren).toBe(false)

			proxy.set('children', [{ text: 'sub' }])
			flushSync()

			expect(raw.items).toHaveLength(1)
			expect(raw.items[0].text).toBe('sub')
			expect(proxy.hasChildren).toBe(true)
			expect(proxy.children).toHaveLength(1)
		})

		it('children should have correct keys and levels after set()', () => {
			const raw = { text: 'root' }
			const proxy = new ProxyItem(raw, {}, '0', 1)

			proxy.set('children', [{ text: 'a' }, { text: 'b' }])
			flushSync()

			expect(proxy.children[0].key).toBe('0-0')
			expect(proxy.children[0].level).toBe(2)
			expect(proxy.children[1].key).toBe('0-1')
			expect(proxy.children[1].level).toBe(2)
		})
	})

	it('exposes fields config via getter', () => {
		const item = { name: 'Test', id: 1 }
		const proxy = new ProxyItem(item, { label: 'name', value: 'id' })
		const fields = proxy.fields
		expect(fields.label).toBe('name')
		expect(fields.value).toBe('id')
		// Default fields preserved
		expect(fields.icon).toBe('icon')
		expect(fields.children).toBe('children')
	})

	describe('_createChild()', () => {
		it('should create ProxyItem children by default', () => {
			const raw = { text: 'p', children: [{ text: 'c' }] }
			const proxy = new ProxyItem(raw, {}, '0', 1)
			expect(proxy.children[0]).toBeInstanceOf(ProxyItem)
		})
	})
})

describe('LazyProxyItem', () => {
	describe('constructor — #loaded logic', () => {
		it('should be loaded when lazyLoad is null', () => {
			const proxy = new LazyProxyItem({ text: 'leaf' }, {}, '0', 1, null)
			expect(proxy.loaded).toBe(true)
		})

		it('should be loaded when node already has children array', () => {
			const proxy = new LazyProxyItem(
				{ text: 'parent', children: [{ text: 'child' }] },
				{}, '0', 1,
				async () => []
			)
			expect(proxy.loaded).toBe(true)
			expect(proxy.hasChildren).toBe(true)
		})

		it('should not be loaded for sentinel node (children: true)', () => {
			const proxy = new LazyProxyItem(
				{ text: 'lazy', children: true },
				{}, '0', 1,
				async () => []
			)
			expect(proxy.loaded).toBe(false)
		})

		it('should be loaded when node has no children field (leaf)', () => {
			const proxy = new LazyProxyItem(
				{ text: 'lazy' },
				{}, '0', 1,
				async () => []
			)
			expect(proxy.loaded).toBe(true)
		})

		it('should extend ProxyItem', () => {
			const proxy = new LazyProxyItem({ text: 'test' }, {}, '0', 1)
			expect(proxy).toBeInstanceOf(ProxyItem)
			expect(proxy).toBeInstanceOf(LazyProxyItem)
		})
	})

	describe('loading state', () => {
		it('should not be loading initially', () => {
			const proxy = new LazyProxyItem({ text: 'x', children: true }, {}, '0', 1, async () => [])
			expect(proxy.loading).toBe(false)
		})

		it('should be loading during fetch', async () => {
			let resolveLoad
			const lazyLoad = vi.fn().mockImplementation(() =>
				new Promise((resolve) => { resolveLoad = resolve })
			)

			const proxy = new LazyProxyItem({ text: 'x', children: true }, {}, '0', 1, lazyLoad)
			const fetchPromise = proxy.fetch()

			expect(proxy.loading).toBe(true)
			expect(proxy.loaded).toBe(false)

			resolveLoad([{ text: 'child' }])
			await fetchPromise

			expect(proxy.loading).toBe(false)
			expect(proxy.loaded).toBe(true)
		})

		it('should reset loading on fetch error', async () => {
			const lazyLoad = vi.fn().mockRejectedValue(new Error('fail'))
			const proxy = new LazyProxyItem({ text: 'x', children: true }, {}, '0', 1, lazyLoad)

			await proxy.fetch().catch(() => {})

			expect(proxy.loading).toBe(false)
			expect(proxy.loaded).toBe(false) // not loaded — fetch failed
		})

		it('should not fetch while already loading', async () => {
			let resolveLoad
			const lazyLoad = vi.fn().mockImplementation(() =>
				new Promise((resolve) => { resolveLoad = resolve })
			)

			const proxy = new LazyProxyItem({ text: 'x', children: true }, {}, '0', 1, lazyLoad)
			const p1 = proxy.fetch()
			proxy.fetch() // second call while loading — no-op

			expect(lazyLoad).toHaveBeenCalledTimes(1)

			resolveLoad([])
			await p1
		})
	})

	describe('fetch()', () => {
		it('should call lazyLoad and update children', async () => {
			const raw = { label: 'parent', value: 'p1', children: true }
			const mockChildren = [
				{ label: 'child1', value: 'c1' },
				{ label: 'child2', value: 'c2' }
			]
			const lazyLoad = vi.fn().mockResolvedValue(mockChildren)

			const proxy = new LazyProxyItem(raw, {}, '0', 1, lazyLoad)
			expect(proxy.loaded).toBe(false)

			await proxy.fetch()

			expect(lazyLoad).toHaveBeenCalledWith('p1', raw)
			expect(proxy.loaded).toBe(true)
			expect(raw.children).toEqual(mockChildren)

			flushSync()
			expect(proxy.hasChildren).toBe(true)
			expect(proxy.children).toHaveLength(2)
			expect(proxy.children[0].label).toBe('child1')
			expect(proxy.children[1].label).toBe('child2')
		})

		it('should not call lazyLoad when already loaded', async () => {
			const lazyLoad = vi.fn().mockResolvedValue([])
			const proxy = new LazyProxyItem({ text: 'x', children: true }, {}, '0', 1, lazyLoad)

			await proxy.fetch()
			expect(lazyLoad).toHaveBeenCalledTimes(1)

			await proxy.fetch()
			expect(lazyLoad).toHaveBeenCalledTimes(1)
		})

		it('should skip fetch for node with existing children', async () => {
			const lazyLoad = vi.fn().mockResolvedValue([])
			const proxy = new LazyProxyItem(
				{ text: 'p', children: [{ text: 'existing' }] },
				{}, '0', 1, lazyLoad
			)

			expect(proxy.loaded).toBe(true)
			await proxy.fetch()
			expect(lazyLoad).not.toHaveBeenCalled()
		})

		it('should not call lazyLoad when lazyLoad is null', async () => {
			const proxy = new LazyProxyItem({ text: 'x' }, {}, '0', 1, null)
			await proxy.fetch()
			expect(proxy.loaded).toBe(true)
		})

		it('should propagate lazyLoad to children via _createChild', async () => {
			const lazyLoad = vi.fn()

			const proxy = new LazyProxyItem({ label: 'root', value: 'r', children: true }, {}, '0', 1, lazyLoad)

			// First fetch: load children for root
			lazyLoad.mockResolvedValueOnce([
				{ label: 'child', value: 'c1', children: true }
			])
			await proxy.fetch()
			flushSync()

			// Children should be LazyProxyItem with lazyLoad inherited
			const child = proxy.children[0]
			expect(child).toBeInstanceOf(LazyProxyItem)
			expect(child.loaded).toBe(false) // sentinel (children: true) → needs fetch

			// Fetch children of the child
			lazyLoad.mockResolvedValueOnce([
				{ label: 'grandchild', value: 'gc1' }
			])
			await child.fetch()
			flushSync()

			expect(child.hasChildren).toBe(true)
			expect(child.children[0].label).toBe('grandchild')
		})

		it('children with existing arrays should be loaded', async () => {
			const lazyLoad = vi.fn().mockResolvedValueOnce([
				{ text: 'child', value: 'c1', children: [{ text: 'gc' }] }
			])

			const proxy = new LazyProxyItem({ text: 'root', children: true }, {}, '0', 1, lazyLoad)
			await proxy.fetch()
			flushSync()

			// Child has children array → already loaded
			const child = proxy.children[0]
			expect(child).toBeInstanceOf(LazyProxyItem)
			expect(child.loaded).toBe(true)
			expect(child.hasChildren).toBe(true)
		})
	})

	describe('original item mutation', () => {
		it('should mutate the original items array through the tree', async () => {
			const items = [
				{ text: 'A', value: 'a', children: true },
				{ text: 'B', value: 'b' }
			]

			const lazyLoad = vi.fn().mockResolvedValue([
				{ text: 'A1', value: 'a1' },
				{ text: 'A2', value: 'a2' }
			])

			const proxy = new LazyProxyItem(items[0], {}, '0', 1, lazyLoad)
			await proxy.fetch()
			flushSync()

			expect(items[0].children).toBeDefined()
			expect(items[0].children).toHaveLength(2)
			expect(items[0].children[0].text).toBe('A1')
			expect(items[0].children[1].text).toBe('A2')
		})
	})
})
