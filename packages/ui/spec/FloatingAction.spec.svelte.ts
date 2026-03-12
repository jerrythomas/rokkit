import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import FloatingAction from '../src/components/FloatingAction.svelte'

const basicItems = [
	{ label: 'Add', value: 'add', icon: 'mdi:plus' },
	{ label: 'Edit', value: 'edit', icon: 'mdi:pencil' },
	{ label: 'Delete', value: 'delete', icon: 'mdi:trash' }
]

describe('FloatingAction', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a FAB container', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		expect(container.querySelector('[data-fab]')).toBeTruthy()
	})

	it('renders a trigger button', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')
		expect(trigger).toBeTruthy()
	})

	it('trigger has aria-haspopup="menu"', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')
		expect(trigger?.getAttribute('aria-haspopup')).toBe('menu')
	})

	it('trigger has aria-expanded="false" when closed', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')
		expect(trigger?.getAttribute('aria-expanded')).toBe('false')
	})

	it('renders the trigger icon', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const icon = container.querySelector('[data-fab-icon]')
		expect(icon).toBeTruthy()
	})

	// ─── Icons ──────────────────────────────────────────────────────

	it('renders default semantic action-add icon when closed', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const icon = container.querySelector('[data-fab-icon]')
		expect(icon?.classList.contains('action-add')).toBe(true)
	})

	it('renders default semantic action-close icon when open', () => {
		const { container } = render(FloatingAction, { items: basicItems, open: true })
		const icon = container.querySelector('[data-fab-icon]')
		expect(icon?.classList.contains('action-close')).toBe(true)
	})

	it('uses custom icons override', () => {
		const { container } = render(FloatingAction, {
			items: basicItems,
			icons: { add: 'custom-plus', close: 'custom-x' }
		})
		const icon = container.querySelector('[data-fab-icon]')
		expect(icon?.classList.contains('custom-plus')).toBe(true)
	})

	// ─── Open/Close ─────────────────────────────────────────────────

	it('opens on trigger click', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.click(trigger)
		expect(container.querySelector('[data-fab]')?.hasAttribute('data-open')).toBe(true)
		expect(container.querySelector('[data-fab-menu]')).toBeTruthy()
	})

	it('closes on second trigger click', async () => {
		const { container } = render(FloatingAction, { items: basicItems, open: true })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.click(trigger)
		expect(container.querySelector('[data-fab]')?.hasAttribute('data-open')).toBe(false)
	})

	it('shows items when open', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.click(trigger)
		const fabItems = container.querySelectorAll('[data-fab-item]')
		expect(fabItems.length).toBe(3)
	})

	it('hides items when closed', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		expect(container.querySelector('[data-fab-menu]')).toBeNull()
	})

	it('trigger aria-expanded updates when opened', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.click(trigger)
		expect(trigger.getAttribute('aria-expanded')).toBe('true')
	})

	it('closes on Escape key', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.click(trigger)
		expect(container.querySelector('[data-fab-menu]')).toBeTruthy()
		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(container.querySelector('[data-fab]')?.hasAttribute('data-open')).toBe(false)
	})

	it('closes on backdrop click', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.click(trigger)
		const backdrop = container.querySelector('[data-fab-backdrop]')
		expect(backdrop).toBeTruthy()
		await fireEvent.click(backdrop!)
		expect(container.querySelector('[data-fab]')?.hasAttribute('data-open')).toBe(false)
	})

	// ─── Items ──────────────────────────────────────────────────────

	it('renders item icons', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		const icons = container.querySelectorAll('[data-fab-item-icon]')
		expect(icons.length).toBe(3)
		expect(icons[0]?.classList.contains('mdi:plus')).toBe(true)
	})

	it('renders item labels', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		const labels = container.querySelectorAll('[data-fab-item-label]')
		expect(labels.length).toBe(3)
		expect(labels[0]?.textContent).toBe('Add')
	})

	it('marks disabled items', async () => {
		const items = [
			{ label: 'Add', value: 'add', icon: 'mdi:plus' },
			{ label: 'Disabled', value: 'dis', icon: 'mdi:x', disabled: true }
		]
		const { container } = render(FloatingAction, { items })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		// Only non-disabled items show in the menu (flatItems filters disabled)
		const fabItems = container.querySelectorAll('[data-fab-item]')
		expect(fabItems.length).toBe(1)
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onselect when clicking an item', async () => {
		const onselect = vi.fn()
		const { container } = render(FloatingAction, { items: basicItems, onselect })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		const fabItems = container.querySelectorAll('[data-fab-item]')
		await fireEvent.click(fabItems[1])
		expect(onselect).toHaveBeenCalledWith('edit', basicItems[1])
	})

	it('closes menu after selecting an item', async () => {
		const onselect = vi.fn()
		const { container } = render(FloatingAction, { items: basicItems, onselect })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		const fabItems = container.querySelectorAll('[data-fab-item]')
		await fireEvent.click(fabItems[0])
		expect(container.querySelector('[data-fab]')?.hasAttribute('data-open')).toBe(false)
	})

	// ─── Callbacks ──────────────────────────────────────────────────

	it('calls onopen when opening', async () => {
		const onopen = vi.fn()
		const { container } = render(FloatingAction, { items: basicItems, onopen })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		expect(onopen).toHaveBeenCalled()
	})

	it('calls onclose when closing', async () => {
		const onclose = vi.fn()
		const { container } = render(FloatingAction, { items: basicItems, onclose })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		expect(onclose).toHaveBeenCalled()
	})

	// ─── Position and Size ──────────────────────────────────────────

	it('defaults to bottom-right position', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const el = container.querySelector('[data-fab]')
		expect(el?.getAttribute('data-position')).toBe('bottom-right')
	})

	it('supports custom position', () => {
		const { container } = render(FloatingAction, { items: basicItems, position: 'top-left' })
		const el = container.querySelector('[data-fab]')
		expect(el?.getAttribute('data-position')).toBe('top-left')
	})

	it('defaults to md size', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const el = container.querySelector('[data-fab]')
		expect(el?.getAttribute('data-size')).toBe('md')
	})

	it('supports sm size', () => {
		const { container } = render(FloatingAction, { items: basicItems, size: 'sm' })
		const el = container.querySelector('[data-fab]')
		expect(el?.getAttribute('data-size')).toBe('sm')
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables the FAB', () => {
		const { container } = render(FloatingAction, { items: basicItems, disabled: true })
		const el = container.querySelector('[data-fab]')
		expect(el?.hasAttribute('data-disabled')).toBe(true)
		const trigger = container.querySelector('[data-fab-trigger]')
		expect(trigger?.hasAttribute('disabled')).toBe(true)
	})

	it('does not open when disabled', async () => {
		const { container } = render(FloatingAction, { items: basicItems, disabled: true })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		expect(container.querySelector('[data-fab-menu]')).toBeNull()
	})

	// ─── Keyboard ───────────────────────────────────────────────────

	it('opens on Enter key on trigger', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.keyDown(trigger, { key: 'Enter' })
		expect(container.querySelector('[data-fab-menu]')).toBeTruthy()
	})

	it('opens on Space key on trigger', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.keyDown(trigger, { key: ' ' })
		expect(container.querySelector('[data-fab-menu]')).toBeTruthy()
	})

	it('opens on ArrowDown key on trigger', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		const trigger = container.querySelector('[data-fab-trigger]')!
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
		expect(container.querySelector('[data-fab-menu]')).toBeTruthy()
	})

	// ─── Accessibility ──────────────────────────────────────────────

	it('menu has role="menu"', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		const menu = container.querySelector('[data-fab-menu]')
		expect(menu?.getAttribute('role')).toBe('menu')
	})

	it('menu has aria-label', async () => {
		const { container } = render(FloatingAction, { items: basicItems, label: 'Quick actions' })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		const menu = container.querySelector('[data-fab-menu]')
		expect(menu?.getAttribute('aria-label')).toBe('Quick actions')
	})

	// ─── Expand Direction ───────────────────────────────────────────

	it('defaults to vertical expand', () => {
		const { container } = render(FloatingAction, { items: basicItems })
		expect(container.querySelector('[data-fab]')?.getAttribute('data-expand')).toBe('vertical')
	})

	it('supports horizontal expand', () => {
		const { container } = render(FloatingAction, { items: basicItems, expand: 'horizontal' })
		expect(container.querySelector('[data-fab]')?.getAttribute('data-expand')).toBe('horizontal')
	})

	// ─── Backdrop ───────────────────────────────────────────────────

	it('renders backdrop when open', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		expect(container.querySelector('[data-fab-backdrop]')).toBeTruthy()
	})

	it('hides backdrop when backdrop prop is false', async () => {
		const { container } = render(FloatingAction, { items: basicItems, backdrop: false })
		await fireEvent.click(container.querySelector('[data-fab-trigger]')!)
		expect(container.querySelector('[data-fab-backdrop]')).toBeNull()
	})
})
