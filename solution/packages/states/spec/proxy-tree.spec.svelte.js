import { describe, it, expect, vi } from 'vitest'
import { ProxyTree } from '../src/proxy-tree.svelte.js'
import { ProxyItem } from '../src/proxy-item.svelte.js'
import { flushSync } from 'svelte'

describe('ProxyTree', () => {
	describe('construction', () => {
		it('should create root proxies from items', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			])

			expect(tree.roots).toHaveLength(3)
			expect(tree.roots[0]).toBeInstanceOf(ProxyItem)
			expect(tree.roots[0].key).toBe('0')
			expect(tree.roots[0].level).toBe(1)
			expect(tree.roots[0].label).toBe('A')
			expect(tree.roots[1].key).toBe('1')
			expect(tree.roots[2].key).toBe('2')
		})

		it('should accept custom fields', () => {
			const tree = new ProxyTree(
				[{ name: 'Alice', id: 42 }],
				{ text: 'name', value: 'id' }
			)

			expect(tree.roots[0].label).toBe('Alice')
			expect(tree.roots[0].value).toBe(42)
		})

		it('should accept custom factory via createProxy option', () => {
			class CustomProxy extends ProxyItem {
				get custom() { return `custom-${  this.label}` }
			}

			const tree = new ProxyTree(
				[{ text: 'X', value: 'x' }],
				{},
				{ createProxy: (raw, fields, key, level) => new CustomProxy(raw, fields, key, level) }
			)

			expect(tree.roots[0]).toBeInstanceOf(CustomProxy)
			expect(tree.roots[0].custom).toBe('custom-X')
		})

		it('should handle empty items array', () => {
			const tree = new ProxyTree([])
			expect(tree.roots).toHaveLength(0)
			expect(tree.flatView).toHaveLength(0)
			expect(tree.lookup.size).toBe(0)
		})

		it('should handle null items gracefully', () => {
			const tree = new ProxyTree(null)
			expect(tree.roots).toHaveLength(0)
			expect(tree.flatView).toHaveLength(0)
		})

		it('should handle undefined items gracefully', () => {
			const tree = new ProxyTree(undefined)
			expect(tree.roots).toHaveLength(0)
			expect(tree.flatView).toHaveLength(0)
		})

		it('should merge provided fields with BASE_FIELDS defaults', () => {
			const tree = new ProxyTree(
				[{ label: 'Hello', value: 1 }],
				{ text: 'label' }
			)

			// Custom text field mapping applied
			expect(tree.roots[0].label).toBe('Hello')
			// Default value field still works
			expect(tree.roots[0].value).toBe(1)
		})
	})

	describe('flatView', () => {
		it('should derive flat view from roots', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' }
			])

			expect(tree.flatView).toHaveLength(2)
			expect(tree.flatView[0].key).toBe('0')
			expect(tree.flatView[0].proxy.label).toBe('A')
			expect(tree.flatView[0].level).toBe(1)
			expect(tree.flatView[1].key).toBe('1')
		})

		it('should include nested children when expanded', () => {
			const tree = new ProxyTree([
				{
					text: 'Parent',
					value: 'p',
					children: [
						{ text: 'Child1', value: 'c1' },
						{ text: 'Child2', value: 'c2' }
					]
				}
			])

			// Initially collapsed
			expect(tree.flatView).toHaveLength(1)
			expect(tree.flatView[0].hasChildren).toBe(true)

			// Expand
			tree.roots[0].expanded = true
			flushSync()

			expect(tree.flatView).toHaveLength(3)
			expect(tree.flatView[1].proxy.label).toBe('Child1')
			expect(tree.flatView[1].level).toBe(2)
			expect(tree.flatView[2].proxy.label).toBe('Child2')
		})

		it('should compute lineTypes for flat list items', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			])

			// Leaf nodes: just 'empty' (no toggle icon)
			expect(tree.flatView[0].lineTypes).toEqual(['empty'])
			expect(tree.flatView[1].lineTypes).toEqual(['empty'])
			expect(tree.flatView[2].lineTypes).toEqual(['empty'])
		})

		it('should compute lineTypes for expandable nodes', () => {
			const tree = new ProxyTree([
				{
					text: 'Parent',
					value: 'p',
					children: [{ text: 'Child', value: 'c' }]
				},
				{ text: 'Sibling', value: 's' }
			])

			// Expandable root: 'icon'
			expect(tree.flatView[0].lineTypes).toEqual(['icon'])
			// Leaf sibling: 'empty'
			expect(tree.flatView[1].lineTypes).toEqual(['empty'])
		})

		it('should compute lineTypes for expanded children', () => {
			const tree = new ProxyTree([
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

			tree.roots[0].expanded = true
			flushSync()

			expect(tree.flatView[0].lineTypes).toEqual(['icon'])
			expect(tree.flatView[1].lineTypes).toEqual(['child', 'empty'])
			expect(tree.flatView[2].lineTypes).toEqual(['last', 'empty'])
			expect(tree.flatView[3].lineTypes).toEqual(['empty'])
		})

		it('should detect lazy markers (children: true) as isExpandable', () => {
			const tree = new ProxyTree([
				{ text: 'Lazy', value: 'l', children: true },
				{ text: 'Leaf', value: 'f' }
			])

			expect(tree.flatView[0].isExpandable).toBe(true)
			expect(tree.flatView[0].hasChildren).toBe(false) // no actual children yet
			expect(tree.flatView[0].lineTypes).toEqual(['icon']) // icon for expandable
			expect(tree.flatView[1].isExpandable).toBe(false)
		})

		it('should include type from proxy', () => {
			const tree = new ProxyTree([
				{
					text: 'Group',
					value: 'g',
					children: [{ text: 'Item', value: 'i' }]
				},
				{ text: 'Leaf', value: 'l' }
			])

			expect(tree.flatView[0].type).toBe('group')
			expect(tree.flatView[1].type).toBe('item')
		})
	})

	describe('lookup', () => {
		it('should map all root proxies by key', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' }
			])

			expect(tree.lookup.size).toBe(2)
			expect(tree.lookup.get('0').label).toBe('A')
			expect(tree.lookup.get('1').label).toBe('B')
		})

		it('should include nested proxies by key', () => {
			const tree = new ProxyTree([
				{
					text: 'Parent',
					value: 'p',
					children: [
						{ text: 'Child1', value: 'c1' },
						{
							text: 'Child2',
							value: 'c2',
							children: [{ text: 'Grandchild', value: 'gc' }]
						}
					]
				}
			])

			expect(tree.lookup.size).toBe(4)
			expect(tree.lookup.get('0').label).toBe('Parent')
			expect(tree.lookup.get('0-0').label).toBe('Child1')
			expect(tree.lookup.get('0-1').label).toBe('Child2')
			expect(tree.lookup.get('0-1-0').label).toBe('Grandchild')
		})

		it('should include all nodes even when collapsed', () => {
			const tree = new ProxyTree([
				{
					text: 'Parent',
					value: 'p',
					children: [{ text: 'Child', value: 'c' }]
				}
			])

			// Parent is collapsed, but lookup should still include children
			expect(tree.roots[0].expanded).toBe(false)
			expect(tree.lookup.size).toBe(2)
			expect(tree.lookup.get('0-0').label).toBe('Child')
		})
	})

	describe('append()', () => {
		it('should add root items with correct keys', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' }
			])

			expect(tree.roots).toHaveLength(1)

			tree.append([
				{ text: 'B', value: 'b' },
				{ text: 'C', value: 'c' }
			])
			flushSync()

			expect(tree.roots).toHaveLength(3)
			expect(tree.roots[1].key).toBe('1')
			expect(tree.roots[1].label).toBe('B')
			expect(tree.roots[2].key).toBe('2')
			expect(tree.roots[2].label).toBe('C')
		})

		it('should preserve existing proxies', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' }
			])

			const originalRoot = tree.roots[0]

			tree.append([{ text: 'B', value: 'b' }])
			flushSync()

			// Same ProxyItem instance retained
			expect(tree.roots[0]).toBe(originalRoot)
		})

		it('should update flatView after append', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' }
			])

			expect(tree.flatView).toHaveLength(1)

			tree.append([{ text: 'B', value: 'b' }])
			flushSync()

			expect(tree.flatView).toHaveLength(2)
			expect(tree.flatView[1].proxy.label).toBe('B')
		})

		it('should update lookup after append', () => {
			const tree = new ProxyTree([
				{ text: 'A', value: 'a' }
			])

			expect(tree.lookup.size).toBe(1)

			tree.append([{ text: 'B', value: 'b' }])
			flushSync()

			expect(tree.lookup.size).toBe(2)
			expect(tree.lookup.get('1').label).toBe('B')
		})

		it('should use custom factory for appended items', () => {
			class CustomProxy extends ProxyItem {
				get custom() { return `custom-${  this.label}` }
			}

			const tree = new ProxyTree(
				[{ text: 'A', value: 'a' }],
				{},
				{ createProxy: (raw, fields, key, level) => new CustomProxy(raw, fields, key, level) }
			)

			tree.append([{ text: 'B', value: 'b' }])
			flushSync()

			expect(tree.roots[1]).toBeInstanceOf(CustomProxy)
			expect(tree.roots[1].custom).toBe('custom-B')
		})

		it('should handle appending to an empty tree', () => {
			const tree = new ProxyTree([])

			tree.append([{ text: 'X', value: 'x' }])
			flushSync()

			expect(tree.roots).toHaveLength(1)
			expect(tree.roots[0].key).toBe('0')
			expect(tree.flatView).toHaveLength(1)
		})

		it('should handle append with nested children', () => {
			const tree = new ProxyTree([])

			tree.append([
				{
					text: 'Parent',
					value: 'p',
					children: [{ text: 'Child', value: 'c' }]
				}
			])
			flushSync()

			expect(tree.roots).toHaveLength(1)
			expect(tree.flatView[0].hasChildren).toBe(true)
			expect(tree.lookup.size).toBe(2) // parent + child
		})
	})

	describe('addChildren()', () => {
		it('should add children to a proxy node', () => {
			const tree = new ProxyTree([
				{ text: 'Root', value: 'r' }
			])

			const root = tree.roots[0]
			expect(root.hasChildren).toBe(false)

			tree.addChildren(root, [
				{ text: 'Child1', value: 'c1' },
				{ text: 'Child2', value: 'c2' }
			])
			flushSync()

			expect(root.hasChildren).toBe(true)
			expect(root.children).toHaveLength(2)
			expect(root.children[0].label).toBe('Child1')
			expect(root.children[0].key).toBe('0-0')
			expect(root.children[0].level).toBe(2)
			expect(root.children[1].label).toBe('Child2')
			expect(root.children[1].key).toBe('0-1')
		})

		it('should update flatView after expand', () => {
			const tree = new ProxyTree([
				{ text: 'Root', value: 'r' }
			])

			const root = tree.roots[0]
			tree.addChildren(root, [{ text: 'Child', value: 'c' }])
			flushSync()

			// Still collapsed — only root visible
			expect(tree.flatView).toHaveLength(1)
			expect(tree.flatView[0].hasChildren).toBe(true)

			// Expand
			root.expanded = true
			flushSync()

			expect(tree.flatView).toHaveLength(2)
			expect(tree.flatView[1].proxy.label).toBe('Child')
		})

		it('should update lookup after adding children', () => {
			const tree = new ProxyTree([
				{ text: 'Root', value: 'r' }
			])

			expect(tree.lookup.size).toBe(1)

			tree.addChildren(tree.roots[0], [{ text: 'New', value: 'n' }])
			flushSync()

			expect(tree.lookup.size).toBe(2)
			expect(tree.lookup.get('0-0')).toBeDefined()
			expect(tree.lookup.get('0-0').label).toBe('New')
		})

		it('should update the original raw item', () => {
			const rawItem = { text: 'Root', value: 'r' }
			const tree = new ProxyTree([rawItem])

			tree.addChildren(tree.roots[0], [
				{ text: 'A', value: 'a' },
				{ text: 'B', value: 'b' }
			])
			flushSync()

			// The raw item should be mutated with children
			expect(rawItem.children).toBeDefined()
			expect(rawItem.children).toHaveLength(2)
			expect(rawItem.children[0].text).toBe('A')
			expect(rawItem.children[1].text).toBe('B')
		})

		it('should work with custom children field mapping', () => {
			const rawItem = { text: 'Root', value: 'r' }
			const tree = new ProxyTree(
				[rawItem],
				{ children: 'items' }
			)

			tree.addChildren(tree.roots[0], [{ text: 'Sub', value: 's' }])
			flushSync()

			expect(rawItem.items).toBeDefined()
			expect(rawItem.items).toHaveLength(1)
			expect(rawItem.items[0].text).toBe('Sub')
			expect(tree.roots[0].hasChildren).toBe(true)
		})

		it('should replace sentinel marker (children: true) with actual children', () => {
			const tree = new ProxyTree([
				{ text: 'Lazy', value: 'l', children: true }
			])

			expect(tree.flatView[0].isExpandable).toBe(true)
			expect(tree.flatView[0].hasChildren).toBe(false)

			tree.addChildren(tree.roots[0], [{ text: 'Loaded', value: 'x' }])
			flushSync()

			expect(tree.flatView[0].hasChildren).toBe(true)
			expect(tree.flatView[0].isExpandable).toBe(true)
		})
	})
})
