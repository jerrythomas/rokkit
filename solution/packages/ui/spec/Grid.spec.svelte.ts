import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Grid from '../src/components/Grid.svelte'

const flatItems = [
	{ text: 'Alpha', value: 'alpha', icon: 'mdi:star' },
	{ text: 'Beta', value: 'beta', icon: 'mdi:heart' },
	{ text: 'Gamma', value: 'gamma', icon: 'mdi:bolt' }
]

describe('Grid', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders container with data-grid', () => {
		const { container } = render(Grid, { items: flatItems })
		const grid = container.querySelector('[data-grid]')
		expect(grid).toBeTruthy()
	})

	it('renders one tile per item with data-grid-item', () => {
		const { container } = render(Grid, { items: flatItems })
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles.length).toBe(3)
	})

	it('sets data-path on each tile', () => {
		const { container } = render(Grid, { items: flatItems })
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.getAttribute('data-path')).toBe('0')
		expect(tiles[1]?.getAttribute('data-path')).toBe('1')
		expect(tiles[2]?.getAttribute('data-path')).toBe('2')
	})

	it('marks selected tile with data-active', () => {
		const { container } = render(Grid, { items: flatItems, value: 'beta' })
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.hasAttribute('data-active')).toBe(false)
		expect(tiles[1]?.hasAttribute('data-active')).toBe(true)
		expect(tiles[2]?.hasAttribute('data-active')).toBe(false)
	})

	// ─── ARIA ───────────────────────────────────────────────────────

	it('sets role="grid" on container', () => {
		const { container } = render(Grid, { items: flatItems })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.getAttribute('role')).toBe('grid')
	})

	it('sets role="gridcell" on tiles', () => {
		const { container } = render(Grid, { items: flatItems })
		const cells = container.querySelectorAll('[role="gridcell"]')
		expect(cells.length).toBe(3)
	})

	it('sets aria-selected on tiles', () => {
		const { container } = render(Grid, { items: flatItems, value: 'alpha' })
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.getAttribute('aria-selected')).toBe('true')
		expect(tiles[1]?.getAttribute('aria-selected')).toBe('false')
	})

	it('sets aria-label on each tile from proxy.label', () => {
		const { container } = render(Grid, { items: flatItems })
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.getAttribute('aria-label')).toBe('Alpha')
	})

	it('sets aria-label on container', () => {
		const { container } = render(Grid, { items: flatItems })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.getAttribute('aria-label')).toBe('Grid')
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('fires onselect when tile is clicked', async () => {
		const onselect = vi.fn()
		const { container } = render(Grid, { items: flatItems, onselect })
		const tiles = container.querySelectorAll('[data-grid-item]')
		await fireEvent.click(tiles[1])
		expect(onselect).toHaveBeenCalled()
		expect(onselect.mock.calls[0][0]).toBe('beta')
	})

	// ─── CSS Custom Properties ──────────────────────────────────────

	it('sets --grid-min-size and --grid-gap CSS variables', () => {
		const { container } = render(Grid, { items: flatItems, minSize: '200px', gap: '2rem' })
		const grid = container.querySelector('[data-grid]') as HTMLElement
		expect(grid?.style.getPropertyValue('--grid-min-size')).toBe('200px')
		expect(grid?.style.getPropertyValue('--grid-gap')).toBe('2rem')
	})

	it('uses default CSS variable values', () => {
		const { container } = render(Grid, { items: flatItems })
		const grid = container.querySelector('[data-grid]') as HTMLElement
		expect(grid?.style.getPropertyValue('--grid-min-size')).toBe('120px')
		expect(grid?.style.getPropertyValue('--grid-gap')).toBe('1rem')
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables all tiles when disabled: true', () => {
		const { container } = render(Grid, { items: flatItems, disabled: true })
		const tiles = container.querySelectorAll('[data-grid-item]')
		tiles.forEach((tile) => {
			expect(tile.hasAttribute('disabled')).toBe(true)
		})
	})

	it('sets data-disabled on container when disabled', () => {
		const { container } = render(Grid, { items: flatItems, disabled: true })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.hasAttribute('data-disabled')).toBe(true)
	})

	it('does not set data-disabled when not disabled', () => {
		const { container } = render(Grid, { items: flatItems })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.hasAttribute('data-disabled')).toBe(false)
	})

	it('does not fire onselect when grid is disabled', async () => {
		const onselect = vi.fn()
		const { container } = render(Grid, { items: flatItems, disabled: true, onselect })
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.hasAttribute('disabled')).toBe(true)
		await fireEvent.click(tiles[0])
		expect(onselect).not.toHaveBeenCalled()
	})

	// ─── Default Content ────────────────────────────────────────────

	it('renders default ItemContent when no snippet provided', () => {
		const { container } = render(Grid, { items: flatItems })
		const tiles = container.querySelectorAll('[data-grid-item]')
		// ItemContent renders data-item-label for text
		const label = tiles[0]?.querySelector('[data-item-label]')
		expect(label?.textContent).toBe('Alpha')
	})

	it('renders item icons via default ItemContent', () => {
		const { container } = render(Grid, { items: flatItems })
		const tiles = container.querySelectorAll('[data-grid-item]')
		const icon = tiles[0]?.querySelector('[data-item-icon]')
		expect(icon).toBeTruthy()
	})

	// ─── Size ───────────────────────────────────────────────────────

	it('defaults to md size', () => {
		const { container } = render(Grid, { items: flatItems })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.getAttribute('data-size')).toBe('md')
	})

	it('supports custom size', () => {
		const { container } = render(Grid, { items: flatItems, size: 'lg' })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.getAttribute('data-size')).toBe('lg')
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Grid, { items: flatItems, class: 'my-custom-grid' })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.classList.contains('my-custom-grid')).toBe(true)
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const items = [
			{ name: 'One', id: '1' },
			{ name: 'Two', id: '2' }
		]
		const onselect = vi.fn()
		const { container } = render(Grid, {
			items,
			fields: { text: 'name', value: 'id' },
			onselect
		})
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles.length).toBe(2)
		await fireEvent.click(tiles[0])
		expect(onselect).toHaveBeenCalled()
		expect(onselect.mock.calls[0][0]).toBe('1')
	})

	// ─── Per-item Disabled ──────────────────────────────────────────

	it('marks individual disabled items', () => {
		const items = [
			{ text: 'A', value: 'a' },
			{ text: 'B', value: 'b', disabled: true }
		]
		const { container } = render(Grid, { items })
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.hasAttribute('data-disabled')).toBe(false)
		expect(tiles[1]?.hasAttribute('data-disabled')).toBe(true)
		expect(tiles[1]?.hasAttribute('disabled')).toBe(true)
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty grid', () => {
		const { container } = render(Grid, { items: [] })
		const grid = container.querySelector('[data-grid]')
		expect(grid).toBeTruthy()
		expect(container.querySelectorAll('[data-grid-item]').length).toBe(0)
	})

	// ─── External Value Sync ────────────────────────────────────────

	it('marks matching item as active on initial render', () => {
		const { container } = render(Grid, { items: flatItems, value: 'gamma' })
		const tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.hasAttribute('data-active')).toBe(false)
		expect(tiles[1]?.hasAttribute('data-active')).toBe(false)
		expect(tiles[2]?.hasAttribute('data-active')).toBe(true)
	})

	it('updates active tile when value changes externally', async () => {
		const { container, rerender } = render(Grid, { items: flatItems, value: 'alpha' })
		let tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.hasAttribute('data-active')).toBe(true)

		await rerender({ value: 'gamma' })
		tiles = container.querySelectorAll('[data-grid-item]')
		expect(tiles[0]?.hasAttribute('data-active')).toBe(false)
		expect(tiles[2]?.hasAttribute('data-active')).toBe(true)
	})

	it('clears active state when value set to undefined', async () => {
		const { container, rerender } = render(Grid, { items: flatItems, value: 'beta' })
		expect(container.querySelector('[data-active]')).toBeTruthy()

		await rerender({ value: undefined })
		expect(container.querySelector('[data-active]')).toBeNull()
	})

	// ─── Translatable Label ─────────────────────────────────────────

	it('uses default label from MessagesStore', () => {
		const { container } = render(Grid, { items: flatItems })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.getAttribute('aria-label')).toBe('Grid')
	})

	it('allows custom label prop to override default', () => {
		const { container } = render(Grid, { items: flatItems, label: 'Image Gallery' })
		const grid = container.querySelector('[data-grid]')
		expect(grid?.getAttribute('aria-label')).toBe('Image Gallery')
	})
})
