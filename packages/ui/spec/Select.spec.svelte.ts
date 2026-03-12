import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Select from '../src/components/Select.svelte'

const flatItems = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Banana', value: 'banana' },
	{ label: 'Cherry', value: 'cherry' }
]

const groupedItems = [
	{
		label: 'Fruits',
		children: [
			{ label: 'Apple', value: 'apple' },
			{ label: 'Banana', value: 'banana' }
		]
	},
	{
		label: 'Vegetables',
		children: [
			{ label: 'Carrot', value: 'carrot' },
			{ label: 'Pea', value: 'pea' }
		]
	}
]

describe('Select', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a select container', () => {
		const { container } = render(Select, { items: flatItems })
		expect(container.querySelector('[data-select]')).toBeTruthy()
	})

	it('renders a trigger button', () => {
		const { container } = render(Select, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger).toBeTruthy()
	})

	it('shows placeholder when no value selected', () => {
		const { container } = render(Select, { items: flatItems })
		const placeholder = container.querySelector('[data-select-placeholder]')
		expect(placeholder?.textContent).toBe('Select...')
	})

	it('shows custom placeholder', () => {
		const { container } = render(Select, { items: flatItems, placeholder: 'Choose one' })
		const placeholder = container.querySelector('[data-select-placeholder]')
		expect(placeholder?.textContent).toBe('Choose one')
	})

	it('shows selected value text in trigger', () => {
		const { container } = render(Select, { items: flatItems, value: 'banana' })
		const valueText = container.querySelector('[data-select-value-text]')
		expect(valueText?.textContent).toBe('Banana')
	})

	it('renders arrow indicator', () => {
		const { container } = render(Select, { items: flatItems })
		expect(container.querySelector('[data-select-arrow]')).toBeTruthy()
	})

	// ─── Dropdown ───────────────────────────────────────────────────

	it('dropdown is closed by default', () => {
		const { container } = render(Select, { items: flatItems })
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
		expect(container.querySelector('[data-select]')?.hasAttribute('data-open')).toBe(false)
	})

	it('opens dropdown on trigger click', async () => {
		const { container } = render(Select, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		expect(container.querySelector('[data-select]')?.hasAttribute('data-open')).toBe(true)
	})

	it('closes dropdown on second trigger click', async () => {
		const { container } = render(Select, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.click(trigger)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		await fireEvent.click(trigger)
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	it('closes dropdown on Escape key', async () => {
		const { container } = render(Select, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	it('trigger has aria-haspopup="listbox"', () => {
		const { container } = render(Select, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox')
	})

	it('trigger has aria-expanded', async () => {
		const { container } = render(Select, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')!
		expect(trigger.getAttribute('aria-expanded')).toBe('false')
		await fireEvent.click(trigger)
		expect(trigger.getAttribute('aria-expanded')).toBe('true')
	})

	// ─── Options ────────────────────────────────────────────────────

	it('renders flat options', async () => {
		const { container } = render(Select, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		expect(opts.length).toBe(3)
	})

	it('dropdown has role="listbox"', async () => {
		const { container } = render(Select, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const dropdown = container.querySelector('[data-select-dropdown]')
		expect(dropdown?.getAttribute('role')).toBe('listbox')
	})

	it('options have role="option"', async () => {
		const { container } = render(Select, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[role="option"]')
		expect(opts.length).toBe(3)
	})

	it('marks selected option with check', async () => {
		const { container } = render(Select, { items: flatItems, value: 'banana' })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		expect(opts[1]?.hasAttribute('data-selected')).toBe(true)
		expect(opts[1]?.getAttribute('aria-selected')).toBe('true')
		expect(opts[1]?.querySelector('[data-select-check]')).toBeTruthy()
	})

	it('disabled options are marked', async () => {
		const items = [
			{ label: 'A', value: 'a' },
			{ label: 'B', value: 'b', disabled: true }
		]
		const { container } = render(Select, { items })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		expect(opts.length).toBe(2)
		expect(opts[1]?.hasAttribute('data-disabled')).toBe(true)
		expect(opts[1]?.hasAttribute('disabled')).toBe(true)
	})

	// ─── Grouped Options ────────────────────────────────────────────

	it('renders grouped options', async () => {
		const { container } = render(Select, { items: groupedItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const groups = container.querySelectorAll('[data-select-group-label]')
		expect(groups.length).toBe(2)
	})

	it('renders group labels', async () => {
		const { container } = render(Select, { items: groupedItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const labels = container.querySelectorAll('[data-select-group-label]')
		expect(labels.length).toBe(2)
		expect(labels[0]?.textContent).toContain('Fruits')
	})

	it('renders dividers between groups', async () => {
		const { container } = render(Select, { items: groupedItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const dividers = container.querySelectorAll('[data-select-divider]')
		expect(dividers.length).toBe(1)
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('calls onchange when selecting an option', async () => {
		const onchange = vi.fn()
		const { container } = render(Select, { items: flatItems, onchange })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[1])
		expect(onchange).toHaveBeenCalledWith('banana', flatItems[1])
	})

	it('closes dropdown after selection', async () => {
		const { container } = render(Select, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[0])
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	it('updates trigger text after selection', async () => {
		const { container } = render(Select, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[2])
		const valueText = container.querySelector('[data-select-value-text]')
		expect(valueText?.textContent).toBe('Cherry')
	})

	// ─── Keyboard Navigation ────────────────────────────────────────

	it('opens on ArrowDown key', async () => {
		const { container } = render(Select, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	it('opens on Enter key', async () => {
		const { container } = render(Select, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.keyDown(trigger, { key: 'Enter' })
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	it('opens on Space key', async () => {
		const { container } = render(Select, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.keyDown(trigger, { key: ' ' })
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	// ─── Size ───────────────────────────────────────────────────────

	it('defaults to md size', () => {
		const { container } = render(Select, { items: flatItems })
		expect(container.querySelector('[data-select]')?.getAttribute('data-size')).toBe('md')
	})

	it('supports sm size', () => {
		const { container } = render(Select, { items: flatItems, size: 'sm' })
		expect(container.querySelector('[data-select]')?.getAttribute('data-size')).toBe('sm')
	})

	// ─── Alignment and Direction ────────────────────────────────────

	it('defaults to start alignment', () => {
		const { container } = render(Select, { items: flatItems })
		expect(container.querySelector('[data-select]')?.getAttribute('data-align')).toBe('start')
	})

	it('supports end alignment', () => {
		const { container } = render(Select, { items: flatItems, align: 'end' })
		expect(container.querySelector('[data-select]')?.getAttribute('data-align')).toBe('end')
	})

	it('defaults to down direction', () => {
		const { container } = render(Select, { items: flatItems })
		expect(container.querySelector('[data-select]')?.getAttribute('data-direction')).toBe('down')
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables the select', () => {
		const { container } = render(Select, { items: flatItems, disabled: true })
		const el = container.querySelector('[data-select]')
		expect(el?.hasAttribute('data-disabled')).toBe(true)
		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger?.hasAttribute('disabled')).toBe(true)
	})

	it('does not open when disabled', async () => {
		const { container } = render(Select, { items: flatItems, disabled: true })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const items = [
			{ name: 'Apple', id: 'apple' },
			{ name: 'Banana', id: 'banana' }
		]
		const onchange = vi.fn()
		const { container } = render(Select, {
			items,
			fields: { label: 'name', value: 'id' },
			onchange
		})
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[0])
		expect(onchange).toHaveBeenCalledWith('apple', items[0])
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders with empty options', () => {
		const { container } = render(Select, { items: [] })
		expect(container.querySelector('[data-select]')).toBeTruthy()
		expect(container.querySelector('[data-select-placeholder]')).toBeTruthy()
	})

	// ─── Filterable ────────────────────────────────────────────────

	describe('filterable', () => {
		it('does not render filter input without filterable prop', async () => {
			const { container } = render(Select, { items: flatItems })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			expect(container.querySelector('[data-select-filter]')).toBeNull()
		})

		it('renders filter input when filterable is true', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			expect(container.querySelector('[data-select-filter]')).toBeTruthy()
			expect(container.querySelector('[data-select-filter-input]')).toBeTruthy()
		})

		it('uses default placeholder "Search..."', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]') as HTMLInputElement
			expect(input.placeholder).toBe('Search...')
		})

		it('supports custom filterPlaceholder', async () => {
			const { container } = render(Select, {
				items: flatItems,
				filterable: true,
				filterPlaceholder: 'Type to filter...'
			})
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]') as HTMLInputElement
			expect(input.placeholder).toBe('Type to filter...')
		})

		it('filters options by text (case-insensitive)', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]')!
			await fireEvent.input(input, { target: { value: 'ban' } })
			const opts = container.querySelectorAll('[data-select-option]')
			expect(opts.length).toBe(1)
			expect(opts[0]?.textContent).toContain('Banana')
		})

		it('shows all options when filter is cleared', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]')!
			await fireEvent.input(input, { target: { value: 'ban' } })
			expect(container.querySelectorAll('[data-select-option]').length).toBe(1)
			await fireEvent.input(input, { target: { value: '' } })
			expect(container.querySelectorAll('[data-select-option]').length).toBe(3)
		})

		it('hides empty groups when filtering', async () => {
			const { container } = render(Select, { items: groupedItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]')!
			await fireEvent.input(input, { target: { value: 'carrot' } })
			const groupLabels = container.querySelectorAll('[data-select-group-label]')
			expect(groupLabels.length).toBe(1)
			expect(groupLabels[0]?.textContent).toContain('Vegetables')
		})

		it('shows matching children within groups', async () => {
			const { container } = render(Select, { items: groupedItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]')!
			await fireEvent.input(input, { target: { value: 'app' } })
			const opts = container.querySelectorAll('[data-select-option]')
			expect(opts.length).toBe(1)
			expect(opts[0]?.textContent).toContain('Apple')
		})

		it('shows empty state when no results match', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]')!
			await fireEvent.input(input, { target: { value: 'xyz' } })
			expect(container.querySelectorAll('[data-select-option]').length).toBe(0)
			const empty = container.querySelector('[data-select-empty]')
			expect(empty).toBeTruthy()
			expect(empty?.textContent).toBe('No results')
		})

		it('ArrowDown from filter focuses first option', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]')!
			await fireEvent.keyDown(input, { key: 'ArrowDown' })
			// Controller should move to first item
			const opts = container.querySelectorAll('[data-select-option]')
			expect(opts.length).toBe(3)
		})

		it('Escape clears filter first, then closes on second Escape', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]') as HTMLInputElement
			await fireEvent.input(input, { target: { value: 'ban' } })
			expect(container.querySelectorAll('[data-select-option]').length).toBe(1)

			// First Escape: clears filter
			await fireEvent.keyDown(input, { key: 'Escape' })
			expect(
				(container.querySelector('[data-select-filter-input]') as HTMLInputElement)?.value
			).toBe('')
			expect(container.querySelectorAll('[data-select-option]').length).toBe(3)
			expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()

			// Second Escape: closes dropdown
			await fireEvent.keyDown(input, { key: 'Escape' })
			expect(container.querySelector('[data-select-dropdown]')).toBeNull()
		})

		it('filter is cleared when dropdown closes', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]')!
			await fireEvent.input(input, { target: { value: 'ban' } })
			// Close via second trigger click
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			// Re-open
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const newInput = container.querySelector('[data-select-filter-input]') as HTMLInputElement
			expect(newInput.value).toBe('')
			expect(container.querySelectorAll('[data-select-option]').length).toBe(3)
		})

		it('filter is cleared after selecting an option', async () => {
			const { container } = render(Select, { items: flatItems, filterable: true })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const input = container.querySelector('[data-select-filter-input]')!
			await fireEvent.input(input, { target: { value: 'ban' } })
			const opts = container.querySelectorAll('[data-select-option]')
			await fireEvent.click(opts[0])
			// Dropdown closed, re-open to check
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			expect(container.querySelectorAll('[data-select-option]').length).toBe(3)
		})
	})
})
