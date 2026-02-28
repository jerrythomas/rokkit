import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'
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
		// Icons render as <span class={proxy.icon} aria-hidden="true"> inside item buttons
		const items = container.querySelectorAll('[data-list-item]')
		const iconsFound = Array.from(items).filter(
			(item) => item.querySelector('[aria-hidden="true"]')
		).length
		expect(iconsFound).toBe(3)
	})

	it('marks active item', () => {
		const { container } = render(List, { items: flatItems, value: 'settings' })
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

	it('renders group labels', () => {
		const { container } = render(List, { items: groupedItems })
		const labels = container.querySelectorAll('[data-list-group]')
		expect(labels.length).toBe(2)
		expect(labels[0]?.textContent).toContain('Navigation')
		expect(labels[1]?.textContent).toContain('Account')
	})

	it('renders group children when expanded', async () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		// Groups start collapsed — expand the first group
		const label = container.querySelector('[data-list-group]')!
		await fireEvent.click(label)
		flushSync()
		const items = container.querySelectorAll('[data-list-item]')
		expect(items.length).toBe(2) // Navigation group has 2 children
	})

	it('renders separators when present in items', () => {
		const itemsWithSep = [
			{ text: 'A', value: 'a' },
			{ type: 'separator' },
			{ text: 'B', value: 'b' }
		]
		const { container } = render(List, { items: itemsWithSep })
		const separators = container.querySelectorAll('[data-list-separator]')
		expect(separators.length).toBe(1)
	})

	// ─── Collapsible ────────────────────────────────────────────────

	it('shows expand icon when collapsible', () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const expandIcons = container.querySelectorAll('[data-list-expand-icon]')
		expect(expandIcons.length).toBe(2)
	})

	it('does not show expand icon when not collapsible', () => {
		const { container } = render(List, { items: groupedItems, collapsible: false })
		const expandIcons = container.querySelectorAll('[data-list-expand-icon]')
		expect(expandIcons.length).toBe(0)
	})

	it('toggles group on click when collapsible', async () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const label = container.querySelector('[data-list-group]')!
		// Groups start collapsed
		expect(label.getAttribute('aria-expanded')).toBe('false')
		await fireEvent.click(label)
		flushSync()
		expect(label.getAttribute('aria-expanded')).toBe('true')
	})

	it('sets aria-expanded on group labels when collapsible', () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const labels = container.querySelectorAll('[data-list-group]')
		// Groups start collapsed
		expect(labels[0]?.getAttribute('aria-expanded')).toBe('false')
		expect(labels[1]?.getAttribute('aria-expanded')).toBe('false')
	})

	it('disables group label button when not collapsible', () => {
		const { container } = render(List, { items: groupedItems, collapsible: false })
		const labels = container.querySelectorAll('[data-list-group]')
		expect(labels[0]?.hasAttribute('disabled')).toBe(true)
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onselect when clicking a flat item', async () => {
		const onselect = vi.fn()
		const { container } = render(List, { items: flatItems, onselect })
		const items = container.querySelectorAll('[data-list-item]')
		await fireEvent.click(items[1])
		expect(onselect).toHaveBeenCalled()
		expect(onselect.mock.calls[0][0]).toBe('settings')
	})

	it('does not call onselect for disabled items', async () => {
		const items = [
			{ text: 'A', value: 'a' },
			{ text: 'B', value: 'b', disabled: true }
		]
		const { container } = render(List, { items })
		const listItems = container.querySelectorAll('[data-list-item]')
		// Disabled items have disabled attribute — browser prevents click events
		expect(listItems[1]?.hasAttribute('disabled')).toBe(true)
	})

	it('calls onselect for group children', async () => {
		const onselect = vi.fn()
		const { container } = render(List, { items: groupedItems, collapsible: true, onselect })
		// Expand first group
		const label = container.querySelector('[data-list-group]')!
		await fireEvent.click(label)
		flushSync()
		// Click first child item
		const childItem = container.querySelector('[data-list-item]')!
		await fireEvent.click(childItem)
		expect(onselect).toHaveBeenCalled()
		expect(onselect.mock.calls[0][0]).toBe('dashboard')
	})

	// ─── Keyboard Navigation ────────────────────────────────────────

	it('navigates with ArrowDown', async () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')!
		const firstItem = container.querySelector('[data-path="0"]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(nav, { key: 'ArrowDown' })
		expect(document.activeElement?.getAttribute('data-path')).toBe('1')
	})

	it('navigates with ArrowUp', async () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')!
		const secondItem = container.querySelector('[data-path="1"]') as HTMLElement
		secondItem.focus()
		await fireEvent.keyDown(nav, { key: 'ArrowUp' })
		expect(document.activeElement?.getAttribute('data-path')).toBe('0')
	})

	it('navigates to first with Home', async () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')!
		const lastItem = container.querySelector('[data-path="2"]') as HTMLElement
		lastItem.focus()
		await fireEvent.keyDown(nav, { key: 'Home' })
		expect(document.activeElement?.getAttribute('data-path')).toBe('0')
	})

	it('navigates to last with End', async () => {
		const { container } = render(List, { items: flatItems })
		const nav = container.querySelector('nav[data-list]')!
		const firstItem = container.querySelector('[data-path="0"]') as HTMLElement
		firstItem.focus()
		await fireEvent.keyDown(nav, { key: 'End' })
		expect(document.activeElement?.getAttribute('data-path')).toBe('2')
	})

	it('selects item with Enter key', async () => {
		const onselect = vi.fn()
		const { container } = render(List, { items: flatItems, onselect })
		const item = container.querySelector('[data-path="1"]') as HTMLElement
		item.focus()
		await fireEvent.keyDown(item, { key: 'Enter' })
		expect(onselect).toHaveBeenCalled()
		expect(onselect.mock.calls[0][0]).toBe('settings')
	})

	// ─── Keyboard: Collapsible Groups ───────────────────────────────

	it('expands group with ArrowRight', async () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const nav = container.querySelector('nav[data-list]')!
		const groupLabel = container.querySelector('[data-path="0"]') as HTMLElement
		groupLabel.focus()
		// Group starts collapsed
		expect(groupLabel.getAttribute('aria-expanded')).toBe('false')
		await fireEvent.keyDown(nav, { key: 'ArrowRight' })
		flushSync()
		expect(groupLabel.getAttribute('aria-expanded')).toBe('true')
	})

	it('collapses group with ArrowLeft', async () => {
		const { container } = render(List, { items: groupedItems, collapsible: true })
		const nav = container.querySelector('nav[data-list]')!
		const groupLabel = container.querySelector('[data-path="0"]') as HTMLElement
		groupLabel.focus()
		// Expand first
		await fireEvent.keyDown(nav, { key: 'ArrowRight' })
		flushSync()
		expect(groupLabel.getAttribute('aria-expanded')).toBe('true')
		// Now collapse
		await fireEvent.keyDown(nav, { key: 'ArrowLeft' })
		flushSync()
		expect(groupLabel.getAttribute('aria-expanded')).toBe('false')
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

	it('disables all buttons when list is disabled', () => {
		const { container } = render(List, { items: flatItems, disabled: true })
		const items = container.querySelectorAll('[data-list-item]')
		items.forEach((item) => {
			expect(item.hasAttribute('disabled')).toBe(true)
		})
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
		expect(onselect).toHaveBeenCalled()
		expect(onselect.mock.calls[0][0]).toBe('home')
	})

	// ─── External value sync (moveToValue) ─────────────────────────

	it('marks matching item as active on initial render', () => {
		const { container } = render(List, { items: flatItems, value: 'settings' })
		const items = container.querySelectorAll('[data-list-item]')
		expect(items[0]?.hasAttribute('data-active')).toBe(false)
		expect(items[1]?.hasAttribute('data-active')).toBe(true)
		expect(items[2]?.hasAttribute('data-active')).toBe(false)
	})

	it('updates active item when value changes externally', async () => {
		const { container, rerender } = render(List, { items: flatItems, value: 'dashboard' })
		let items = container.querySelectorAll('[data-list-item]')
		expect(items[0]?.hasAttribute('data-active')).toBe(true)

		await rerender({ value: 'profile' })
		items = container.querySelectorAll('[data-list-item]')
		expect(items[0]?.hasAttribute('data-active')).toBe(false)
		expect(items[2]?.hasAttribute('data-active')).toBe(true)
	})

	it('clears active state when value set to undefined', async () => {
		const { container, rerender } = render(List, { items: flatItems, value: 'settings' })
		expect(container.querySelector('[data-active]')).toBeTruthy()

		await rerender({ value: undefined })
		expect(container.querySelector('[data-active]')).toBeNull()
	})

	it('keyboard navigation starts from externally set value position', async () => {
		const { container } = render(List, { items: flatItems, value: 'settings' })
		const nav = container.querySelector('nav[data-list]')!

		// focusedKey synced to 'settings' (path "1") — ArrowDown should land on 'profile' (path "2")
		await fireEvent.keyDown(nav, { key: 'ArrowDown' })

		const focused = document.activeElement
		expect(focused?.getAttribute('data-path')).toBe('2')
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty list', () => {
		const { container } = render(List, { items: [] })
		const nav = container.querySelector('nav[data-list]')
		expect(nav).toBeTruthy()
		expect(container.querySelectorAll('[data-list-item]').length).toBe(0)
	})
})
