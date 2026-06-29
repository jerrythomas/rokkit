import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import MultiSelect from '../src/components/MultiSelect.svelte'
import MultiSelectSnippetTest from './MultiSelectSnippetTest.svelte'

const flatItems = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Banana', value: 'banana' },
	{ label: 'Cherry', value: 'cherry' },
	{ label: 'Date', value: 'date' },
	{ label: 'Elderberry', value: 'elderberry' }
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

describe('MultiSelect', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a multiselect container', () => {
		const { container } = render(MultiSelect, { items: flatItems })
		const el = container.querySelector('[data-multiselect]')
		expect(el).toBeTruthy()
	})

	it('renders a trigger button', () => {
		const { container } = render(MultiSelect, { items: flatItems })
		expect(container.querySelector('[data-select-trigger]')).toBeTruthy()
	})

	it('shows placeholder when nothing selected', () => {
		const { container } = render(MultiSelect, { items: flatItems })
		expect(container.querySelector('[data-select-placeholder]')?.textContent).toBe('Select an option')
	})

	it('shows custom placeholder', () => {
		const { container } = render(MultiSelect, { items: flatItems, placeholder: 'Pick items' })
		expect(container.querySelector('[data-select-placeholder]')?.textContent).toBe('Pick items')
	})

	// ─── Dropdown ───────────────────────────────────────────────────

	it('dropdown is closed by default', () => {
		const { container } = render(MultiSelect, { items: flatItems })
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	it('opens dropdown on trigger click', async () => {
		const { container } = render(MultiSelect, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	it('dropdown has aria-multiselectable', async () => {
		const { container } = render(MultiSelect, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const dropdown = container.querySelector('[data-select-dropdown]')
		expect(dropdown?.getAttribute('aria-multiselectable')).toBe('true')
	})

	it('closes on Escape', async () => {
		const { container } = render(MultiSelect, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(container.querySelector('[data-select-dropdown]')).toBeNull()
	})

	// ─── Multi-Selection ────────────────────────────────────────────

	it('shows checkbox indicators on options', async () => {
		const { container } = render(MultiSelect, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const checkboxes = container.querySelectorAll('[data-select-checkbox]')
		expect(checkboxes.length).toBe(5)
	})

	it('toggles selection on click', async () => {
		const onchange = vi.fn()
		const { container } = render(MultiSelect, { items: flatItems, onchange })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[0])
		expect(onchange).toHaveBeenCalledWith(['apple'], [flatItems[0]])
	})

	it('marks selected options', async () => {
		const { container } = render(MultiSelect, {
			items: flatItems,
			value: ['banana']
		})
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		expect(opts[1]?.hasAttribute('data-selected')).toBe(true)
		expect(opts[0]?.hasAttribute('data-selected')).toBe(false)
	})

	it('deselects on second click', async () => {
		const onchange = vi.fn()
		const { container } = render(MultiSelect, {
			items: flatItems,
			value: ['apple'],
			onchange
		})
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[0])
		expect(onchange).toHaveBeenCalledWith([], [])
	})

	it('dropdown stays open after selection', async () => {
		const { container } = render(MultiSelect, { items: flatItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[0])
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	it('calls onchange with extracted values and full items', async () => {
		const onchange = vi.fn()
		const { container } = render(MultiSelect, {
			items: flatItems,
			value: ['apple'],
			onchange
		})
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[2])
		expect(onchange).toHaveBeenCalledWith(['apple', 'cherry'], [flatItems[0], flatItems[2]])
	})

	// ─── Tags Display ───────────────────────────────────────────────

	it('displays selected items as tags', () => {
		const { container } = render(MultiSelect, {
			items: flatItems,
			value: ['apple', 'banana']
		})
		const tags = container.querySelectorAll('[data-select-tag]')
		expect(tags.length).toBe(2)
	})

	it('displays tag text', () => {
		const { container } = render(MultiSelect, {
			items: flatItems,
			value: ['apple']
		})
		const tagText = container.querySelector('[data-select-tag-text]')
		expect(tagText?.textContent).toBe('Apple')
	})

	it('shows count when exceeding maxDisplay', () => {
		const { container } = render(MultiSelect, {
			items: flatItems,
			value: ['apple', 'banana', 'cherry', 'date'],
			maxDisplay: 3
		})
		const count = container.querySelector('[data-select-count]')
		expect(count?.textContent).toContain('4 selected')
	})

	it('shows tags when within maxDisplay', () => {
		const { container } = render(MultiSelect, {
			items: flatItems,
			value: ['apple', 'banana'],
			maxDisplay: 3
		})
		const tags = container.querySelectorAll('[data-select-tag]')
		expect(tags.length).toBe(2)
		expect(container.querySelector('[data-select-count]')).toBeNull()
	})

	it('tag remove button removes item', async () => {
		const onchange = vi.fn()
		const { container } = render(MultiSelect, {
			items: flatItems,
			value: ['apple', 'banana'],
			onchange
		})
		const removeBtn = container.querySelector('[data-select-tag-remove]')!
		await fireEvent.click(removeBtn)
		expect(onchange).toHaveBeenCalledWith(['banana'], [flatItems[1]])
	})

	// ─── Grouped Options ────────────────────────────────────────────

	it('renders grouped options', async () => {
		const { container } = render(MultiSelect, { items: groupedItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const groups = container.querySelectorAll('[data-select-group-label]')
		expect(groups.length).toBe(2)
	})

	it('renders group labels', async () => {
		const { container } = render(MultiSelect, { items: groupedItems })
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const labels = container.querySelectorAll('[data-select-group-label]')
		expect(labels.length).toBe(2)
		expect(labels[0]?.textContent).toContain('Fruits')
	})

	// ─── Keyboard ───────────────────────────────────────────────────

	it('opens on ArrowDown', async () => {
		const { container } = render(MultiSelect, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	it('opens on Enter', async () => {
		const { container } = render(MultiSelect, { items: flatItems })
		const trigger = container.querySelector('[data-select-trigger]')!
		await fireEvent.keyDown(trigger, { key: 'Enter' })
		expect(container.querySelector('[data-select-dropdown]')).toBeTruthy()
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables the multiselect', () => {
		const { container } = render(MultiSelect, { items: flatItems, disabled: true })
		const el = container.querySelector('[data-multiselect]')
		expect(el?.hasAttribute('data-disabled')).toBe(true)
	})

	it('does not open when disabled', async () => {
		const { container } = render(MultiSelect, { items: flatItems, disabled: true })
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
		const { container } = render(MultiSelect, {
			items,
			fields: { label: 'name', value: 'id' },
			onchange
		})
		await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		const opts = container.querySelectorAll('[data-select-option]')
		await fireEvent.click(opts[0])
		expect(onchange).toHaveBeenCalledWith(['apple'], [items[0]])
	})

	// ─── Size ───────────────────────────────────────────────────────

	it('defaults to md size', () => {
		const { container } = render(MultiSelect, { items: flatItems })
		expect(container.querySelector('[data-multiselect]')?.getAttribute('data-size')).toBe('md')
	})

	// ─── Empty ──────────────────────────────────────────────────────

	it('renders with empty options', () => {
		const { container } = render(MultiSelect, { items: [] })
		expect(container.querySelector('[data-multiselect]')).toBeTruthy()
		expect(container.querySelector('[data-select-placeholder]')).toBeTruthy()
	})

	// ─── Named snippet resolution (item.snippet) ────────────────────

	describe('named snippet resolution', () => {
		const snippetItems = [
			{
				label: 'Observatory',
				snippet: 'header',
				children: [
					{ label: 'Telescopes', value: 'telescopes' }
				]
			},
			{
				label: 'Settings',
				children: [
					{ label: 'General', value: 'general' }
				]
			},
			{ label: 'Pinned Item', value: 'pinned-item', snippet: 'pinned' },
			{ label: 'Regular Item', value: 'regular-item' }
		]

		async function openDropdown(container: HTMLElement) {
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
		}

		it('routes a group with item.snippet to the named snippet (over groupContent)', async () => {
			const { container } = render(MultiSelectSnippetTest, { items: snippetItems })
			await openDropdown(container)
			expect(container.querySelector('[data-named-group]')?.textContent).toContain(
				'Observatory: Observatory'
			)
		})

		it('routes a leaf with item.snippet to the named snippet (over itemContent)', async () => {
			const { container } = render(MultiSelectSnippetTest, { items: snippetItems })
			await openDropdown(container)
			expect(container.querySelector('[data-named-item]')?.textContent).toContain(
				'Pinned: Pinned Item'
			)
		})

		it('falls back to groupContent for a group without item.snippet', async () => {
			const { container } = render(MultiSelectSnippetTest, { items: snippetItems })
			await openDropdown(container)
			const groups = [...container.querySelectorAll('[data-default-group]')].map(
				(n) => n.textContent
			)
			expect(groups.some((t) => t?.includes('Group: Settings'))).toBe(true)
			expect(groups.some((t) => t?.includes('Group: Observatory'))).toBe(false)
		})

		it('falls back to itemContent for a leaf without item.snippet', async () => {
			const { container } = render(MultiSelectSnippetTest, { items: snippetItems })
			await openDropdown(container)
			const leaves = [...container.querySelectorAll('[data-default-item]')].map(
				(n) => n.textContent
			)
			expect(leaves.some((t) => t?.includes('Item: Regular Item'))).toBe(true)
			expect(leaves.some((t) => t?.includes('Item: Pinned Item'))).toBe(false)
		})
	})

	// ─── Separators ─────────────────────────────────────────────────

	describe('separators', () => {
		it('renders data-select-separator for type:"separator" items', async () => {
			const itemsWithSep = [
				{ label: 'Apple', value: 'apple' },
				{ type: 'separator' },
				{ label: 'Banana', value: 'banana' }
			]
			const { container } = render(MultiSelect, { items: itemsWithSep })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const separators = container.querySelectorAll('[data-select-separator]')
			expect(separators.length).toBe(1)
		})

		it('separator is an <hr> element', async () => {
			const itemsWithSep = [
				{ label: 'Apple', value: 'apple' },
				{ type: 'separator' },
				{ label: 'Banana', value: 'banana' }
			]
			const { container } = render(MultiSelect, { items: itemsWithSep })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const sep = container.querySelector('[data-select-separator]')
			expect(sep?.tagName.toLowerCase()).toBe('hr')
		})

		it('surrounding options still render alongside separator', async () => {
			const itemsWithSep = [
				{ label: 'Apple', value: 'apple' },
				{ type: 'separator' },
				{ label: 'Banana', value: 'banana' }
			]
			const { container } = render(MultiSelect, { items: itemsWithSep })
			await fireEvent.click(container.querySelector('[data-select-trigger]')!)
			const opts = container.querySelectorAll('[data-select-option]')
			expect(opts.length).toBe(2)
		})
	})
})
