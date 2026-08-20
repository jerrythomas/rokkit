import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import FloatingAction from '../src/components/FloatingAction.svelte'
import FloatingActionSnippetTest from './FloatingActionSnippetTest.svelte'

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

	// ─── Keyboard navigation (handlers live on document while the menu is open) ──

	const openFab = async (props = {}) => {
		const res = render(FloatingAction, { items: basicItems, ...props })
		await fireEvent.click(res.container.querySelector('[data-fab-trigger]')!)
		return res
	}
	const itemsOf = (container: Element) =>
		[...container.querySelectorAll('[data-fab-item]:not([data-disabled])')] as HTMLElement[]

	it('ArrowDown from the trigger opens the menu', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		await fireEvent.keyDown(container.querySelector('[data-fab-trigger]')!, { key: 'ArrowDown' })
		expect(container.querySelector('[data-fab-menu]')).toBeTruthy()
	})

	it('ArrowUp from the trigger opens the menu', async () => {
		const { container } = render(FloatingAction, { items: basicItems })
		await fireEvent.keyDown(container.querySelector('[data-fab-trigger]')!, { key: 'ArrowUp' })
		expect(container.querySelector('[data-fab-menu]')).toBeTruthy()
	})

	it.each(['Enter', ' '])('%s on the trigger toggles the menu', async (key) => {
		const { container } = render(FloatingAction, { items: basicItems })
		await fireEvent.keyDown(container.querySelector('[data-fab-trigger]')!, { key })
		expect(container.querySelector('[data-fab-menu]')).toBeTruthy()
	})

	// Opening the menu already sets focusedIndex to 0, so the first ArrowDown lands on
	// item 1 rather than item 0.
	it('ArrowDown steps forward from the pre-focused first item', async () => {
		const { container } = await openFab()
		const items = itemsOf(container)
		await fireEvent.keyDown(document, { key: 'ArrowDown' })
		expect(document.activeElement).toBe(items[1])
		await fireEvent.keyDown(document, { key: 'ArrowDown' })
		expect(document.activeElement).toBe(items[2])
	})

	it('ArrowDown past the last item wraps to the first', async () => {
		const { container } = await openFab()
		const items = itemsOf(container)
		await fireEvent.keyDown(document, { key: 'End' })
		expect(document.activeElement).toBe(items[items.length - 1])
		await fireEvent.keyDown(document, { key: 'ArrowDown' })
		expect(document.activeElement).toBe(items[0])
	})

	it('ArrowUp from the first item wraps to the last', async () => {
		const { container } = await openFab()
		const items = itemsOf(container)
		await fireEvent.keyDown(document, { key: 'ArrowUp' })
		expect(document.activeElement).toBe(items[items.length - 1])
	})

	it('ArrowUp steps backwards', async () => {
		const { container } = await openFab()
		const items = itemsOf(container)
		await fireEvent.keyDown(document, { key: 'ArrowDown' })
		await fireEvent.keyDown(document, { key: 'ArrowUp' })
		expect(document.activeElement).toBe(items[0])
	})

	it('Home focuses the first item and End the last', async () => {
		const { container } = await openFab()
		const items = itemsOf(container)
		await fireEvent.keyDown(document, { key: 'End' })
		expect(document.activeElement).toBe(items[items.length - 1])
		await fireEvent.keyDown(document, { key: 'Home' })
		expect(document.activeElement).toBe(items[0])
	})

	it('an unhandled key leaves focus where it was', async () => {
		const { container } = await openFab()
		const items = itemsOf(container)
		await fireEvent.keyDown(document, { key: 'ArrowDown' })
		await fireEvent.keyDown(document, { key: 'x' })
		expect(document.activeElement).toBe(items[1])
	})

	it('Enter activates the focused item and closes the menu', async () => {
		const onselect = vi.fn()
		const { container } = await openFab({ onselect })
		await fireEvent.keyDown(document, { key: 'ArrowDown' })
		await fireEvent.keyDown(document, { key: 'Enter' })
		expect(onselect).toHaveBeenCalledWith('edit', basicItems[1])
		expect(container.querySelector('[data-fab-menu]')).toBeNull()
	})

	it('Enter activates the pre-focused first item straight after opening', async () => {
		const onselect = vi.fn()
		await openFab({ onselect })
		await fireEvent.keyDown(document, { key: 'Enter' })
		expect(onselect).toHaveBeenCalledWith('add', basicItems[0])
	})

	it('Escape closes the menu and restores focus to the trigger', async () => {
		const { container } = await openFab()
		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(container.querySelector('[data-fab-menu]')).toBeNull()
		expect(document.activeElement).toBe(container.querySelector('[data-fab-trigger]'))
	})

	it('keydown is ignored while the menu is closed', async () => {
		const onselect = vi.fn()
		render(FloatingAction, { items: basicItems, onselect })
		await fireEvent.keyDown(document, { key: 'ArrowDown' })
		expect(onselect).not.toHaveBeenCalled()
	})

	// ─── Item snippets ──────────────────────────────────────────────

	it('uses the default item snippet for plain items', async () => {
		const { container } = render(FloatingActionSnippetTest, { items: basicItems })
		expect(container.querySelectorAll('[data-default-item]').length).toBe(basicItems.length)
	})

	it('prefers a named snippet when the item names one', async () => {
		const items = [{ label: 'Fav', value: 'fav', snippet: 'starred' }, ...basicItems]
		const { container } = render(FloatingActionSnippetTest, { items })
		expect(container.querySelector('[data-named-item]')?.textContent).toContain('Fav')
		expect(container.querySelectorAll('[data-default-item]').length).toBe(basicItems.length)
	})

	it('falls back to the default snippet when the named one does not exist', async () => {
		const items = [{ label: 'Ghost', value: 'ghost', snippet: 'nope' }]
		const { container } = render(FloatingActionSnippetTest, { items })
		expect(container.querySelector('[data-named-item]')).toBeNull()
		expect(container.querySelector('[data-default-item]')?.textContent).toContain('Ghost')
	})

	it.each(['Enter', ' '])('%s on a snippet item selects it', async (key) => {
		const onselect = vi.fn()
		const { container } = render(FloatingActionSnippetTest, { items: basicItems, onselect })
		await fireEvent.keyDown(container.querySelector('[data-default-item]')!, { key })
		expect(onselect).toHaveBeenCalledWith('add', basicItems[0])
	})

	it('ignores unrelated keys on a snippet item', async () => {
		const onselect = vi.fn()
		const { container } = render(FloatingActionSnippetTest, { items: basicItems, onselect })
		await fireEvent.keyDown(container.querySelector('[data-default-item]')!, { key: 'x' })
		expect(onselect).not.toHaveBeenCalled()
	})
})
