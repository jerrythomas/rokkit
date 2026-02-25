import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import Tree from '../src/components/Tree.svelte'

const flatItems = [
	{ text: 'File 1', value: 'file1' },
	{ text: 'File 2', value: 'file2' },
	{ text: 'File 3', value: 'file3' }
]

const nestedItems = [
	{
		text: 'src',
		value: 'src',
		children: [
			{ text: 'index.ts', value: 'index' },
			{ text: 'utils.ts', value: 'utils' }
		]
	},
	{
		text: 'tests',
		value: 'tests',
		children: [{ text: 'index.spec.ts', value: 'spec' }]
	},
	{ text: 'README.md', value: 'readme' }
]

const deeplyNested = [
	{
		text: 'root',
		value: 'root',
		children: [
			{
				text: 'level1',
				value: 'l1',
				children: [
					{
						text: 'level2',
						value: 'l2',
						children: [{ text: 'leaf', value: 'leaf' }]
					}
				]
			}
		]
	}
]

describe('Tree', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a tree container', () => {
		const { container } = render(Tree, { items: flatItems })
		expect(container.querySelector('[data-tree]')).toBeTruthy()
	})

	it('has role="tree"', () => {
		const { container } = render(Tree, { items: flatItems })
		expect(container.querySelector('[data-tree]')?.getAttribute('role')).toBe('tree')
	})

	it('renders flat items as tree nodes', () => {
		const { container } = render(Tree, { items: flatItems })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes.length).toBe(3)
	})

	it('nodes have role="treeitem"', () => {
		const { container } = render(Tree, { items: flatItems })
		const nodes = container.querySelectorAll('[role="treeitem"]')
		expect(nodes.length).toBe(3)
	})

	it('nodes have aria-level', () => {
		const { container } = render(Tree, { items: flatItems })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-level')).toBe('1')
	})

	// ─── Nested Structure ───────────────────────────────────────────

	it('renders nested items when expanded', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true })
		const nodes = container.querySelectorAll('[data-tree-node]')
		// src + index.ts + utils.ts + tests + index.spec.ts + README.md = 6
		expect(nodes.length).toBe(6)
	})

	it('hides children when collapsed', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: false })
		const nodes = container.querySelectorAll('[data-tree-node]')
		// Only top-level: src + tests + README.md = 3
		expect(nodes.length).toBe(3)
	})

	it('sets data-tree-level on nested nodes', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true })
		const nodes = container.querySelectorAll('[data-tree-node]')
		// First node (src) = level 0
		expect(nodes[0]?.getAttribute('data-tree-level')).toBe('0')
		// First child (index.ts) = level 1
		expect(nodes[1]?.getAttribute('data-tree-level')).toBe('1')
	})

	it('sets data-tree-path on nodes', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('data-tree-path')).toBe('0')
		expect(nodes[1]?.getAttribute('data-tree-path')).toBe('0-0')
		expect(nodes[2]?.getAttribute('data-tree-path')).toBe('0-1')
	})

	it('marks parent nodes with data-tree-has-children', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true })
		// Both the node div and the toggle span have data-tree-has-children
		const parentNodes = container.querySelectorAll('[data-tree-node][data-tree-has-children]')
		expect(parentNodes.length).toBe(2) // src and tests
	})

	it('sets aria-level correctly for deeply nested items', () => {
		const { container } = render(Tree, { items: deeplyNested, expandAll: true })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-level')).toBe('1') // root
		expect(nodes[1]?.getAttribute('aria-level')).toBe('2') // level1
		expect(nodes[2]?.getAttribute('aria-level')).toBe('3') // level2
		expect(nodes[3]?.getAttribute('aria-level')).toBe('4') // leaf
	})

	// ─── Expand/Collapse ────────────────────────────────────────────

	it('toggles expansion on toggle button click', async () => {
		const { container } = render(Tree, { items: nestedItems })
		// Initially collapsed (expandAll defaults to false)
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(3)

		// Click the toggle button on first node (src)
		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		// Should now show src's children
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes.length).toBe(5) // src + 2 children + tests + README.md
	})

	it('sets aria-expanded on parent nodes', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true })
		const parentNode = container.querySelector('[data-tree-has-children]')
		expect(parentNode?.getAttribute('aria-expanded')).toBe('true')
	})

	it('marks collapsed nodes', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: false })
		const parentNode = container.querySelector('[data-tree-has-children]')
		expect(parentNode?.getAttribute('aria-expanded')).toBe('false')
	})

	it('calls ontoggle when toggling', async () => {
		const ontoggle = vi.fn()
		const { container } = render(Tree, { items: nestedItems, ontoggle })
		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)
		expect(ontoggle).toHaveBeenCalledWith('src', nestedItems[0], true)
	})

	it('calls onexpandedchange with external expanded state', async () => {
		const onexpandedchange = vi.fn()
		const { container } = render(Tree, {
			items: nestedItems,
			expanded: { src: false },
			onexpandedchange
		})
		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)
		expect(onexpandedchange).toHaveBeenCalled()
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onselect when clicking an item', async () => {
		const onselect = vi.fn()
		const { container } = render(Tree, { items: flatItems, onselect })
		const itemContent = container.querySelectorAll('[data-tree-item-content]')
		await fireEvent.click(itemContent[1])
		expect(onselect).toHaveBeenCalledWith('file2', flatItems[1])
	})

	it('marks active item with data-active', () => {
		const { container } = render(Tree, { items: flatItems, active: 'file2' })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.hasAttribute('data-active')).toBe(false)
		expect(nodes[1]?.hasAttribute('data-active')).toBe(true)
	})

	it('sets aria-selected on active node', () => {
		const { container } = render(Tree, { items: flatItems, active: 'file1' })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-selected')).toBe('true')
		expect(nodes[1]?.getAttribute('aria-selected')).toBe('false')
	})

	// ─── Connectors ─────────────────────────────────────────────────

	it('shows connectors when showLines is true', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true, showLines: true })
		const connectors = container.querySelectorAll('[data-connector]')
		expect(connectors.length).toBeGreaterThan(0)
	})

	it('hides connectors when showLines is false', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true, showLines: false })
		const connectors = container.querySelectorAll('[data-connector]')
		expect(connectors.length).toBe(0)
	})

	it('uses indent when showLines is false', () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true, showLines: false })
		const indents = container.querySelectorAll('[data-tree-indent]')
		expect(indents.length).toBeGreaterThan(0)
	})

	// ─── Toggle Icons ───────────────────────────────────────────────

	it('renders toggle icons for parent nodes', () => {
		const { container } = render(Tree, { items: nestedItems })
		const toggles = container.querySelectorAll('[data-tree-toggle]')
		expect(toggles.length).toBeGreaterThan(0)
	})

	it('renders toggle buttons when showLines is false', () => {
		const { container } = render(Tree, { items: nestedItems, showLines: false })
		// Each node has a toggle button when showLines is false
		const toggleBtns = container.querySelectorAll('[data-tree-toggle-btn]')
		expect(toggleBtns.length).toBe(3)
	})

	// ─── Keyboard Navigation ────────────────────────────────────────

	it('navigates down with ArrowDown', async () => {
		const { container } = render(Tree, { items: flatItems })
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: 'ArrowDown' })
		const focused = document.activeElement
		const node = focused?.closest('[data-tree-node]')
		expect(node?.getAttribute('data-tree-path')).toBe('1')
	})

	it('navigates up with ArrowUp', async () => {
		const { container } = render(Tree, { items: flatItems })
		const items = container.querySelectorAll('[data-tree-item-content]')
		const secondItem = items[1] as HTMLElement
		secondItem.focus()
		await fireEvent.keyDown(secondItem, { key: 'ArrowUp' })
		const focused = document.activeElement
		const node = focused?.closest('[data-tree-node]')
		expect(node?.getAttribute('data-tree-path')).toBe('0')
	})

	it('navigates to first with Home', async () => {
		const { container } = render(Tree, { items: flatItems })
		const items = container.querySelectorAll('[data-tree-item-content]')
		const lastItem = items[2] as HTMLElement
		lastItem.focus()
		await fireEvent.keyDown(lastItem, { key: 'Home' })
		const focused = document.activeElement
		const node = focused?.closest('[data-tree-node]')
		expect(node?.getAttribute('data-tree-path')).toBe('0')
	})

	it('navigates to last with End', async () => {
		const { container } = render(Tree, { items: flatItems })
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: 'End' })
		const focused = document.activeElement
		const node = focused?.closest('[data-tree-node]')
		expect(node?.getAttribute('data-tree-path')).toBe('2')
	})

	it('expands node with ArrowRight', async () => {
		const { container } = render(Tree, { items: nestedItems })
		// Focus first node (src - collapsed)
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: 'ArrowRight' })
		// Node should now be expanded
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes.length).toBe(5) // src expanded with 2 children
	})

	it('collapses node with ArrowLeft', async () => {
		const { container } = render(Tree, { items: nestedItems, expandAll: true })
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: 'ArrowLeft' })
		// src should collapse
		const nodes = container.querySelectorAll('[data-tree-node]')
		// src collapsed + tests (still expanded) + spec + README = 4
		expect(nodes.length).toBe(4)
	})

	it('selects item with Enter', async () => {
		const onselect = vi.fn()
		const { container } = render(Tree, { items: flatItems, onselect })
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: 'Enter' })
		expect(onselect).toHaveBeenCalledWith('file1', flatItems[0])
	})

	it('selects item with Space', async () => {
		const onselect = vi.fn()
		const { container } = render(Tree, { items: flatItems, onselect })
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: ' ' })
		expect(onselect).toHaveBeenCalledWith('file1', flatItems[0])
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const items = [
			{ name: 'File A', id: 'a' },
			{ name: 'File B', id: 'b' }
		]
		const onselect = vi.fn()
		const { container } = render(Tree, {
			items,
			fields: { text: 'name', value: 'id' },
			onselect
		})
		const itemContent = container.querySelectorAll('[data-tree-item-content]')
		await fireEvent.click(itemContent[0])
		expect(onselect).toHaveBeenCalledWith('a', items[0])
	})

	// ─── Size ───────────────────────────────────────────────────────

	it('defaults to md size', () => {
		const { container } = render(Tree, { items: flatItems })
		expect(container.querySelector('[data-tree]')?.getAttribute('data-size')).toBe('md')
	})

	it('supports sm size', () => {
		const { container } = render(Tree, { items: flatItems, size: 'sm' })
		expect(container.querySelector('[data-tree]')?.getAttribute('data-size')).toBe('sm')
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty tree', () => {
		const { container } = render(Tree, { items: [] })
		const tree = container.querySelector('[data-tree]')
		expect(tree).toBeTruthy()
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(0)
	})

	// ─── Link Items ─────────────────────────────────────────────────

	it('renders items with href as links', () => {
		const items = [{ text: 'Home', value: 'home', href: '/home' }]
		const { container } = render(Tree, { items })
		const link = container.querySelector('a[data-tree-item-content]')
		expect(link).toBeTruthy()
		expect(link?.getAttribute('href')).toBe('/home')
	})

	// ─── Multi-Selection ────────────────────────────────────────────

	it('applies data-multiselect on container when multiselect is true', () => {
		const { container } = render(Tree, { items: flatItems, multiselect: true })
		const tree = container.querySelector('[data-tree]')
		expect(tree?.hasAttribute('data-multiselect')).toBe(true)
	})

	it('does not apply data-multiselect when multiselect is false', () => {
		const { container } = render(Tree, { items: flatItems })
		const tree = container.querySelector('[data-tree]')
		expect(tree?.hasAttribute('data-multiselect')).toBe(false)
	})

	it('sets aria-multiselectable when multiselect is true', () => {
		const { container } = render(Tree, { items: flatItems, multiselect: true })
		const tree = container.querySelector('[data-tree]')
		expect(tree?.getAttribute('aria-multiselectable')).toBe('true')
	})

	it('uses aria-selected for active state in single-select mode', () => {
		const { container } = render(Tree, { items: flatItems, active: 'file1' })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-selected')).toBe('true')
		expect(nodes[1]?.getAttribute('aria-selected')).toBe('false')
	})

	it('renders aria-selected=false on all items in multiselect mode with no selection', () => {
		const { container } = render(Tree, { items: flatItems, multiselect: true })
		const nodes = container.querySelectorAll('[data-tree-node]')
		nodes.forEach((node) => {
			expect(node.getAttribute('aria-selected')).toBe('false')
		})
	})

	// ─── Lazy Loading ───────────────────────────────────────────────

	it('renders expand toggle for nodes with children: true', () => {
		const items = [
			{ text: 'Folder', value: 'folder', children: true },
			{ text: 'File', value: 'file' }
		]
		const { container } = render(Tree, { items })
		const nodes = container.querySelectorAll('[data-tree-node]')
		// Folder should have expand toggle (data-tree-has-children)
		expect(nodes[0]?.hasAttribute('data-tree-has-children')).toBe(true)
		expect(nodes[0]?.getAttribute('aria-expanded')).toBe('false')
		// File should not
		expect(nodes[1]?.hasAttribute('data-tree-has-children')).toBe(false)
	})

	it('calls onloadchildren when expanding a lazy node', async () => {
		const onloadchildren = vi.fn().mockResolvedValue([
			{ text: 'Child 1', value: 'c1' },
			{ text: 'Child 2', value: 'c2' }
		])
		const items = [
			{ text: 'Folder', value: 'folder', children: true },
			{ text: 'File', value: 'file' }
		]
		const { container } = render(Tree, { items, onloadchildren })
		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		// Wait for async load to complete
		await waitFor(() => {
			expect(onloadchildren).toHaveBeenCalled()
			// Check the value argument (first arg) — item ref is mutated after load
			expect(onloadchildren.mock.calls[0][0]).toBe('folder')
		})
	})

	it('shows children after onloadchildren resolves', async () => {
		const onloadchildren = vi.fn().mockResolvedValue([
			{ text: 'Child 1', value: 'c1' },
			{ text: 'Child 2', value: 'c2' }
		])
		const items = [
			{ text: 'Folder', value: 'folder', children: true },
			{ text: 'File', value: 'file' }
		]
		const { container } = render(Tree, { items, onloadchildren })
		// Initially 2 nodes
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(2)

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		// Wait for children to appear
		await waitFor(() => {
			const nodes = container.querySelectorAll('[data-tree-node]')
			expect(nodes.length).toBe(4) // Folder + 2 children + File
		})
	})

	it('does not re-call onloadchildren after children are loaded', async () => {
		const onloadchildren = vi.fn().mockResolvedValue([
			{ text: 'Child', value: 'c1' }
		])
		const items = [{ text: 'Folder', value: 'folder', children: true }]
		const { container } = render(Tree, { items, onloadchildren })

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		// First click: expand (triggers load)
		await fireEvent.click(toggleBtn)
		await waitFor(() => {
			expect(container.querySelectorAll('[data-tree-node]').length).toBe(2)
		})

		// Second click: collapse
		await fireEvent.click(toggleBtn)
		await waitFor(() => {
			expect(container.querySelectorAll('[data-tree-node]').length).toBe(1)
		})

		// Third click: expand again (should NOT call onloadchildren again)
		await fireEvent.click(toggleBtn)
		await waitFor(() => {
			expect(container.querySelectorAll('[data-tree-node]').length).toBe(2)
		})

		expect(onloadchildren).toHaveBeenCalledTimes(1)
	})

	it('stays collapsed on onloadchildren rejection', async () => {
		const onloadchildren = vi.fn().mockRejectedValue(new Error('Network error'))
		const items = [{ text: 'Folder', value: 'folder', children: true }]
		const { container } = render(Tree, { items, onloadchildren })

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		// Wait for the rejection to be handled
		await waitFor(() => {
			expect(onloadchildren).toHaveBeenCalled()
		})

		// Should still have only 1 node (not expanded)
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes.length).toBe(1)
		expect(nodes[0]?.getAttribute('aria-expanded')).toBe('false')
	})

	it('supports lazy loading in nested trees', async () => {
		const onloadchildren = vi.fn().mockResolvedValue([
			{ text: 'Nested Child', value: 'nc1' }
		])
		const items = [
			{
				text: 'Root',
				value: 'root',
				children: [
					{ text: 'Lazy Folder', value: 'lazy', children: true }
				]
			}
		]
		const { container } = render(Tree, { items, expandAll: true, onloadchildren })
		// Root expanded: Root + Lazy Folder = 2 nodes
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(2)

		// Find the lazy folder's toggle button via its node path
		const lazyNode = container.querySelector('[data-tree-path="0-0"]')!
		const lazyToggle = lazyNode.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(lazyToggle)

		await waitFor(() => {
			// Root + Lazy Folder + Nested Child = 3
			expect(container.querySelectorAll('[data-tree-node]').length).toBe(3)
		})

		expect(onloadchildren).toHaveBeenCalled()
		expect(onloadchildren.mock.calls[0][0]).toBe('lazy')
	})
})
