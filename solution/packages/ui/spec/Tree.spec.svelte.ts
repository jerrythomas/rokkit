import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
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

	it('renders a tree container with role="tree"', () => {
		const { container } = render(Tree, { items: flatItems })
		const tree = container.querySelector('[data-tree]')
		expect(tree).toBeTruthy()
		expect(tree?.getAttribute('role')).toBe('tree')
	})

	it('renders flat items as tree nodes with role="treeitem"', () => {
		const { container } = render(Tree, { items: flatItems })
		const nodes = container.querySelectorAll('[role="treeitem"]')
		expect(nodes.length).toBe(3)
	})

	it('sets aria-level on nodes', () => {
		const { container } = render(Tree, { items: flatItems })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-level')).toBe('1')
	})

	it('sets data-tree-path on nodes', () => {
		const { container } = render(Tree, { items: nestedItems })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('data-tree-path')).toBe('0')
		expect(nodes[1]?.getAttribute('data-tree-path')).toBe('1')
	})

	it('defaults to md size', () => {
		const { container } = render(Tree, { items: flatItems })
		expect(container.querySelector('[data-tree]')?.getAttribute('data-size')).toBe('md')
	})

	it('supports sm size', () => {
		const { container } = render(Tree, { items: flatItems, size: 'sm' })
		expect(container.querySelector('[data-tree]')?.getAttribute('data-size')).toBe('sm')
	})

	it('renders empty tree', () => {
		const { container } = render(Tree, { items: [] })
		expect(container.querySelector('[data-tree]')).toBeTruthy()
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(0)
	})

	// ─── Nested Structure ───────────────────────────────────────────

	it('hides children when collapsed (default)', () => {
		const { container } = render(Tree, { items: nestedItems })
		const nodes = container.querySelectorAll('[data-tree-node]')
		// Only top-level: src + tests + README.md = 3
		expect(nodes.length).toBe(3)
	})

	it('marks parent nodes with data-tree-has-children', () => {
		const { container } = render(Tree, { items: nestedItems })
		const parents = container.querySelectorAll('[data-tree-node][data-tree-has-children]')
		expect(parents.length).toBe(2) // src and tests
	})

	it('sets aria-expanded=false on collapsed parents', () => {
		const { container } = render(Tree, { items: nestedItems })
		const parent = container.querySelector('[data-tree-has-children]')
		expect(parent?.getAttribute('aria-expanded')).toBe('false')
	})

	it('sets aria-level correctly for deeply nested items', () => {
		// Expand all groups via data first
		const items = JSON.parse(JSON.stringify(deeplyNested))
		items[0].expanded = true
		items[0].children[0].expanded = true
		items[0].children[0].children[0].expanded = true

		const { container } = render(Tree, { items })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-level')).toBe('1')
		expect(nodes[1]?.getAttribute('aria-level')).toBe('2')
		expect(nodes[2]?.getAttribute('aria-level')).toBe('3')
		expect(nodes[3]?.getAttribute('aria-level')).toBe('4')
	})

	// ─── Expand/Collapse ────────────────────────────────────────────

	it('toggles expansion on toggle button click', async () => {
		const { container } = render(Tree, { items: nestedItems })
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(3)

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes.length).toBe(5) // src + 2 children + tests + README.md
	})

	it('expands node with ArrowRight', async () => {
		const { container } = render(Tree, { items: nestedItems })
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: 'ArrowRight' })

		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes.length).toBe(5)
	})

	it('collapses node with ArrowLeft', async () => {
		// Pre-expand src
		const items = JSON.parse(JSON.stringify(nestedItems))
		items[0].expanded = true
		items[1].expanded = true

		const { container } = render(Tree, { items })
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(6)

		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: 'ArrowLeft' })

		// src collapsed, tests still expanded
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes.length).toBe(4)
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onselect when clicking a leaf item', async () => {
		const onselect = vi.fn()
		const { container } = render(Tree, { items: flatItems, onselect })
		const items_el = container.querySelectorAll('[data-tree-item-content]')
		await fireEvent.click(items_el[1])
		expect(onselect).toHaveBeenCalledWith('file2', expect.anything())
	})

	it('selects item with Enter', async () => {
		const onselect = vi.fn()
		const { container } = render(Tree, { items: flatItems, onselect })
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: 'Enter' })
		expect(onselect).toHaveBeenCalledWith('file1', expect.anything())
	})

	it('selects item with Space', async () => {
		const onselect = vi.fn()
		const { container } = render(Tree, { items: flatItems, onselect })
		const firstItem = container.querySelector('[data-tree-item-content]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(firstItem, { key: ' ' })
		expect(onselect).toHaveBeenCalledWith('file1', expect.anything())
	})

	it('marks active item with data-active', () => {
		const { container } = render(Tree, { items: flatItems, value: 'file2' })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.hasAttribute('data-active')).toBe(false)
		expect(nodes[1]?.hasAttribute('data-active')).toBe(true)
	})

	it('sets aria-selected on active node', () => {
		const { container } = render(Tree, { items: flatItems, value: 'file1' })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-selected')).toBe('true')
		expect(nodes[1]?.getAttribute('aria-selected')).toBe('false')
	})

	// ─── Connectors ─────────────────────────────────────────────────

	it('shows connectors by default (lineStyle=solid)', () => {
		const items = JSON.parse(JSON.stringify(nestedItems))
		items[0].expanded = true
		const { container } = render(Tree, { items })
		const connectors = container.querySelectorAll('[data-connector]')
		expect(connectors.length).toBeGreaterThan(0)
		expect(container.querySelector('[data-tree]')?.getAttribute('data-line-style')).toBe('solid')
	})

	it('shows connectors with explicit lineStyle=solid', () => {
		const items = JSON.parse(JSON.stringify(nestedItems))
		items[0].expanded = true
		const { container } = render(Tree, { items, lineStyle: 'solid' })
		const connectors = container.querySelectorAll('[data-connector]')
		expect(connectors.length).toBeGreaterThan(0)
	})

	it('sets data-line-style for dashed variant', () => {
		const { container } = render(Tree, { items: nestedItems, lineStyle: 'dashed' })
		expect(container.querySelector('[data-tree]')?.getAttribute('data-line-style')).toBe('dashed')
	})

	it('sets data-line-style for dotted variant', () => {
		const { container } = render(Tree, { items: nestedItems, lineStyle: 'dotted' })
		expect(container.querySelector('[data-tree]')?.getAttribute('data-line-style')).toBe('dotted')
	})

	it('renders connectors with lineStyle=none (lines hidden via CSS)', () => {
		const items = JSON.parse(JSON.stringify(nestedItems))
		items[0].expanded = true
		const { container } = render(Tree, { items, lineStyle: 'none' })
		const connectors = container.querySelectorAll('[data-connector]')
		expect(connectors.length).toBeGreaterThan(0)
		expect(container.querySelector('[data-tree]')?.getAttribute('data-line-style')).toBe('none')
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
		const items_el = container.querySelectorAll('[data-tree-item-content]')
		const secondItem = items_el[1] as HTMLElement
		secondItem.focus()
		await fireEvent.keyDown(secondItem, { key: 'ArrowUp' })
		const focused = document.activeElement
		const node = focused?.closest('[data-tree-node]')
		expect(node?.getAttribute('data-tree-path')).toBe('0')
	})

	it('navigates to first with Home', async () => {
		const { container } = render(Tree, { items: flatItems })
		const items_el = container.querySelectorAll('[data-tree-item-content]')
		const lastItem = items_el[2] as HTMLElement
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
		expect(onselect).toHaveBeenCalledWith('a', expect.anything())
	})

	// ─── Link Items ─────────────────────────────────────────────────

	it('renders items with href as links', () => {
		const items = [{ text: 'Home', value: 'home', href: '/home' }]
		const { container } = render(Tree, { items })
		const link = container.querySelector('a[data-tree-item-content]')
		expect(link).toBeTruthy()
		expect(link?.getAttribute('href')).toBe('/home')
	})

	// ─── Translatable Labels ────────────────────────────────────────

	it('uses default labels from MessagesStore', () => {
		const { container } = render(Tree, { items: flatItems })
		const tree = container.querySelector('[data-tree]')
		expect(tree?.getAttribute('aria-label')).toBe('Tree')
	})

	it('uses default expand/collapse labels on toggle buttons', () => {
		const { container } = render(Tree, { items: nestedItems })
		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')
		expect(toggleBtn?.getAttribute('aria-label')).toBe('Expand')
	})

	it('allows custom labels prop to override defaults', () => {
		const { container } = render(Tree, { items: flatItems, labels: { label: 'Arbre' } })
		const tree = container.querySelector('[data-tree]')
		expect(tree?.getAttribute('aria-label')).toBe('Arbre')
	})

	it('allows custom expand/collapse labels', async () => {
		const { container } = render(Tree, { items: nestedItems, labels: { expand: 'Ouvrir', collapse: 'Fermer' } })
		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')
		expect(toggleBtn?.getAttribute('aria-label')).toBe('Ouvrir')
		// Expand and check collapse label
		await fireEvent.click(toggleBtn!)
		expect(toggleBtn?.getAttribute('aria-label')).toBe('Fermer')
	})
})
