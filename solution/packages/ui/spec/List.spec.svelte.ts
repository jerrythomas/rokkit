import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import List from '../src/components/List.svelte'

const flatItems = [
	{ text: 'Dashboard', value: 'dashboard', icon: 'mdi:home' },
	{ text: 'Settings', value: 'settings', icon: 'mdi:cog' },
	{ text: 'Profile', value: 'profile', icon: 'mdi:user' }
]

const groupedItems = [
	{
		text: 'Navigation',
		children: [
			{ text: 'Dashboard', value: 'dashboard' },
			{ text: 'Reports', value: 'reports' }
		]
	},
	{
		text: 'Account',
		children: [
			{ text: 'Settings', value: 'settings' },
			{ text: 'Profile', value: 'profile' }
		]
	}
]

describe('List', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a nav element with data-list', () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')
		expect(nav).toBeTruthy()
	})

	it('has aria-label', () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')
		expect(nav?.getAttribute('aria-label')).toBe('List')
	})

	// ─── Flat Items ─────────────────────────────────────────────────

	it('renders flat items as buttons', () => {
		const { container } = render(List, { items: flatItems })
		const items = container.querySelectorAll('[data-list-item]')
		expect(items.length).toBe(3)
		expect(items[0]?.tagName.toLowerCase()).toBe('button')
	})

	it('renders items as links when href is present', () => {
		const items = [
			{ text: 'Home', value: 'home', href: '/home' },
			{ text: 'About', value: 'about', href: '/about' }
		]
		const { container } = render(List, { items })
		const links = container.querySelectorAll('a[data-list-item]')
		expect(links.length).toBe(2)
		expect(links[0]?.getAttribute('href')).toBe('/home')
	})

	it('renders item icons', () => {
		const { container } = render(List, { items: flatItems })
		const icons = container.querySelectorAll('[data-item-icon]')
		expect(icons.length).toBe(3)
	})

	it('marks active item', () => {
		const { container } = render(List, { items: flatItems, active: 'settings' })
		const items = container.querySelectorAll('[data-list-item]')
		expect(items[0]?.hasAttribute('data-active')).toBe(false)
		expect(items[1]?.hasAttribute('data-active')).toBe(true)
	})

	it('marks disabled items', () => {
		const items = [
			{ text: 'A', value: 'a' },
			{ text: 'B', value: 'b', disabled: true }
		]
		const { container } = render(List, { items })
		const listItems = container.querySelectorAll('[data-list-item]')
		expect(listItems[1]?.hasAttribute('data-disabled')).toBe(true)
	})

	// ─── Grouped Items ──────────────────────────────────────────────

	it('renders groups', () => {
		const { container } = render(List, { items: groupedItems })
		const groups = container.querySelectorAll('[data-list-group]')
		expect(groups.length).toBe(2)
	})

	it('renders group labels', () => {
		const { container } = render(List, { items: groupedItems })
		const labels = container.querySelectorAll('[data-list-group-label]')
		expect(labels.length).toBe(2)
		expect(labels[0]?.textContent).toContain('Navigation')
		expect(labels[1]?.textContent).toContain('Account')
	})

	it('renders group children', () => {
		const { container } = render(List, { items: groupedItems })
		const groupItems = container.querySelectorAll('[data-list-group-items]')
		expect(groupItems.length).toBe(2)
		// First group has 2 children
		expect(groupItems[0]?.querySelectorAll('[data-list-item]').length).toBe(2)
	})

	it('renders dividers between groups', () => {
		const { container } = render(List, { items: groupedItems })
		const dividers = container.querySelectorAll('[data-list-divider]')
		expect(dividers.length).toBe(1) // divider before second group
	})

	// ─── Collapsible ────────────────────────────────────────────────

	it('shows children by default when not collapsible', () => {
		const { container } = render(List, { items: groupedItems })
		const groupItems = container.querySelectorAll('[data-list-group-items]')
		expect(groupItems.length).toBe(2)
	})

	it('shows collapsible arrow when collapsible', () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const arrows = container.querySelectorAll('[data-list-group-arrow]')
		expect(arrows.length).toBe(2)
	})

	it('does not show arrow when not collapsible', () => {
		const { container } = render(List, { items: groupedItems, collapsible: false })
		const arrows = container.querySelectorAll('[data-list-group-arrow]')
		expect(arrows.length).toBe(0)
	})

	it('toggles group on click when collapsible', async () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const label = container.querySelectorAll('[data-list-group-label]')[0]
		// Initially expanded
		expect(container.querySelector('[data-list-group]')?.hasAttribute('data-list-group-collapsed')).toBe(false)
		await fireEvent.click(label!)
		expect(container.querySelector('[data-list-group]')?.hasAttribute('data-list-group-collapsed')).toBe(true)
	})

	it('sets aria-expanded on group labels when collapsible', () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const labels = container.querySelectorAll('[data-list-group-label]')
		expect(labels[0]?.getAttribute('aria-expanded')).toBe('true')
	})

	it('calls onexpandedchange when group toggled', async () => {
		const onexpandedchange = vi.fn()
		const { container } = render(List, {
			items: groupedItems,
			collapsible: true,
			expanded: { Navigation: true, Account: true },
			onexpandedchange
		})
		const label = container.querySelectorAll('[data-list-group-label]')[0]
		await fireEvent.click(label!)
		expect(onexpandedchange).toHaveBeenCalled()
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onselect when clicking a flat item', async () => {
		const onselect = vi.fn()
		const { container } = render(List, { items: flatItems, onselect })
		const items = container.querySelectorAll('[data-list-item]')
		await fireEvent.click(items[1])
		expect(onselect).toHaveBeenCalledWith('settings', flatItems[1])
	})

	it('does not call onselect for disabled items', async () => {
		const items = [
			{ text: 'A', value: 'a' },
			{ text: 'B', value: 'b', disabled: true }
		]
		const onselect = vi.fn()
		const { container } = render(List, { items, onselect })
		const listItems = container.querySelectorAll('[data-list-item]')
		await fireEvent.click(listItems[1])
		expect(onselect).not.toHaveBeenCalled()
	})

	it('calls onselect for group children', async () => {
		const onselect = vi.fn()
		const { container } = render(List, { items: groupedItems, onselect })
		const childItems = container.querySelectorAll('[data-list-group-items] [data-list-item]')
		await fireEvent.click(childItems[0])
		expect(onselect).toHaveBeenCalledWith('dashboard', groupedItems[0].children[0])
	})

	// ─── Keyboard Navigation ────────────────────────────────────────

	it('navigates with ArrowDown', async () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')!
		// Focus first item
		const firstItem = container.querySelector('[data-list-index="0"]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(nav, { key: 'ArrowDown' })
		const focused = document.activeElement
		expect(focused?.getAttribute('data-list-index')).toBe('1')
	})

	it('navigates with ArrowUp', async () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')!
		// Focus second item
		const secondItem = container.querySelector('[data-list-index="1"]') as HTMLElement
		secondItem.focus()
		await fireEvent.keyDown(nav, { key: 'ArrowUp' })
		const focused = document.activeElement
		expect(focused?.getAttribute('data-list-index')).toBe('0')
	})

	it('navigates to first with Home', async () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')!
		const lastItem = container.querySelector('[data-list-index="2"]') as HTMLElement
		lastItem.focus()
		await fireEvent.keyDown(nav, { key: 'Home' })
		const focused = document.activeElement
		expect(focused?.getAttribute('data-list-index')).toBe('0')
	})

	it('navigates to last with End', async () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')!
		const firstItem = container.querySelector('[data-list-index="0"]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(nav, { key: 'End' })
		const focused = document.activeElement
		expect(focused?.getAttribute('data-list-index')).toBe('2')
	})

	it('selects item with Enter key', async () => {
		const onselect = vi.fn()
		const { container } = render(List, { items: flatItems, onselect })
		const item = container.querySelector('[data-list-index="1"]') as HTMLElement
		item.focus()
		await fireEvent.keyDown(item, { key: 'Enter' })
		expect(onselect).toHaveBeenCalledWith('settings', flatItems[1])
	})

	// ─── Keyboard: Collapsible Groups ───────────────────────────────

	it('expands group with ArrowRight', async () => {
		const { container } = render(List, {
			items: groupedItems,
			collapsible: true,
			expanded: { Navigation: false }
		})
		const nav = container.querySelector('nav[data-list]')!
		const groupLabel = container.querySelector('[data-list-index="0"]') as HTMLElement
		groupLabel.focus()
		await fireEvent.keyDown(nav, { key: 'ArrowRight' })
		// Group should now be expanded
		const group = container.querySelector('[data-list-group]')
		expect(group?.hasAttribute('data-list-group-collapsed')).toBe(false)
	})

	it('collapses group with ArrowLeft', async () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const nav = container.querySelector('nav[data-list]')!
		const groupLabel = container.querySelector('[data-list-index="0"]') as HTMLElement
		groupLabel.focus()
		// Group starts expanded, ArrowLeft should collapse
		await fireEvent.keyDown(nav, { key: 'ArrowLeft' })
		const group = container.querySelector('[data-list-group]')
		expect(group?.hasAttribute('data-list-group-collapsed')).toBe(true)
	})

	// ─── Sizes ──────────────────────────────────────────────────────

	it('defaults to md size', () => {
		const { container } = render(List, { items: flatItems })
		expect(container.querySelector('[data-list]')?.getAttribute('data-size')).toBe('md')
	})

	it('supports sm size', () => {
		const { container } = render(List, { items: flatItems, size: 'sm' })
		expect(container.querySelector('[data-list]')?.getAttribute('data-size')).toBe('sm')
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables entire list', () => {
		const { container } = render(List, { items: flatItems, disabled: true })
		const el = container.querySelector('[data-list]')
		expect(el?.hasAttribute('data-disabled')).toBe(true)
	})

	it('does not call onselect when list is disabled', async () => {
		const onselect = vi.fn()
		const { container } = render(List, { items: flatItems, disabled: true, onselect })
		const item = container.querySelectorAll('[data-list-item]')[0]
		await fireEvent.click(item!)
		expect(onselect).not.toHaveBeenCalled()
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const items = [
			{ name: 'Home', id: 'home' },
			{ name: 'About', id: 'about' }
		]
		const onselect = vi.fn()
		const { container } = render(List, {
			items,
			fields: { text: 'name', value: 'id' },
			onselect
		})
		const listItems = container.querySelectorAll('[data-list-item]')
		expect(listItems.length).toBe(2)
		await fireEvent.click(listItems[0])
		expect(onselect).toHaveBeenCalledWith('home', items[0])
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty list', () => {
		const { container } = render(List, { items: [] })
		const nav = container.querySelector('nav[data-list]')
		expect(nav).toBeTruthy()
		expect(container.querySelectorAll('[data-list-item]').length).toBe(0)
	})

	// ─── Multi-Selection ────────────────────────────────────────────

	it('applies data-multiselect on container when multiselect is true', () => {
		const { container } = render(List, { items: flatItems, multiselect: true })
		const nav = container.querySelector('nav[data-list]')
		expect(nav?.hasAttribute('data-multiselect')).toBe(true)
	})

	it('does not apply data-multiselect when multiselect is false', () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')
		expect(nav?.hasAttribute('data-multiselect')).toBe(false)
	})

	it('sets aria-multiselectable when multiselect is true', () => {
		const { container } = render(List, { items: flatItems, multiselect: true })
		const nav = container.querySelector('nav[data-list]')
		expect(nav?.getAttribute('aria-multiselectable')).toBe('true')
	})

	it('does not render data-selected on items when multiselect is false', () => {
		const { container } = render(List, { items: flatItems, active: 'dashboard' })
		const items = container.querySelectorAll('[data-list-item]')
		items.forEach((item) => {
			expect(item.hasAttribute('data-selected')).toBe(false)
		})
	})

	it('does not render aria-selected on items when multiselect is false', () => {
		const { container } = render(List, { items: flatItems })
		const items = container.querySelectorAll('button[data-list-item]')
		items.forEach((item) => {
			expect(item.hasAttribute('aria-selected')).toBe(false)
		})
	})

	it('renders aria-selected on items when multiselect is true', () => {
		const { container } = render(List, { items: flatItems, multiselect: true })
		const items = container.querySelectorAll('button[data-list-item]')
		items.forEach((item) => {
			expect(item.getAttribute('aria-selected')).toBe('false')
		})
	})
})
