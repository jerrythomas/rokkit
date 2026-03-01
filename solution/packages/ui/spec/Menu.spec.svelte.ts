import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import Menu from '../src/components/Menu.svelte'
import MenuSnippetTest from './MenuSnippetTest.svelte'

const flatItems = [
	{ text: 'Copy', icon: 'i-copy', value: 'copy' },
	{ text: 'Paste', icon: 'i-paste', value: 'paste' },
	{ text: 'Cut', value: 'cut' },
	{ text: 'Delete', value: 'delete', disabled: true }
]

const groupedItems = [
	{
		text: 'File',
		icon: 'i-file',
		children: [
			{ text: 'New', value: 'new' },
			{ text: 'Open', value: 'open' }
		]
	},
	{
		text: 'Edit',
		children: [
			{ text: 'Undo', value: 'undo' },
			{ text: 'Redo', value: 'redo' }
		]
	}
]

async function openMenu(container: HTMLElement) {
	const trigger = container.querySelector('[data-menu-trigger]')!
	await fireEvent.click(trigger)
	await waitFor(() => {
		expect(container.querySelector('[data-menu-dropdown]')).toBeTruthy()
	})
}

describe('Menu', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a menu container', () => {
		const { container } = render(Menu, { items: flatItems })
		expect(container.querySelector('[data-menu]')).toBeTruthy()
	})

	it('renders trigger button', () => {
		const { container } = render(Menu, { items: flatItems })
		const trigger = container.querySelector('[data-menu-trigger]')
		expect(trigger).toBeTruthy()
		expect(trigger?.tagName).toBe('BUTTON')
	})

	it('renders trigger label', () => {
		const { container } = render(Menu, { items: flatItems, label: 'Actions' })
		const label = container.querySelector('[data-menu-label]')
		expect(label?.textContent).toBe('Actions')
	})

	it('renders trigger icon when provided', () => {
		const { container } = render(Menu, { items: flatItems, icon: 'i-dots' })
		const icon = container.querySelector('[data-menu-icon]')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('i-dots')).toBe(true)
	})

	it('renders trigger arrow by default', () => {
		const { container } = render(Menu, { items: flatItems })
		expect(container.querySelector('[data-menu-arrow]')).toBeTruthy()
	})

	it('hides trigger arrow when showArrow is false', () => {
		const { container } = render(Menu, { items: flatItems, showArrow: false })
		expect(container.querySelector('[data-menu-arrow]')).toBeNull()
	})

	it('dropdown is hidden by default', () => {
		const { container } = render(Menu, { items: flatItems })
		expect(container.querySelector('[data-menu-dropdown]')).toBeNull()
	})

	// ─── Open / Close ───────────────────────────────────────────────

	it('opens dropdown on trigger click', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		expect(container.querySelector('[data-menu-dropdown]')).toBeTruthy()
		expect(container.querySelector('[data-menu]')?.hasAttribute('data-open')).toBe(true)
	})

	it('closes dropdown on second trigger click', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const trigger = container.querySelector('[data-menu-trigger]')!
		await fireEvent.click(trigger)
		await waitFor(() => {
			expect(container.querySelector('[data-menu-dropdown]')).toBeNull()
		})
	})

	it('opens on Enter key', async () => {
		const { container } = render(Menu, { items: flatItems })
		const trigger = container.querySelector('[data-menu-trigger]') as HTMLElement
		trigger.focus()
		await fireEvent.keyDown(trigger, { key: 'Enter' })
		await waitFor(() => {
			expect(container.querySelector('[data-menu-dropdown]')).toBeTruthy()
		})
	})

	it('opens on Space key', async () => {
		const { container } = render(Menu, { items: flatItems })
		const trigger = container.querySelector('[data-menu-trigger]') as HTMLElement
		trigger.focus()
		await fireEvent.keyDown(trigger, { key: ' ' })
		await waitFor(() => {
			expect(container.querySelector('[data-menu-dropdown]')).toBeTruthy()
		})
	})

	it('opens on ArrowDown key', async () => {
		const { container } = render(Menu, { items: flatItems })
		const trigger = container.querySelector('[data-menu-trigger]') as HTMLElement
		trigger.focus()
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
		await waitFor(() => {
			expect(container.querySelector('[data-menu-dropdown]')).toBeTruthy()
		})
	})

	it('opens on ArrowUp key', async () => {
		const { container } = render(Menu, { items: flatItems })
		const trigger = container.querySelector('[data-menu-trigger]') as HTMLElement
		trigger.focus()
		await fireEvent.keyDown(trigger, { key: 'ArrowUp' })
		await waitFor(() => {
			expect(container.querySelector('[data-menu-dropdown]')).toBeTruthy()
		})
	})

	// ─── Flat Items ─────────────────────────────────────────────────

	it('renders all flat items in dropdown', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const items = container.querySelectorAll('[data-menu-item]')
		expect(items.length).toBe(4)
	})

	it('renders item text', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const texts = container.querySelectorAll('[data-item-label]')
		expect(texts[0]?.textContent).toBe('Copy')
		expect(texts[1]?.textContent).toBe('Paste')
	})

	it('renders item icons', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const icons = container.querySelectorAll('[data-item-icon]')
		expect(icons.length).toBe(2) // only Copy and Paste have icons
		expect(icons[0]?.classList.contains('i-copy')).toBe(true)
	})

	it('renders items with data-path', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const items = container.querySelectorAll('[data-menu-item]')
		expect(items[0]?.getAttribute('data-path')).toBe('0')
		expect(items[1]?.getAttribute('data-path')).toBe('1')
	})

	it('renders items with role="menuitem"', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const menuitems = container.querySelectorAll('[role="menuitem"]')
		expect(menuitems.length).toBe(4)
	})

	// ─── Disabled Items ─────────────────────────────────────────────

	it('marks disabled items', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const items = container.querySelectorAll('[data-menu-item]')
		expect(items[3]?.hasAttribute('data-disabled')).toBe(true)
		expect((items[3] as HTMLButtonElement).disabled).toBe(true)
	})

	it('does not call onselect for disabled items', async () => {
		const onselect = vi.fn()
		const { container } = render(Menu, { items: flatItems, onselect })
		await openMenu(container)
		const items = container.querySelectorAll('[data-menu-item]')
		await fireEvent.click(items[3])
		expect(onselect).not.toHaveBeenCalled()
	})

	// ─── Grouped Items ──────────────────────────────────────────────

	it('renders groups as flatView nodes', async () => {
		const { container } = render(Menu, { items: groupedItems })
		await openMenu(container)
		const groups = container.querySelectorAll('[data-menu-group]')
		expect(groups.length).toBe(2)
	})

	it('renders group text', async () => {
		const { container } = render(Menu, { items: groupedItems })
		await openMenu(container)
		const groupTexts = container.querySelectorAll('[data-menu-group-text]')
		expect(groupTexts[0]?.textContent).toBe('File')
		expect(groupTexts[1]?.textContent).toBe('Edit')
	})

	it('renders children when groups are expanded', async () => {
		const { container } = render(Menu, { items: groupedItems, collapsible: true })
		await openMenu(container)
		// Groups start collapsed in collapsible mode — click to expand
		const groups = container.querySelectorAll('[data-menu-group]')
		await fireEvent.click(groups[0])
		await waitFor(() => {
			const items = container.querySelectorAll('[data-menu-item]')
			expect(items.length).toBeGreaterThanOrEqual(2)
		})
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onselect when item is clicked', async () => {
		const onselect = vi.fn()
		const { container } = render(Menu, { items: flatItems, onselect })
		await openMenu(container)
		const items = container.querySelectorAll('[data-menu-item]')
		await fireEvent.click(items[0])
		expect(onselect).toHaveBeenCalledWith('copy', expect.anything())
	})

	it('closes dropdown after selection', async () => {
		const onselect = vi.fn()
		const { container } = render(Menu, { items: flatItems, onselect })
		await openMenu(container)
		const items = container.querySelectorAll('[data-menu-item]')
		await fireEvent.click(items[1])
		await waitFor(() => {
			expect(container.querySelector('[data-menu-dropdown]')).toBeNull()
		})
	})

	it('returns focus to trigger after selection', async () => {
		const onselect = vi.fn()
		const { container } = render(Menu, { items: flatItems, onselect })
		await openMenu(container)
		const items = container.querySelectorAll('[data-menu-item]')
		await fireEvent.click(items[0])
		await waitFor(() => {
			const trigger = container.querySelector('[data-menu-trigger]')
			expect(document.activeElement).toBe(trigger)
		})
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const items = [
			{ name: 'Save', id: 'save' },
			{ name: 'Load', id: 'load' }
		]
		const onselect = vi.fn()
		const { container } = render(Menu, {
			items,
			fields: { text: 'name', value: 'id' },
			onselect
		})
		await openMenu(container)
		const texts = container.querySelectorAll('[data-item-label]')
		expect(texts[0]?.textContent).toBe('Save')
		const menuItems = container.querySelectorAll('[data-menu-item]')
		await fireEvent.click(menuItems[1])
		expect(onselect).toHaveBeenCalledWith('load', expect.anything())
	})

	// ─── Separators ─────────────────────────────────────────────────

	it('renders separators', async () => {
		const items = [
			{ text: 'Cut', value: 'cut' },
			{ type: 'separator' },
			{ text: 'Paste', value: 'paste' }
		]
		const { container } = render(Menu, { items })
		await openMenu(container)
		const seps = container.querySelectorAll('[data-menu-separator]')
		expect(seps.length).toBe(1)
	})

	// ─── Sizes ──────────────────────────────────────────────────────

	it('renders with default md size', () => {
		const { container } = render(Menu, { items: flatItems })
		const el = container.querySelector('[data-menu]')
		expect(el?.getAttribute('data-size')).toBe('md')
	})

	it('renders with sm size', () => {
		const { container } = render(Menu, { items: flatItems, size: 'sm' })
		const el = container.querySelector('[data-menu]')
		expect(el?.getAttribute('data-size')).toBe('sm')
	})

	it('renders with lg size', () => {
		const { container } = render(Menu, { items: flatItems, size: 'lg' })
		const el = container.querySelector('[data-menu]')
		expect(el?.getAttribute('data-size')).toBe('lg')
	})

	// ─── Alignment and Direction ────────────────────────────────────

	it('defaults to start alignment', () => {
		const { container } = render(Menu, { items: flatItems })
		const el = container.querySelector('[data-menu]')
		expect(el?.getAttribute('data-align')).toBe('start')
	})

	it('supports end alignment', () => {
		const { container } = render(Menu, { items: flatItems, align: 'end' })
		const el = container.querySelector('[data-menu]')
		expect(el?.getAttribute('data-align')).toBe('end')
	})

	it('defaults to down direction', () => {
		const { container } = render(Menu, { items: flatItems })
		const el = container.querySelector('[data-menu]')
		expect(el?.getAttribute('data-direction')).toBe('down')
	})

	it('supports up direction', () => {
		const { container } = render(Menu, { items: flatItems, direction: 'up' })
		const el = container.querySelector('[data-menu]')
		expect(el?.getAttribute('data-direction')).toBe('up')
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables entire menu', () => {
		const { container } = render(Menu, { items: flatItems, disabled: true })
		const el = container.querySelector('[data-menu]')
		expect(el?.hasAttribute('data-disabled')).toBe(true)
		const trigger = container.querySelector('[data-menu-trigger]') as HTMLButtonElement
		expect(trigger.disabled).toBe(true)
	})

	it('does not open when disabled', async () => {
		const { container } = render(Menu, { items: flatItems, disabled: true })
		const trigger = container.querySelector('[data-menu-trigger]')!
		await fireEvent.click(trigger)
		expect(container.querySelector('[data-menu-dropdown]')).toBeNull()
	})

	// ─── Accessibility ──────────────────────────────────────────────

	it('trigger has aria-haspopup="menu"', () => {
		const { container } = render(Menu, { items: flatItems })
		const trigger = container.querySelector('[data-menu-trigger]')
		expect(trigger?.getAttribute('aria-haspopup')).toBe('menu')
	})

	it('trigger has aria-expanded=false when closed', () => {
		const { container } = render(Menu, { items: flatItems })
		const trigger = container.querySelector('[data-menu-trigger]')
		expect(trigger?.getAttribute('aria-expanded')).toBe('false')
	})

	it('trigger has aria-expanded=true when open', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const trigger = container.querySelector('[data-menu-trigger]')
		expect(trigger?.getAttribute('aria-expanded')).toBe('true')
	})

	it('trigger has aria-label', () => {
		const { container } = render(Menu, { items: flatItems, label: 'Actions' })
		const trigger = container.querySelector('[data-menu-trigger]')
		expect(trigger?.getAttribute('aria-label')).toBe('Actions')
	})

	it('dropdown has role="menu"', async () => {
		const { container } = render(Menu, { items: flatItems })
		await openMenu(container)
		const dropdown = container.querySelector('[data-menu-dropdown]')
		expect(dropdown?.getAttribute('role')).toBe('menu')
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class', () => {
		const { container } = render(Menu, { items: flatItems, class: 'my-menu' })
		const el = container.querySelector('[data-menu]')
		expect(el?.classList.contains('my-menu')).toBe(true)
	})

	// ─── Custom Snippets ────────────────────────────────────────────

	it('renders custom item snippet', async () => {
		const { container } = render(MenuSnippetTest, { items: flatItems })
		await openMenu(container)
		const custom = container.querySelectorAll('[data-custom-item]')
		expect(custom.length).toBe(4)
		expect(custom[0]?.textContent?.trim()).toContain('Custom: Copy')
	})

	it('renders custom group snippet', async () => {
		const { container } = render(MenuSnippetTest, { items: groupedItems })
		await openMenu(container)
		const custom = container.querySelectorAll('[data-custom-group]')
		expect(custom.length).toBe(2)
		expect(custom[0]?.textContent?.trim()).toContain('Group: File')
	})

	it('custom snippet handles click', async () => {
		const onselect = vi.fn()
		const { container } = render(MenuSnippetTest, { items: flatItems, onselect })
		await openMenu(container)
		const custom = container.querySelectorAll('[data-custom-item]')
		await fireEvent.click(custom[1])
		expect(onselect).toHaveBeenCalledWith('paste', expect.anything())
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty dropdown with no items', async () => {
		const { container } = render(Menu, { items: [] })
		await openMenu(container)
		const dropdown = container.querySelector('[data-menu-dropdown]')
		expect(dropdown).toBeTruthy()
		expect(container.querySelectorAll('[data-menu-item]').length).toBe(0)
	})
})
