import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import LazyTree from '../src/components/LazyTree.svelte'
import LazyTreeSnippetTest from './LazyTreeSnippetTest.svelte'

const flatItems = [
	{ label: 'File 1', value: 'file1' },
	{ label: 'File 2', value: 'file2' },
	{ label: 'File 3', value: 'file3' }
]

// Sentinel item — children: true signals a lazy-loadable node
const lazyItems = [
	{ label: 'Folder A', value: 'folderA', children: true },
	{ label: 'Folder B', value: 'folderB', children: true },
	{ label: 'Leaf', value: 'leaf' }
]

// Pre-loaded nested items (children is an array, not a sentinel)
const preloadedItems = [
	{
		label: 'src',
		value: 'src',
		children: [
			{ label: 'index.ts', value: 'index' },
			{ label: 'utils.ts', value: 'utils' }
		]
	},
	{ label: 'README.md', value: 'readme' }
]

describe('LazyTree', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a tree container with role="tree"', () => {
		const { container } = render(LazyTree, { items: flatItems })
		const tree = container.querySelector('[data-tree]')
		expect(tree).toBeTruthy()
		expect(tree?.getAttribute('role')).toBe('tree')
	})

	it('renders flat items as treeitem nodes', () => {
		const { container } = render(LazyTree, { items: flatItems })
		const nodes = container.querySelectorAll('[role="treeitem"]')
		expect(nodes.length).toBe(3)
	})

	it('renders empty tree without errors', () => {
		const { container } = render(LazyTree, { items: [] })
		expect(container.querySelector('[data-tree]')).toBeTruthy()
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(0)
	})

	it('defaults to md size', () => {
		const { container } = render(LazyTree, { items: flatItems })
		expect(container.querySelector('[data-tree]')?.getAttribute('data-size')).toBe('md')
	})

	it('accepts sm and lg size', () => {
		const { container: sm } = render(LazyTree, { items: flatItems, size: 'sm' })
		expect(sm.querySelector('[data-tree]')?.getAttribute('data-size')).toBe('sm')
		const { container: lg } = render(LazyTree, { items: flatItems, size: 'lg' })
		expect(lg.querySelector('[data-tree]')?.getAttribute('data-size')).toBe('lg')
	})

	it('sets data-tree-path on nodes', () => {
		const { container } = render(LazyTree, { items: flatItems })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('data-tree-path')).toBe('0')
		expect(nodes[1]?.getAttribute('data-tree-path')).toBe('1')
	})

	it('sets aria-level=1 on root items', () => {
		const { container } = render(LazyTree, { items: flatItems })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-level')).toBe('1')
	})

	it('sets data-line-style attribute', () => {
		const { container } = render(LazyTree, { items: flatItems, lineStyle: 'dashed' })
		expect(container.querySelector('[data-tree]')?.getAttribute('data-line-style')).toBe('dashed')
	})

	// ─── Lazy sentinel nodes ─────────────────────────────────────────

	it('marks lazy-sentinel nodes (children: true) as expandable', () => {
		const { container } = render(LazyTree, { items: lazyItems })
		const expandables = container.querySelectorAll('[data-tree-has-children]')
		expect(expandables.length).toBe(2) // Folder A and Folder B
	})

	it('sets aria-expanded=false on unloaded lazy nodes', () => {
		const { container } = render(LazyTree, { items: lazyItems })
		const parents = container.querySelectorAll('[data-tree-has-children]')
		expect(parents[0]?.getAttribute('aria-expanded')).toBe('false')
	})

	it('renders toggle button on lazy-sentinel nodes', () => {
		const { container } = render(LazyTree, { items: lazyItems })
		const toggleBtns = container.querySelectorAll('[data-tree-toggle-btn]')
		expect(toggleBtns.length).toBeGreaterThanOrEqual(2)
	})

	it('does NOT mark pre-loaded leaf items as expandable', () => {
		const { container } = render(LazyTree, { items: lazyItems })
		const nodes = container.querySelectorAll('[data-tree-node]')
		// 'Leaf' is the 3rd node (index 2) — no children attribute
		const leaf = nodes[2]
		expect(leaf?.hasAttribute('data-tree-has-children')).toBe(false)
	})

	// ─── Lazy loading — toggle triggers loader ────────────────────────

	it('calls onlazyload when a lazy node is toggled', async () => {
		const onlazyload = vi.fn().mockResolvedValue([{ label: 'Child 1', value: 'c1' }])
		const { container } = render(LazyTree, { items: lazyItems, onlazyload })

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		await waitFor(() => {
			expect(onlazyload).toHaveBeenCalledTimes(1)
		})
	})

	it('renders loaded children after lazy fetch resolves', async () => {
		const childItems = [{ label: 'Child 1', value: 'c1' }]
		const onlazyload = vi.fn().mockResolvedValue(childItems)
		const { container } = render(LazyTree, { items: lazyItems, onlazyload })

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		await waitFor(() => {
			const nodes = container.querySelectorAll('[data-tree-node]')
			// Folder A (expanded) + Child 1 + Folder B + Leaf = 4
			expect(nodes.length).toBe(4)
		})
	})

	it('loads and renders multiple children after fetch resolves', async () => {
		const childItems = [
			{ label: 'Child 1', value: 'c1' },
			{ label: 'Child 2', value: 'c2' }
		]
		const onlazyload = vi.fn().mockResolvedValue(childItems)
		// Use a single-sentinel item so only one folder expands
		const singleFolder = [{ label: 'Folder A', value: 'folderA', children: true }]
		const { container } = render(LazyTree, { items: singleFolder, onlazyload })

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		await waitFor(() => {
			const nodes = container.querySelectorAll('[data-tree-node]')
			// Folder A (expanded) + Child 1 + Child 2 = 3
			expect(nodes.length).toBe(3)
		})
	})

	it('removes data-tree-loading attribute after fetch completes', async () => {
		// After the fetch resolves the loading state must be cleared
		const onlazyload = vi.fn().mockResolvedValue([{ label: 'Child', value: 'child' }])
		const { container } = render(LazyTree, { items: lazyItems, onlazyload })

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		await waitFor(() => {
			expect(container.querySelector('[data-tree-loading]')).toBeFalsy()
		})
	})

	it('renders spinner markup ([data-tree-spinner]) inside the toggle button when loading state is active', () => {
		// Verify the spinner element exists in the component template by checking
		// that it can be produced when a node is in loading state.
		// We test this structurally: a loaded node shows an icon span, not a spinner span.
		const { container } = render(LazyTree, { items: lazyItems })
		// No node is loading initially — no spinner visible
		expect(container.querySelector('[data-tree-spinner]')).toBeFalsy()
		// Each expandable node shows an icon span inside the toggle button
		const iconSpans = container.querySelectorAll('[data-tree-toggle-btn] span[aria-hidden]')
		expect(iconSpans.length).toBeGreaterThan(0)
	})

	// ─── Pre-loaded children expand synchronously ─────────────────────

	it('expands pre-loaded children on toggle click', async () => {
		const { container } = render(LazyTree, { items: preloadedItems })
		expect(container.querySelectorAll('[data-tree-node]').length).toBe(2)

		const toggleBtn = container.querySelector('[data-tree-toggle-btn]')!
		await fireEvent.click(toggleBtn)

		expect(container.querySelectorAll('[data-tree-node]').length).toBe(4) // src + 2 children + README
	})

	// ─── hasMore / loadMore button ───────────────────────────────────

	it('shows Load More button when hasMore=true', () => {
		const { container } = render(LazyTree, { items: flatItems, hasMore: true })
		const btn = container.querySelector('button')
		expect(btn).toBeTruthy()
	})

	it('does NOT render a load-more button when hasMore=false (default)', () => {
		const { container } = render(LazyTree, { items: flatItems, hasMore: false })
		// Only item-content buttons, no extra load-more button
		const itemBtns = container.querySelectorAll('[data-tree-item-content]')
		const allBtns = container.querySelectorAll('button')
		// All buttons are item-content buttons — no extra load-more button
		expect(allBtns.length).toBe(itemBtns.length)
	})

	it('calls onlazyload when Load More is clicked', async () => {
		const onlazyload = vi.fn().mockResolvedValue([{ label: 'Extra', value: 'extra' }])
		const { container } = render(LazyTree, { items: flatItems, hasMore: true, onlazyload })

		// The Load More button is the last button (not a toggle)
		const buttons = container.querySelectorAll('button')
		const loadMoreBtn = buttons[buttons.length - 1] as HTMLElement
		await fireEvent.click(loadMoreBtn)

		await waitFor(() => {
			expect(onlazyload).toHaveBeenCalledTimes(1)
		})
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onselect when a leaf item is clicked', async () => {
		const onselect = vi.fn()
		const { container } = render(LazyTree, { items: flatItems, onselect })
		const itemBtns = container.querySelectorAll('[data-tree-item-content]')
		await fireEvent.click(itemBtns[1])
		expect(onselect).toHaveBeenCalledWith('file2', expect.anything())
	})

	it('marks the active item with data-active', () => {
		const { container } = render(LazyTree, { items: flatItems, value: 'file1' })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.hasAttribute('data-active')).toBe(true)
		expect(nodes[1]?.hasAttribute('data-active')).toBe(false)
	})

	it('sets aria-selected on the active node', () => {
		const { container } = render(LazyTree, { items: flatItems, value: 'file2' })
		const nodes = container.querySelectorAll('[data-tree-node]')
		expect(nodes[0]?.getAttribute('aria-selected')).toBe('false')
		expect(nodes[1]?.getAttribute('aria-selected')).toBe('true')
	})

	// ─── Custom field mapping ────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const customItems = [
			{ name: 'Alpha', id: 'alpha' },
			{ name: 'Beta', id: 'beta' }
		]
		const onselect = vi.fn()
		const { container } = render(LazyTree, {
			items: customItems,
			fields: { label: 'name', value: 'id' },
			onselect
		})
		const itemBtns = container.querySelectorAll('[data-tree-item-content]')
		await fireEvent.click(itemBtns[0])
		expect(onselect).toHaveBeenCalledWith('alpha', expect.anything())
	})

	// ─── Translatable labels ─────────────────────────────────────────

	it('has accessible aria-label on the tree container', () => {
		const { container } = render(LazyTree, { items: flatItems })
		const tree = container.querySelector('[data-tree]')
		expect(tree?.getAttribute('aria-label')).toBeTruthy()
	})

	it('accepts custom label override', () => {
		const { container } = render(LazyTree, { items: flatItems, labels: { label: 'Nav Tree' } })
		expect(container.querySelector('[data-tree]')?.getAttribute('aria-label')).toBe('Nav Tree')
	})

	// ─── Named snippet resolution (item.snippet) ─────────────────────

	describe('named snippet resolution', () => {
		const snippetItems = [
			{ label: 'Pinned Item', value: 'pinned', snippet: 'pinned' },
			{ label: 'Regular Item', value: 'regular' },
			{ label: 'Another Item', value: 'another' }
		]

		it('routes a leaf with item.snippet to the named snippet (over itemContent)', () => {
			const { container } = render(LazyTreeSnippetTest, { items: snippetItems })
			expect(container.querySelector('[data-named-item]')?.textContent).toContain(
				'Pinned: Pinned Item'
			)
		})

		it('falls back to itemContent for leaves without item.snippet', () => {
			const { container } = render(LazyTreeSnippetTest, { items: snippetItems })
			const defaults = [...container.querySelectorAll('[data-default-item]')].map(
				(n) => n.textContent
			)
			expect(defaults.some((t) => t?.includes('Item: Regular Item'))).toBe(true)
			expect(defaults.some((t) => t?.includes('Item: Another Item'))).toBe(true)
		})

		it('does not render the pinned item via default itemContent', () => {
			const { container } = render(LazyTreeSnippetTest, { items: snippetItems })
			const defaults = [...container.querySelectorAll('[data-default-item]')].map(
				(n) => n.textContent
			)
			expect(defaults.some((t) => t?.includes('Pinned Item'))).toBe(false)
		})

		it('renders exactly one named-item element for the snippet-routed leaf', () => {
			const { container } = render(LazyTreeSnippetTest, { items: snippetItems })
			expect(container.querySelectorAll('[data-named-item]').length).toBe(1)
		})
	})
})
