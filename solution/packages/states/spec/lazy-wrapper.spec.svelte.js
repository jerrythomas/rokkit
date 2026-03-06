import { describe, it, expect, vi } from 'vitest'
import { LazyWrapper } from '../src/lazy-wrapper.svelte.js'
import { ProxyTree } from '../src/proxy-tree.svelte.js'
import { ProxyItem, LazyProxyItem } from '../src/proxy-item.svelte.js'
import { flushSync } from 'svelte'

describe('LazyWrapper', () => {
	describe('basic Wrapper parity', () => {
		it('should build flatView from items', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'A', value: 'a' },
				{ label: 'B', value: 'b' },
				{ label: 'C', value: 'c' }
			]))
			expect(w.flatView).toHaveLength(3)
			expect(w.flatView[0].proxy.label).toBe('A')
			expect(w.flatView[1].proxy.label).toBe('B')
			expect(w.flatView[2].proxy.label).toBe('C')
		})

		it('should build lookup from items', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'A', value: 'a' },
				{ label: 'B', value: 'b' }
			]))
			expect(w.lookup.size).toBe(2)
			expect(w.lookup.get('0').label).toBe('A')
			expect(w.lookup.get('1').label).toBe('B')
		})

		it('should handle nested items', () => {
			const w = new LazyWrapper(new ProxyTree([
				{
					label: 'Parent',
					value: 'p',
					children: [
						{ label: 'Child1', value: 'c1' },
						{ label: 'Child2', value: 'c2' }
					]
				}
			]))

			// Initially collapsed — only parent visible
			expect(w.flatView).toHaveLength(1)
			expect(w.flatView[0].hasChildren).toBe(true)

			// Lookup should include all nodes (parent + children)
			expect(w.lookup.size).toBe(3)
			expect(w.lookup.get('0').label).toBe('Parent')
			expect(w.lookup.get('0-0').label).toBe('Child1')
			expect(w.lookup.get('0-1').label).toBe('Child2')
		})

		it('should expand/collapse groups', () => {
			const w = new LazyWrapper(new ProxyTree([
				{
					label: 'Parent',
					value: 'p',
					children: [{ label: 'Child', value: 'c' }]
				}
			]))

			expect(w.flatView).toHaveLength(1)

			// Expand
			w.flatView[0].proxy.expanded = true
			flushSync()
			expect(w.flatView).toHaveLength(2)
			expect(w.flatView[1].proxy.label).toBe('Child')

			// Collapse
			w.flatView[0].proxy.expanded = false
			flushSync()
			expect(w.flatView).toHaveLength(1)
		})

		it('should navigate with next/prev/first/last', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'A', value: 'a' },
				{ label: 'B', value: 'b' },
				{ label: 'C', value: 'c' }
			]))

			expect(w.focusedKey).toBeNull()

			w.first()
			expect(w.focusedKey).toBe('0')

			w.next()
			expect(w.focusedKey).toBe('1')

			w.next()
			expect(w.focusedKey).toBe('2')

			w.prev()
			expect(w.focusedKey).toBe('1')

			w.last()
			expect(w.focusedKey).toBe('2')
		})

		it('should select items and fire callbacks', () => {
			const onselect = vi.fn()
			const onchange = vi.fn()
			const w = new LazyWrapper(
				new ProxyTree([{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]),
				{ onselect, onchange }
			)

			w.select('0')
			expect(onselect).toHaveBeenCalledWith('a', expect.any(ProxyItem))
			expect(onchange).toHaveBeenCalledWith('a', expect.any(ProxyItem))
		})

		it('should select groups by toggling expansion', () => {
			const onselect = vi.fn()
			const w = new LazyWrapper(
				new ProxyTree([{
					label: 'Group',
					value: 'g',
					children: [{ label: 'Child', value: 'c' }]
				}]),
				{ onselect }
			)

			w.select('0')
			flushSync()

			// Group select toggles expansion, doesn't fire onselect
			expect(onselect).not.toHaveBeenCalled()
			expect(w.flatView).toHaveLength(2) // expanded
		})

		it('should support moveToValue', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'A', value: 'a' },
				{ label: 'B', value: 'b' }
			]))

			w.moveToValue('b')
			expect(w.focusedKey).toBe('1')
		})

		it('should support typeahead via findByText', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'Apple', value: 'a' },
				{ label: 'Banana', value: 'b' },
				{ label: 'Cherry', value: 'c' }
			]))

			expect(w.findByText('b')).toBe('1')
			expect(w.findByText('ch')).toBe('2')
			expect(w.findByText('z')).toBeNull()
		})

		it('should handle empty items', () => {
			const w = new LazyWrapper(new ProxyTree([]))
			expect(w.flatView).toHaveLength(0)
			expect(w.lookup.size).toBe(0)
		})

		it('should handle expand/collapse via keyboard actions', () => {
			const w = new LazyWrapper(new ProxyTree([
				{
					label: 'Parent',
					value: 'p',
					children: [{ label: 'Child', value: 'c' }]
				}
			]))

			w.first()
			expect(w.focusedKey).toBe('0')

			// Expand via expand()
			w.expand()
			flushSync()
			expect(w.flatView).toHaveLength(2)

			// Expand again moves focus to first child
			w.expand()
			expect(w.focusedKey).toBe('0-0')

			// Collapse on child moves to parent
			w.collapse()
			expect(w.focusedKey).toBe('0')

			// Collapse on expanded parent collapses it
			w.collapse()
			flushSync()
			expect(w.flatView).toHaveLength(1)
		})
	})

	describe('lineTypes computation', () => {
		it('should compute lineTypes for flat list', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'A', value: 'a' },
				{ label: 'B', value: 'b' },
				{ label: 'C', value: 'c' }
			]))

			// Leaf nodes: no lineTypes (no toggle icon, no trailing empty)
			expect(w.flatView[0].lineTypes).toEqual([])
			expect(w.flatView[1].lineTypes).toEqual([])
			expect(w.flatView[2].lineTypes).toEqual([])
		})

		it('should compute lineTypes for expandable root', () => {
			const w = new LazyWrapper(new ProxyTree([
				{
					label: 'Parent',
					value: 'p',
					children: [{ label: 'Child', value: 'c' }]
				},
				{ label: 'Sibling', value: 's' }
			]))

			// Expandable root: 'icon' (toggle slot)
			expect(w.flatView[0].lineTypes).toEqual(['icon'])
			// Leaf sibling: no trailing empty
			expect(w.flatView[1].lineTypes).toEqual([])
		})

		it('should compute lineTypes for expanded children', () => {
			const w = new LazyWrapper(new ProxyTree([
				{
					label: 'Parent',
					value: 'p',
					children: [
						{ label: 'Child1', value: 'c1' },
						{ label: 'Child2', value: 'c2' }
					]
				},
				{ label: 'Sibling', value: 's' }
			]))

			w.lookup.get('0').expanded = true
			flushSync()

			// Parent: expandable, not last → ['icon']
			expect(w.flatView[0].lineTypes).toEqual(['icon'])
			// Child1: leaf, not last child → ['child']
			expect(w.flatView[1].lineTypes).toEqual(['child'])
			// Child2: leaf, last child → ['last']
			expect(w.flatView[2].lineTypes).toEqual(['last'])
			// Sibling: leaf, last root → []
			expect(w.flatView[3].lineTypes).toEqual([])
		})

		it('should compute lineTypes for deeply nested tree', () => {
			const w = new LazyWrapper(new ProxyTree([
				{
					label: 'A', value: 'a',
					children: [
						{
							label: 'A1', value: 'a1',
							children: [
								{ label: 'A1a', value: 'a1a' },
								{ label: 'A1b', value: 'a1b' }
							]
						},
						{ label: 'A2', value: 'a2' }
					]
				},
				{ label: 'B', value: 'b' }
			]))

			// Expand all
			w.lookup.get('0').expanded = true
			w.lookup.get('0-0').expanded = true
			flushSync()

			// A: expandable, not last root → ['icon']
			expect(w.flatView[0].lineTypes).toEqual(['icon'])
			// A1: expandable, not last child of A → ['child', 'icon']
			expect(w.flatView[1].lineTypes).toEqual(['child', 'icon'])
			// A1a: leaf, not last child of A1 → parent A1 was 'child' → continuation 'sibling', position 'child'
			expect(w.flatView[2].lineTypes).toEqual(['sibling', 'child'])
			// A1b: leaf, last child of A1 → continuation 'sibling', position 'last'
			expect(w.flatView[3].lineTypes).toEqual(['sibling', 'last'])
			// A2: leaf, last child of A → ['last']
			expect(w.flatView[4].lineTypes).toEqual(['last'])
			// B: leaf, last root → []
			expect(w.flatView[5].lineTypes).toEqual([])
		})

		it('should update lineTypes when children are lazily loaded', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'Root', value: 'r' }
			]))

			// Initially a leaf
			expect(w.flatView[0].lineTypes).toEqual([])

			// Add children
			const proxy = w.lookup.get('0')
			proxy.set('children', [{ label: 'C1' }, { label: 'C2' }])
			flushSync()

			// Now expandable
			expect(w.flatView[0].lineTypes).toEqual(['icon'])

			// Expand
			proxy.expanded = true
			flushSync()

			expect(w.flatView[1].lineTypes).toEqual(['child'])
			expect(w.flatView[2].lineTypes).toEqual(['last'])
		})
	})

	describe('reactive lazy loading', () => {
		it('should update flatView when children are set via proxy.set()', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'Root', value: 'r' }
			]))

			expect(w.flatView).toHaveLength(1)
			expect(w.flatView[0].hasChildren).toBe(false)

			// Simulate lazy load: set children on the proxy
			const proxy = w.lookup.get('0')
			proxy.set('children', [
				{ label: 'Loaded1', value: 'l1' },
				{ label: 'Loaded2', value: 'l2' }
			])
			flushSync()

			// flatView should still show 1 (collapsed), but hasChildren should be true
			expect(w.flatView).toHaveLength(1)
			expect(w.flatView[0].hasChildren).toBe(true)

			// Expand to see children
			proxy.expanded = true
			flushSync()
			expect(w.flatView).toHaveLength(3)
			expect(w.flatView[1].proxy.label).toBe('Loaded1')
			expect(w.flatView[2].proxy.label).toBe('Loaded2')
		})

		it('should update lookup when children are set via proxy.set()', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'Root', value: 'r' }
			]))

			expect(w.lookup.size).toBe(1)

			const proxy = w.lookup.get('0')
			proxy.set('children', [{ label: 'New', value: 'n' }])
			flushSync()

			// Lookup should now include the new child
			expect(w.lookup.size).toBe(2)
			expect(w.lookup.get('0-0')).toBeDefined()
			expect(w.lookup.get('0-0').label).toBe('New')
		})

		it('should allow navigation to lazily loaded children', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'Root', value: 'r' }
			]))

			const proxy = w.lookup.get('0')
			proxy.set('children', [{ label: 'Child', value: 'c' }])
			proxy.expanded = true
			flushSync()

			w.first()
			expect(w.focusedKey).toBe('0')

			w.next()
			expect(w.focusedKey).toBe('0-0')
		})

		it('should support selection on lazily loaded items', () => {
			const onselect = vi.fn()
			const w = new LazyWrapper(
				new ProxyTree([{ label: 'Root', value: 'r' }]),
				{ onselect }
			)

			const proxy = w.lookup.get('0')
			proxy.set('children', [{ label: 'Child', value: 'c' }])
			proxy.expanded = true
			flushSync()

			w.select('0-0')
			expect(onselect).toHaveBeenCalledWith('c', expect.any(ProxyItem))
		})

		it('should work with LazyProxyItem and fetch()', async () => {
			const lazyLoad = vi.fn().mockResolvedValue([
				{ label: 'Fetched1', value: 'f1' },
				{ label: 'Fetched2', value: 'f2' }
			])

			const w = new LazyWrapper(
				new ProxyTree(
					[{ label: 'Root', value: 'r', children: true }],
					{},
					{
						createProxy: (raw, fields, key, level) =>
							new LazyProxyItem(raw, fields, key, level, lazyLoad)
					}
				)
			)

			const proxy = w.lookup.get('0')
			expect(proxy).toBeInstanceOf(LazyProxyItem)
			expect(proxy.loaded).toBe(false)
			expect(w.flatView[0].hasChildren).toBe(false)

			// Fetch children
			await proxy.fetch()
			flushSync()

			expect(proxy.loaded).toBe(true)
			expect(w.flatView[0].hasChildren).toBe(true)

			// Expand to see fetched children
			proxy.expanded = true
			flushSync()
			expect(w.flatView).toHaveLength(3)
			expect(w.flatView[1].proxy.label).toBe('Fetched1')
			expect(w.flatView[2].proxy.label).toBe('Fetched2')

			// Lookup includes fetched children
			expect(w.lookup.size).toBe(3)
			expect(w.lookup.get('0-0').label).toBe('Fetched1')
		})

		it('should handle multi-level lazy loading', async () => {
			let callCount = 0
			const lazyLoad = vi.fn().mockImplementation(async () => {
				callCount++
				if (callCount === 1) {
					return [{ label: 'Level2', value: 'l2', children: true }]
				}
				return [{ label: 'Level3', value: 'l3' }]
			})

			const w = new LazyWrapper(
				new ProxyTree(
					[{ label: 'Level1', value: 'l1', children: true }],
					{},
					{
						createProxy: (raw, fields, key, level) =>
							new LazyProxyItem(raw, fields, key, level, lazyLoad)
					}
				)
			)

			// Fetch level 1 children
			const root = w.lookup.get('0')
			await root.fetch()
			root.expanded = true
			flushSync()

			expect(w.flatView).toHaveLength(2)

			// Fetch level 2 children
			const child = w.lookup.get('0-0')
			expect(child).toBeInstanceOf(LazyProxyItem)
			expect(child.loaded).toBe(false)

			await child.fetch()
			child.expanded = true
			flushSync()

			expect(w.flatView).toHaveLength(3)
			expect(w.flatView[2].proxy.label).toBe('Level3')
			expect(w.lookup.size).toBe(3)
		})

		it('should update original items when children are loaded', async () => {
			const items = [{ label: 'Root', value: 'r', children: true }]
			const lazyLoad = vi.fn().mockResolvedValue([
				{ label: 'Child', value: 'c' }
			])

			const w = new LazyWrapper(
				new ProxyTree(
					items,
					{},
					{
						createProxy: (raw, fields, key, level) =>
							new LazyProxyItem(raw, fields, key, level, lazyLoad)
					}
				)
			)

			const proxy = w.lookup.get('0')
			await proxy.fetch()
			flushSync()

			expect(items[0].children).toBeDefined()
			expect(items[0].children).toHaveLength(1)
			expect(items[0].children[0].label).toBe('Child')
		})
	})

	describe('onlazyload + loadMore', () => {
		it('should append root items via loadMore()', async () => {
			const onlazyload = vi.fn().mockResolvedValue([
				{ label: 'D', value: 'd' },
				{ label: 'E', value: 'e' }
			])

			const w = new LazyWrapper(
				new ProxyTree([
					{ label: 'A', value: 'a' },
					{ label: 'B', value: 'b' },
					{ label: 'C', value: 'c' }
				]),
				{ onlazyload }
			)

			expect(w.flatView).toHaveLength(3)

			await w.loadMore()
			flushSync()

			expect(onlazyload).toHaveBeenCalledTimes(1)
			expect(w.flatView).toHaveLength(5)
			expect(w.flatView[3].key).toBe('3')
			expect(w.flatView[3].proxy.label).toBe('D')
			expect(w.flatView[4].key).toBe('4')
			expect(w.flatView[4].proxy.label).toBe('E')
		})

		it('should preserve existing proxies after loadMore', async () => {
			const onlazyload = vi.fn().mockResolvedValue([
				{ label: 'New', value: 'n' }
			])

			const w = new LazyWrapper(
				new ProxyTree([{ label: 'Original', value: 'o' }]),
				{ onlazyload }
			)

			const originalProxy = w.flatView[0].proxy

			await w.loadMore()
			flushSync()

			// Original proxy reference should be stable
			expect(w.flatView[0].proxy).toBe(originalProxy)
			expect(w.flatView[0].proxy.label).toBe('Original')
			expect(w.flatView).toHaveLength(2)
		})

		it('should do nothing in loadMore when no onlazyload callback', async () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'A', value: 'a' },
				{ label: 'B', value: 'b' }
			]))

			await w.loadMore()
			flushSync()

			expect(w.flatView).toHaveLength(2)
		})

		it('should handle empty result from onlazyload', async () => {
			const onlazyload = vi.fn().mockResolvedValue([])

			const w = new LazyWrapper(
				new ProxyTree([{ label: 'A', value: 'a' }]),
				{ onlazyload }
			)

			await w.loadMore()
			flushSync()

			expect(onlazyload).toHaveBeenCalledTimes(1)
			expect(w.flatView).toHaveLength(1)
		})

		it('should handle onlazyload returning null/undefined gracefully', async () => {
			const onlazyloadNull = vi.fn().mockResolvedValue(null)
			const w1 = new LazyWrapper(
				new ProxyTree([{ label: 'A', value: 'a' }]),
				{ onlazyload: onlazyloadNull }
			)

			await w1.loadMore()
			flushSync()
			expect(w1.flatView).toHaveLength(1)

			const onlazyloadUndef = vi.fn().mockResolvedValue(undefined)
			const w2 = new LazyWrapper(
				new ProxyTree([{ label: 'B', value: 'b' }]),
				{ onlazyload: onlazyloadUndef }
			)

			await w2.loadMore()
			flushSync()
			expect(w2.flatView).toHaveLength(1)
		})
	})

	describe('expand() triggers lazy fetch', () => {
		it('should fetch and expand an unloaded lazy node', async () => {
			const lazyLoad = vi.fn().mockResolvedValue([
				{ label: 'Child', value: 'c' }
			])

			const w = new LazyWrapper(
				new ProxyTree(
					[{ label: 'Root', value: 'r', children: true }],
					{},
					{
						createProxy: (raw, fields, key, level) =>
							new LazyProxyItem(raw, fields, key, level, lazyLoad)
					}
				)
			)

			w.first()
			expect(w.focusedKey).toBe('0')

			// expand() on an unloaded lazy node → fire-and-forget fetch + expand
			w.expand()

			// Flush the promise chain (fetch resolve → .then sets expanded)
			await new Promise((r) => setTimeout(r, 0))
			flushSync()

			const proxy = w.lookup.get('0')
			expect(lazyLoad).toHaveBeenCalledTimes(1)
			expect(proxy.loaded).toBe(true)
			expect(proxy.expanded).toBe(true)
			expect(w.flatView).toHaveLength(2)
			expect(w.flatView[1].proxy.label).toBe('Child')
		})

		it('should not re-fetch an already loaded node', async () => {
			const lazyLoad = vi.fn().mockResolvedValue([
				{ label: 'Child', value: 'c' }
			])

			const w = new LazyWrapper(
				new ProxyTree(
					[{ label: 'Root', value: 'r', children: true }],
					{},
					{
						createProxy: (raw, fields, key, level) =>
							new LazyProxyItem(raw, fields, key, level, lazyLoad)
					}
				)
			)

			w.first()

			// First expand: triggers fetch
			w.expand()
			await new Promise((r) => setTimeout(r, 0))
			flushSync()

			expect(lazyLoad).toHaveBeenCalledTimes(1)

			// Collapse
			w.collapse()
			flushSync()
			expect(w.flatView).toHaveLength(1)

			// Second expand: node is loaded, has children → normal expand, no re-fetch
			w.expand()
			flushSync()

			expect(lazyLoad).toHaveBeenCalledTimes(1) // still just 1
			expect(w.flatView).toHaveLength(2) // expanded immediately
		})

		it('should handle expand on regular leaf as no-op', () => {
			const w = new LazyWrapper(new ProxyTree([
				{ label: 'Leaf', value: 'l' }
			]))

			w.first()
			w.expand() // no-op on leaf without lazy load
			expect(w.flatView).toHaveLength(1)
		})

		it('should handle nodes with existing children normally', () => {
			const lazyLoad = vi.fn()

			const w = new LazyWrapper(
				new ProxyTree(
					[{
						label: 'Parent',
						value: 'p',
						children: [{ label: 'Child', value: 'c' }]
					}],
					{},
					{
						createProxy: (raw, fields, key, level) =>
							new LazyProxyItem(raw, fields, key, level, lazyLoad)
					}
				)
			)

			w.first()
			w.expand()
			flushSync()

			// Node already has children → loaded=true → normal expand, no fetch
			expect(lazyLoad).not.toHaveBeenCalled()
			expect(w.flatView).toHaveLength(2)
			expect(w.flatView[1].proxy.label).toBe('Child')
		})
	})
})
