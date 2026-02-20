import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Select from '../src/components/Select.svelte'

const flatOptions = [
	{ text: 'Apple', value: 'apple' },
	{ text: 'Banana', value: 'banana' },
	{ text: 'Cherry', value: 'cherry' }
]

const groupedOptions = [
	{
		text: 'Fruits',
		children: [
			{ text: 'Apple', value: 'apple' },
			{ text: 'Banana', value: 'banana' }
		]
	},
	{
		text: 'Vegetables',
		children: [
			{ text: 'Carrot', value: 'carrot' },
			{ text: 'Pea', value: 'pea' }
		]
	}
]

describe('Select', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a select container', () => {
		const { container } = render(Select, { options: flatOptions })
		expect(container.querySelector('[data-select]')).toBeTruthy()
	})

	it('renders a trigger button', () => {
		const { container } = render(Select, { options: flatOptions })
		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger).toBeTruthy()
	})

	it('shows placeholder when no value selected', () => {
		const { container } = render(Select, { options: flatOptions })
		const placeholder = container.querySelector('[data-select-placeholder]')
		expect(placeholder?.textContent).toBe('Select...')
	})

	it('shows custom placeholder', () => {
		const { container } = render(Select, { options: flatOptions, placeholder: 'Choose one' })
		const placeholder = container.querySelector('[data-select-placeholder]')
		expect(placeholder?.textContent).toBe('Choose one')
	})

	it('shows selected value text in trigger', () => {
		const { container } = render(Select, { options: flatOptions, value: 'banana' })
		const valueText = container.querySelector('[data-select-value-text]')
		expect(valueText?.textContent).toBe('Banana')
	})

	it('renders arrow indicator', () => {
		const { container } = render(Select, { options: flatOptions })
		expect(container.querySelector('[data-select-arrow]')).toBeTruthy()
	})

	// ─── Dropdown ───────────────────────────────────────────────────

	it('dropdown is closed by default', () => {
		const { container } = render(Select, { options: flatOptions })
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
		expect(container.querySelector('[data-select]')?.hasAttribute('data-open')).toBe(false)
	})

	it('opens dropdown on trigger click', async () => {
		const { container } = render(Select, { options: flatOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		expect(container.querySelector('[data-select]')?.hasAttribute('data-open')).toBe(true)
	})

	it('closes dropdown on second trigger click', async () => {
		const { container } = render(Select, { options: flatOptions })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.click(trigger)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		await fireEvent.click(trigger)
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	it('closes dropdown on Escape key', async () => {
		const { container } = render(Select, { options: flatOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	it('trigger has aria-haspopup="listbox"', () => {
		const { container } = render(Select, { options: flatOptions })
		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox')
	})

	it('trigger has aria-expanded', async () => {
		const { container } = render(Select, { options: flatOptions })
		const trigger = container.querySelector('[data-select-trigger]')!
		expect(trigger.getAttribute('aria-expanded')).toBe('false')
		await fireEvent.click(trigger)
		expect(trigger.getAttribute('aria-expanded')).toBe('true')
	})

	// ─── Options ────────────────────────────────────────────────────

	it('renders flat options', async () => {
		const { container } = render(Select, { options: flatOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		expect(opts.length).toBe(3)
	})

	it('dropdown has role="listbox"', async () => {
		const { container } = render(Select, { options: flatOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const dropdown = container.querySelector('[data-select-dropdown]')
		expect(dropdown?.getAttribute('role')).toBe('listbox')
	})

	it('options have role="option"', async () => {
		const { container } = render(Select, { options: flatOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[role="option"]')
		expect(opts.length).toBe(3)
	})

	it('marks selected option with check', async () => {
		const { container } = render(Select, { options: flatOptions, value: 'banana' })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		expect(opts[1]?.hasAttribute('data-selected')).toBe(true)
		expect(opts[1]?.getAttribute('aria-selected')).toBe('true')
		expect(opts[1]?.querySelector('[data-select-check]')).toBeTruthy()
	})

	it('disabled options are marked', async () => {
		const options = [
			{ text: 'A', value: 'a' },
			{ text: 'B', value: 'b', disabled: true }
		]
		const { container } = render(Select, { options })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		expect(opts.length).toBe(2)
		expect(opts[1]?.hasAttribute('data-disabled')).toBe(true)
		expect(opts[1]?.hasAttribute('disabled')).toBe(true)
	})

	// ─── Grouped Options ────────────────────────────────────────────

	it('renders grouped options', async () => {
		const { container } = render(Select, { options: groupedOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const groups = container.querySelectorAll('[data-select-group]')
		expect(groups.length).toBe(2)
	})

	it('renders group labels', async () => {
		const { container } = render(Select, { options: groupedOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const labels = container.querySelectorAll('[data-select-group-label]')
		expect(labels.length).toBe(2)
		expect(labels[0]?.textContent).toContain('Fruits')
	})

	it('renders dividers between groups', async () => {
		const { container } = render(Select, { options: groupedOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const dividers = container.querySelectorAll('[data-select-divider]')
		expect(dividers.length).toBe(1)
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onchange when selecting an option', async () => {
		const onchange = vi.fn()
		const { container } = render(Select, { options: flatOptions, onchange })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[1])
		expect(onchange).toHaveBeenCalledWith('banana', flatOptions[1])
	})

	it('closes dropdown after selection', async () => {
		const { container } = render(Select, { options: flatOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[0])
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	it('updates trigger text after selection', async () => {
		const { container } = render(Select, { options: flatOptions })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[2])
		const valueText = container.querySelector('[data-select-value-text]')
		expect(valueText?.textContent).toBe('Cherry')
	})

	// ─── Keyboard Navigation ────────────────────────────────────────

	it('opens on ArrowDown key', async () => {
		const { container } = render(Select, { options: flatOptions })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	it('opens on Enter key', async () => {
		const { container } = render(Select, { options: flatOptions })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.keyDown(trigger, { key: 'Enter' })
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	it('opens on Space key', async () => {
		const { container } = render(Select, { options: flatOptions })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.keyDown(trigger, { key: ' ' })
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	// ─── Size ───────────────────────────────────────────────────────

	it('defaults to md size', () => {
		const { container } = render(Select, { options: flatOptions })
		expect(container.querySelector('[data-select]')?.getAttribute('data-size')).toBe('md')
	})

	it('supports sm size', () => {
		const { container } = render(Select, { options: flatOptions, size: 'sm' })
		expect(container.querySelector('[data-select]')?.getAttribute('data-size')).toBe('sm')
	})

	// ─── Alignment and Direction ────────────────────────────────────

	it('defaults to left alignment', () => {
		const { container } = render(Select, { options: flatOptions })
		expect(container.querySelector('[data-select]')?.getAttribute('data-align')).toBe('left')
	})

	it('supports right alignment', () => {
		const { container } = render(Select, { options: flatOptions, align: 'right' })
		expect(container.querySelector('[data-select]')?.getAttribute('data-align')).toBe('right')
	})

	it('defaults to down direction', () => {
		const { container } = render(Select, { options: flatOptions })
		expect(container.querySelector('[data-select]')?.getAttribute('data-direction')).toBe('down')
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables the select', () => {
		const { container } = render(Select, { options: flatOptions, disabled: true })
		const el = container.querySelector('[data-select]')
		expect(el?.hasAttribute('data-disabled')).toBe(true)
		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger?.hasAttribute('disabled')).toBe(true)
	})

	it('does not open when disabled', async () => {
		const { container } = render(Select, { options: flatOptions, disabled: true })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const options = [
			{ name: 'Apple', id: 'apple' },
			{ name: 'Banana', id: 'banana' }
		]
		const onchange = vi.fn()
		const { container } = render(Select, {
			options,
			fields: { text: 'name', value: 'id' },
			onchange
		})
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[0])
		expect(onchange).toHaveBeenCalledWith('apple', options[0])
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders with empty options', () => {
		const { container } = render(Select, { options: [] })
		expect(container.querySelector('[data-select]')).toBeTruthy()
		expect(container.querySelector('[data-select-placeholder]')).toBeTruthy()
	})
})
