import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import Dropdown from '../src/components/Dropdown.svelte'

const items = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Banana', value: 'banana' },
	{ label: 'Cherry', value: 'cherry', disabled: true }
]

async function openDropdown(container: HTMLElement) {
	const trigger = container.querySelector('[data-dropdown-trigger]')!
	await fireEvent.click(trigger)
	await waitFor(() => {
		expect(container.querySelector('[data-dropdown-panel]')).toBeTruthy()
	})
}

describe('Dropdown', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders root element', () => {
		const { container } = render(Dropdown, { items })
		expect(container.querySelector('[data-dropdown]')).toBeTruthy()
	})

	it('renders trigger button', () => {
		const { container } = render(Dropdown, { items })
		const trigger = container.querySelector('[data-dropdown-trigger]')
		expect(trigger).toBeTruthy()
		expect(trigger?.tagName).toBe('BUTTON')
	})

	it('renders placeholder when no value selected', () => {
		const { container } = render(Dropdown, { items, placeholder: 'Pick one' })
		const label = container.querySelector('[data-dropdown-label]')
		expect(label?.textContent).toBe('Pick one')
	})

	it('renders selected label when value is set', () => {
		const { container } = render(Dropdown, { items, value: 'banana' })
		const label = container.querySelector('[data-dropdown-label]')
		expect(label?.textContent).toBe('Banana')
	})

	it('renders icon when provided', () => {
		const { container } = render(Dropdown, { items, icon: 'i-star' })
		const icon = container.querySelector('[data-dropdown-icon]')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('i-star')).toBe(true)
	})

	it('does not render icon when not provided', () => {
		const { container } = render(Dropdown, { items })
		expect(container.querySelector('[data-dropdown-icon]')).toBeNull()
	})

	it('renders arrow by default', () => {
		const { container } = render(Dropdown, { items })
		expect(container.querySelector('[data-dropdown-arrow]')).toBeTruthy()
	})

	it('hides arrow when showArrow is false', () => {
		const { container } = render(Dropdown, { items, showArrow: false })
		expect(container.querySelector('[data-dropdown-arrow]')).toBeNull()
	})

	it('panel is hidden by default', () => {
		const { container } = render(Dropdown, { items })
		expect(container.querySelector('[data-dropdown-panel]')).toBeNull()
	})

	// ─── Open / Close ───────────────────────────────────────────────

	it('opens panel on trigger click', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		expect(container.querySelector('[data-dropdown-panel]')).toBeTruthy()
		expect(container.querySelector('[data-dropdown]')?.hasAttribute('data-open')).toBe(true)
	})

	it('closes panel on second trigger click', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const trigger = container.querySelector('[data-dropdown-trigger]')!
		await fireEvent.click(trigger)
		await waitFor(() => {
			expect(container.querySelector('[data-dropdown-panel]')).toBeNull()
		})
	})

	// ─── Options ────────────────────────────────────────────────────

	it('renders all items in panel', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const options = container.querySelectorAll('[data-dropdown-option]')
		expect(options.length).toBe(3)
	})

	it('renders item labels', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const labels = container.querySelectorAll('[data-dropdown-option-label]')
		expect(labels[0]?.textContent).toBe('Apple')
		expect(labels[1]?.textContent).toBe('Banana')
	})

	it('renders items with data-path', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const options = container.querySelectorAll('[data-dropdown-option]')
		expect(options[0]?.getAttribute('data-path')).toBe('0')
		expect(options[1]?.getAttribute('data-path')).toBe('1')
	})

	it('renders items with role="option"', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const options = container.querySelectorAll('[role="option"]')
		expect(options.length).toBe(3)
	})

	// ─── Disabled Items ─────────────────────────────────────────────

	it('marks disabled items with data-disabled', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const options = container.querySelectorAll('[data-dropdown-option]')
		expect(options[2]?.hasAttribute('data-disabled')).toBe(true)
		expect((options[2] as HTMLButtonElement).disabled).toBe(true)
	})

	it('does not call onchange for disabled items', async () => {
		const onchange = vi.fn()
		const { container } = render(Dropdown, { items, onchange })
		await openDropdown(container)
		const options = container.querySelectorAll('[data-dropdown-option]')
		await fireEvent.click(options[2])
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onchange when item is clicked', async () => {
		const onchange = vi.fn()
		const { container } = render(Dropdown, { items, onchange })
		await openDropdown(container)
		const options = container.querySelectorAll('[data-dropdown-option]')
		await fireEvent.click(options[0])
		expect(onchange).toHaveBeenCalledWith('apple', expect.anything())
	})

	it('closes panel after selection', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const options = container.querySelectorAll('[data-dropdown-option]')
		await fireEvent.click(options[0])
		await waitFor(() => {
			expect(container.querySelector('[data-dropdown-panel]')).toBeNull()
		})
	})

	it('marks selected option with data-active', async () => {
		const { container } = render(Dropdown, { items, value: 'apple' })
		await openDropdown(container)
		const options = container.querySelectorAll('[data-dropdown-option]')
		expect(options[0]?.hasAttribute('data-active')).toBe(true)
		expect(options[1]?.hasAttribute('data-active')).toBe(false)
	})

	it('selected option has aria-selected=true', async () => {
		const { container } = render(Dropdown, { items, value: 'banana' })
		await openDropdown(container)
		const options = container.querySelectorAll('[data-dropdown-option]')
		expect(options[1]?.getAttribute('aria-selected')).toBe('true')
		expect(options[0]?.getAttribute('aria-selected')).toBe('false')
	})

	// ─── Field Mapping ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const customItems = [
			{ name: 'Active', id: 'active' },
			{ name: 'Paused', id: 'paused' }
		]
		const onchange = vi.fn()
		const { container } = render(Dropdown, {
			items: customItems,
			fields: { label: 'name', value: 'id' },
			onchange
		})
		await openDropdown(container)
		const labels = container.querySelectorAll('[data-dropdown-option-label]')
		expect(labels[0]?.textContent).toBe('Active')
		const options = container.querySelectorAll('[data-dropdown-option]')
		await fireEvent.click(options[1])
		expect(onchange).toHaveBeenCalledWith('paused', expect.anything())
	})

	it('shows remapped label in trigger after selection', () => {
		const customItems = [{ name: 'Active', id: 'active' }]
		const { container } = render(Dropdown, {
			items: customItems,
			fields: { label: 'name', value: 'id' },
			value: 'active'
		})
		const label = container.querySelector('[data-dropdown-label]')
		expect(label?.textContent).toBe('Active')
	})

	// ─── Separators ─────────────────────────────────────────────────

	it('renders separators', async () => {
		const itemsWithSep = [{ label: 'A', value: 'a' }, { type: 'separator' }, { label: 'B', value: 'b' }]
		const { container } = render(Dropdown, { items: itemsWithSep })
		await openDropdown(container)
		expect(container.querySelector('[data-dropdown-separator]')).toBeTruthy()
	})

	// ─── Sizes ──────────────────────────────────────────────────────

	it('renders with md size by default', () => {
		const { container } = render(Dropdown, { items })
		expect(container.querySelector('[data-dropdown]')?.getAttribute('data-size')).toBe('md')
	})

	it('renders with sm size', () => {
		const { container } = render(Dropdown, { items, size: 'sm' })
		expect(container.querySelector('[data-dropdown]')?.getAttribute('data-size')).toBe('sm')
	})

	it('renders with lg size', () => {
		const { container } = render(Dropdown, { items, size: 'lg' })
		expect(container.querySelector('[data-dropdown]')?.getAttribute('data-size')).toBe('lg')
	})

	// ─── Alignment & Direction ──────────────────────────────────────

	it('defaults to start alignment', () => {
		const { container } = render(Dropdown, { items })
		expect(container.querySelector('[data-dropdown]')?.getAttribute('data-align')).toBe('start')
	})

	it('supports end alignment', () => {
		const { container } = render(Dropdown, { items, align: 'end' })
		expect(container.querySelector('[data-dropdown]')?.getAttribute('data-align')).toBe('end')
	})

	it('defaults to down direction', () => {
		const { container } = render(Dropdown, { items })
		expect(container.querySelector('[data-dropdown]')?.getAttribute('data-direction')).toBe('down')
	})

	it('supports up direction', () => {
		const { container } = render(Dropdown, { items, direction: 'up' })
		expect(container.querySelector('[data-dropdown]')?.getAttribute('data-direction')).toBe('up')
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables entire dropdown', () => {
		const { container } = render(Dropdown, { items, disabled: true })
		expect(container.querySelector('[data-dropdown]')?.hasAttribute('data-disabled')).toBe(true)
		const trigger = container.querySelector('[data-dropdown-trigger]') as HTMLButtonElement
		expect(trigger.disabled).toBe(true)
	})

	// ─── Accessibility ──────────────────────────────────────────────

	it('trigger has aria-haspopup="listbox"', () => {
		const { container } = render(Dropdown, { items })
		const trigger = container.querySelector('[data-dropdown-trigger]')
		expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox')
	})

	it('trigger has aria-expanded=false when closed', () => {
		const { container } = render(Dropdown, { items })
		const trigger = container.querySelector('[data-dropdown-trigger]')
		expect(trigger?.getAttribute('aria-expanded')).toBe('false')
	})

	it('trigger has aria-expanded=true when open', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const trigger = container.querySelector('[data-dropdown-trigger]')
		expect(trigger?.getAttribute('aria-expanded')).toBe('true')
	})

	it('panel has role="listbox"', async () => {
		const { container } = render(Dropdown, { items })
		await openDropdown(container)
		const panel = container.querySelector('[data-dropdown-panel]')
		expect(panel?.getAttribute('role')).toBe('listbox')
	})

	// ─── Custom Class ───────────────────────────────────────────────

	it('applies custom class to root', () => {
		const { container } = render(Dropdown, { items, class: 'my-dropdown' })
		expect(container.querySelector('[data-dropdown]')?.classList.contains('my-dropdown')).toBe(true)
	})
})
