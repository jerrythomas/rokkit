import { describe, it, expect, vi } from 'vitest'
import { LazyWrapper } from '../src/lazy-wrapper.svelte.js'
import { ProxyItem, LazyProxyItem } from '../src/proxy-item.svelte.js'
import { flushSync } from 'svelte'

describe('LazyWrapper', () => {
	describe('basic Wrapper parity', () => {
		it('should build flatView from items', () => {
			const w = new LazyWrapper([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			])
			expect(w.flatView).toHaveLength(3)
			expect(w.flatView[0].proxy.text).toBe('A')
			expect(w.flatView[1].proxy.text).toBe('B')
			expect(w.flatView[2].proxy.text).toBe('C')
		})

		it('should build lookup from items', () => {
			const w = new LazyWrapper([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' }
			])
			expect(w.lookup.size).toBe(2)
			expect(w.lookup.get('0').text).toBe('A')
			expect(w.lookup.get('1').text).toBe('B')
		})

		it('should handle nested items', () => {
			const w = new LazyWrapper([
				{
					text: 'Parent',
					value: 'p',
					children: [
						{ text: 'Child1', value: 'c1' },
						{ text: 'Child2', value: 'c2' }
					]
				}
			])

			// Initially collapsed — only parent visible
			expect(w.flatView).toHaveLength(1)
			expect(w.flatView[0].hasChildren).toBe(true)

			// Lookup should include all nodes (parent + children)
			expect(w.lookup.size).toBe(3)
			expect(w.lookup.get('0').text).toBe('Parent')
			expect(w.lookup.get('0-0').text).toBe('Child1')
			expect(w.lookup.get('0-1').text).toBe('Child2')
		})

		it('should expand/collapse groups', () => {
			const w = new LazyWrapper([
				{
					text: 'Parent',
					value: 'p',
					children: [{ text: 'Child', value: 'c' }]
				}
			])

			expect(w.flatView).toHaveLength(1)

			// Expand
			w.flatView[0].proxy.expanded = true
			flushSync()
			expect(w.flatView).toHaveLength(2)
			expect(w.flatView[1].proxy.text).toBe('Child')

			// Collapse
			w.flatView[0].proxy.expanded = false
			flushSync()
			expect(w.flatView).toHaveLength(1)
		})

		it('should navigate with next/prev/first/last', () => {
			const w = new LazyWrapper([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			])

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
				[{ text: 'A', value: 'a' }, { text: 'B', value: 'b' }],
				{},
				{ onselect, onchange }
			)

			w.select('0')
			expect(onselect).toHaveBeenCalledWith('a', expect.any(ProxyItem))
			expect(onchange).toHaveBeenCalledWith('a', expect.any(ProxyItem))
		})

		it('should select groups by toggling expansion', () => {
			const onselect = vi.fn()
			const w = new LazyWrapper(
				[{
					text: 'Group',
					value: 'g',
					children: [{ text: 'Child', value: 'c' }]
				}],
				{},
				{ onselect }
			)

			w.select('0')
			flushSync()

			// Group select toggles expansion, doesn't fire onselect
			expect(onselect).not.toHaveBeenCalled()
			expect(w.flatView).toHaveLength(2) // expanded
		})

		it('should support moveToValue', () => {
			const w = new LazyWrapper([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' }
			])

			w.moveToValue('b')
			expect(w.focusedKey).toBe('1')
		})

		it('should support typeahead via findByText', () => {
			const w = new LazyWrapper([
				{ text: 'Apple', value: 'a' },
				{ text: 'Banana', value: 'b' },
				{ text: 'Cherry', value: 'c' }
			])

			expect(w.findByText('b')).toBe('1')
			expect(w.findByText('ch')).toBe('2')
			expect(w.findByText('z')).toBeNull()
		})

		it('should handle empty items', () => {
			const w = new LazyWrapper([])
			expect(w.flatView).toHaveLength(0)
			expect(w.lookup.size).toBe(0)
		})

		it('should handle expand/collapse via keyboard actions', () => {
			const w = new LazyWrapper([
				{
					text: 'Parent',
					value: 'p',
					children: [{ text: 'Child', value: 'c' }]
				}
			])

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
			const w = new LazyWrapper([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			])

			// Leaf nodes: just 'empty' (no toggle icon)
			expect(w.flatView[0].lineTypes).toEqual(['empty'])
			expect(w.flatView[1].lineTypes).toEqual(['empty'])
			expect(w.flatView[2].lineTypes).toEqual(['empty'])
		})

		it('should compute lineTypes for expandable root', () => {
			const w = new LazyWrapper([
				{
					text: 'Parent',
					value: 'p',
					children: [{ text: 'Child', value: 'c' }]
				},
				{ text: 'Sibling', value: 's' }
			])

			// Expandable root: 'icon' (toggle slot)
			expect(w.flatView[0].lineTypes).toEqual(['icon'])
			// Leaf sibling: 'empty'
			expect(w.flatView[1].lineTypes).toEqual(['empty'])
		})

		it('should compute lineTypes for expanded children', () => {
			const w = new LazyWrapper([
				{
					text: 'Parent',
					value: 'p',
					children: [
						{ text: 'Child1', value: 'c1' },
						{ text: 'Child2', value: 'c2' }
					]
				},
				{ text: 'Sibling', value: 's' }
			])

			w.lookup.get('0').expanded = true
			flushSync()

			// Parent: expandable, not last → ['icon']
			expect(w.flatView[0].lineTypes).toEqual(['icon'])
			// Child1: leaf, not last child → ['child', 'empty']
			expect(w.flatView[1].lineTypes).toEqual(['child', 'empty'])
			// Child2: leaf, last child → ['last', 'empty']
			expect(w.flatView[2].lineTypes).toEqual(['last', 'empty'])
			// Sibling: leaf, last root → ['empty']
			expect(w.flatView[3].lineTypes).toEqual(['empty'])
		})

		it('should compute lineTypes for deeply nested tree', () => {
			const w = new LazyWrapper([
				{
					text: 'A', value: 'a',
					children: [
						{
							text: 'A1', value: 'a1',
							children: [
								{ text: 'A1a', value: 'a1a' },
								{ text: 'A1b', value: 'a1b' }
							]
						},
						{ text: 'A2', value: 'a2' }
					]
				},
				{ text: 'B', value: 'b' }
			])

			// Expand all
			w.lookup.get('0').expanded = true
			w.lookup.get('0-0').expanded = true
			flushSync()

			// A: expandable, not last root → ['icon']
			expect(w.flatView[0].lineTypes).toEqual(['icon'])
			// A1: expandable, not last child of A → ['child', 'icon']
			expect(w.flatView[1].lineTypes).toEqual(['child', 'icon'])
			// A1a: leaf, not last child of A1 → parent A1 was 'child' → continuation 'sibling', position 'child'
			expect(w.flatView[2].lineTypes).toEqual(['sibling', 'child', 'empty'])
			// A1b: leaf, last child of A1 → continuation 'sibling', position 'last'
			expect(w.flatView[3].lineTypes).toEqual(['sibling', 'last', 'empty'])
			// A2: leaf, last child of A → ['last', 'empty']
			expect(w.flatView[4].lineTypes).toEqual(['last', 'empty'])
			// B: leaf, last root → ['empty']
			expect(w.flatView[5].lineTypes).toEqual(['empty'])
		})

		it('should update lineTypes when children are lazily loaded', () => {
			const w = new LazyWrapper([
				{ text: 'Root', value: 'r' }
			])

			// Initially a leaf
			expect(w.flatView[0].lineTypes).toEqual(['empty'])

			// Add children
			const proxy = w.lookup.get('0')
			proxy.set('children', [{ text: 'C1' }, { text: 'C2' }])
			flushSync()

			// Now expandable
			expect(w.flatView[0].lineTypes).toEqual(['icon'])

			// Expand
			proxy.expanded = true
			flushSync()

			expect(w.flatView[1].lineTypes).toEqual(['child', 'empty'])
			expect(w.flatView[2].lineTypes).toEqual(['last', 'empty'])
		})
	})

	describe('reactive lazy loading', () => {
		it('should update flatView when children are set via proxy.set()', () => {
			const w = new LazyWrapper([
				{ text: 'Root', value: 'r' }
			])

			expect(w.flatView).toHaveLength(1)
			expect(w.flatView[0].hasChildren).toBe(false)

			// Simulate lazy load: set children on the proxy
			const proxy = w.lookup.get('0')
			proxy.set('children', [
				{ text: 'Loaded1', value: 'l1' },
				{ text: 'Loaded2', value: 'l2' }
			])
			flushSync()

			// flatView should still show 1 (collapsed), but hasChildren should be true
			expect(w.flatView).toHaveLength(1)
			expect(w.flatView[0].hasChildren).toBe(true)

			// Expand to see children
			proxy.expanded = true
			flushSync()
			expect(w.flatView).toHaveLength(3)
			expect(w.flatView[1].proxy.text).toBe('Loaded1')
			expect(w.flatView[2].proxy.text).toBe('Loaded2')
		})

		it('should update lookup when children are set via proxy.set()', () => {
			const w = new LazyWrapper([
				{ text: 'Root', value: 'r' }
			])

			expect(w.lookup.size).toBe(1)

			const proxy = w.lookup.get('0')
			proxy.set('children', [{ text: 'New', value: 'n' }])
			flushSync()

			// Lookup should now include the new child
			expect(w.lookup.size).toBe(2)
			expect(w.lookup.get('0-0')).toBeDefined()
			expect(w.lookup.get('0-0').text).toBe('New')
		})

		it('should allow navigation to lazily loaded children', () => {
			const w = new LazyWrapper([
				{ text: 'Root', value: 'r' }
			])

			const proxy = w.lookup.get('0')
			proxy.set('children', [{ text: 'Child', value: 'c' }])
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
				[{ text: 'Root', value: 'r' }],
				{},
				{ onselect }
			)

			const proxy = w.lookup.get('0')
			proxy.set('children', [{ text: 'Child', value: 'c' }])
			proxy.expanded = true
			flushSync()

			w.select('0-0')
			expect(onselect).toHaveBeenCalledWith('c', expect.any(ProxyItem))
		})

		it('should work with LazyProxyItem and fetch()', async () => {
			const lazyLoad = vi.fn().mockResolvedValue([
				{ text: 'Fetched1', value: 'f1' },
				{ text: 'Fetched2', value: 'f2' }
			])

			const w = new LazyWrapper(
				[{ text: 'Root', value: 'r', children: true }],
				{},
				{
					createProxy: (raw, fields, key, level) =>
						new LazyProxyItem(raw, fields, key, level, lazyLoad)
				}
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
			expect(w.flatView[1].proxy.text).toBe('Fetched1')
			expect(w.flatView[2].proxy.text).toBe('Fetched2')

			// Lookup includes fetched children
			expect(w.lookup.size).toBe(3)
			expect(w.lookup.get('0-0').text).toBe('Fetched1')
		})

		it('should handle multi-level lazy loading', async () => {
			let callCount = 0
			const lazyLoad = vi.fn().mockImplementation(async () => {
				callCount++
				if (callCount === 1) {
					return [{ text: 'Level2', value: 'l2', children: true }]
				}
				return [{ text: 'Level3', value: 'l3' }]
			})

			const w = new LazyWrapper(
				[{ text: 'Level1', value: 'l1', children: true }],
				{},
				{
					createProxy: (raw, fields, key, level) =>
						new LazyProxyItem(raw, fields, key, level, lazyLoad)
				}
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
			expect(w.flatView[2].proxy.text).toBe('Level3')
			expect(w.lookup.size).toBe(3)
		})

		it('should update original items when children are loaded', async () => {
			const items = [{ text: 'Root', value: 'r', children: true }]
			const lazyLoad = vi.fn().mockResolvedValue([
				{ text: 'Child', value: 'c' }
			])

			const w = new LazyWrapper(
				items,
				{},
				{
					createProxy: (raw, fields, key, level) =>
						new LazyProxyItem(raw, fields, key, level, lazyLoad)
				}
			)

			const proxy = w.lookup.get('0')
			await proxy.fetch()
			flushSync()

			expect(items[0].children).toBeDefined()
			expect(items[0].children).toHaveLength(1)
			expect(items[0].children[0].text).toBe('Child')
		})
	})

	describe('expand() triggers lazy fetch', () => {
		it('should fetch and expand an unloaded lazy node', async () => {
			const lazyLoad = vi.fn().mockResolvedValue([
				{ text: 'Child', value: 'c' }
			])

			const w = new LazyWrapper(
				[{ text: 'Root', value: 'r', children: true }],
				{},
				{
					createProxy: (raw, fields, key, level) =>
						new LazyProxyItem(raw, fields, key, level, lazyLoad)
				}
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
			expect(w.flatView[1].proxy.text).toBe('Child')
		})

		it('should not re-fetch an already loaded node', async () => {
			const lazyLoad = vi.fn().mockResolvedValue([
				{ text: 'Child', value: 'c' }
			])

			const w = new LazyWrapper(
				[{ text: 'Root', value: 'r', children: true }],
				{},
				{
					createProxy: (raw, fields, key, level) =>
						new LazyProxyItem(raw, fields, key, level, lazyLoad)
				}
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
			const w = new LazyWrapper([
				{ text: 'Leaf', value: 'l' }
			])

			w.first()
			w.expand() // no-op on leaf without lazy load
			expect(w.flatView).toHaveLength(1)
		})

		it('should handle nodes with existing children normally', () => {
			const lazyLoad = vi.fn()

			const w = new LazyWrapper(
				[{
					text: 'Parent',
					value: 'p',
					children: [{ text: 'Child', value: 'c' }]
				}],
				{},
				{
					createProxy: (raw, fields, key, level) =>
						new LazyProxyItem(raw, fields, key, level, lazyLoad)
				}
			)

			w.first()
			w.expand()
			flushSync()

			// Node already has children → loaded=true → normal expand, no fetch
			expect(lazyLoad).not.toHaveBeenCalled()
			expect(w.flatView).toHaveLength(2)
			expect(w.flatView[1].proxy.text).toBe('Child')
		})
	})
})
