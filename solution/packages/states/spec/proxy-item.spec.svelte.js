import { describe, it, expect, vi } from 'vitest'
import { ProxyItem, LazyProxyItem, PROXY_ITEM_FIELDS } from '../src/proxy-item.svelte.js'
import { flushSync } from 'svelte'

describe('ProxyItem', () => {
	describe('set()', () => {
		it('should write to the underlying object item via field mapping', () => {
			const raw = { text: 'hello', value: 1 }
			const proxy = new ProxyItem(raw, {}, '0', 1)

			proxy.set('text', 'world')
			expect(raw.text).toBe('world')
			expect(proxy.text).toBe('world')
		})

		it('should modify the original raw item reference', () => {
			const raw = { name: 'Alice', id: 42 }
			const proxy = new ProxyItem(raw, { text: 'name', value: 'id' }, '0', 1)

			proxy.set('text', 'Bob')
			expect(raw.name).toBe('Bob')
			expect(proxy.text).toBe('Bob')
		})

		it('should use unmapped field name as raw key when not in fields config', () => {
			const raw = { text: 'hello', custom: 'abc' }
			const proxy = new ProxyItem(raw, {}, '0', 1)

			proxy.set('custom', 'xyz')
			expect(raw.custom).toBe('xyz')
		})

		it('should trigger children recomputation when setting children', () => {
			const raw = { text: 'parent', children: [] }
			const proxy = new ProxyItem(raw, {}, '0', 1)

			expect(proxy.hasChildren).toBe(false)
			expect(proxy.children).toEqual([])

			proxy.set('children', [{ text: 'child1' }, { text: 'child2' }])
			flushSync()

			expect(raw.children).toHaveLength(2)
			expect(raw.children[0].text).toBe('child1')
			expect(proxy.hasChildren).toBe(true)
			expect(proxy.children).toHaveLength(2)
			expect(proxy.children[0].text).toBe('child1')
			expect(proxy.children[1].text).toBe('child2')
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
			const raw = { text: 'parent', value: 'p1', children: true }
			const mockChildren = [
				{ text: 'child1', value: 'c1' },
				{ text: 'child2', value: 'c2' }
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
			expect(proxy.children[0].text).toBe('child1')
			expect(proxy.children[1].text).toBe('child2')
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

			const proxy = new LazyProxyItem({ text: 'root', value: 'r', children: true }, {}, '0', 1, lazyLoad)

			// First fetch: load children for root
			lazyLoad.mockResolvedValueOnce([
				{ text: 'child', value: 'c1', children: true }
			])
			await proxy.fetch()
			flushSync()

			// Children should be LazyProxyItem with lazyLoad inherited
			const child = proxy.children[0]
			expect(child).toBeInstanceOf(LazyProxyItem)
			expect(child.loaded).toBe(false) // sentinel (children: true) → needs fetch

			// Fetch children of the child
			lazyLoad.mockResolvedValueOnce([
				{ text: 'grandchild', value: 'gc1' }
			])
			await child.fetch()
			flushSync()

			expect(child.hasChildren).toBe(true)
			expect(child.children[0].text).toBe('grandchild')
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
