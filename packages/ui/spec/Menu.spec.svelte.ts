import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Menu from '../src/components/Menu.svelte'
import MenuSnippetTest from './MenuSnippetTest.svelte'
import type { MenuFields, MenuItem } from '../src/types/menu.js'

// Sample flat options for testing
const flatOptions: MenuItem[] = [
	{ text: 'Copy', icon: 'i-solar:copy-bold', value: 'copy' },
	{ text: 'Paste', icon: 'i-solar:clipboard-bold', value: 'paste' },
	{ text: 'Cut', icon: 'i-solar:scissors-bold', value: 'cut' },
	{ text: 'Delete', icon: 'i-solar:trash-bold', value: 'delete', disabled: true }
]

// Sample grouped options for testing
const groupedOptions: MenuItem[] = [
	{
		text: 'Image',
		icon: 'i-solar:gallery-bold',
		children: [
			{
				text: 'Export as PNG',
				description: 'High-quality image',
				icon: 'i-solar:gallery-bold',
				value: 'png'
			},
			{
				text: 'Export as SVG',
				description: 'Vector graphics',
				icon: 'i-solar:code-bold',
				value: 'svg'
			}
		]
	},
	{
		text: 'Data',
		icon: 'i-solar:database-bold',
		children: [
			{
				text: 'Export as CSV',
				description: 'Spreadsheet format',
				icon: 'i-solar:table-bold',
				value: 'csv'
			},
			{
				text: 'Export as JSON',
				description: 'Configuration file',
				icon: 'i-solar:settings-bold',
				value: 'json'
			}
		]
	}
]

// Sample mixed options (standalone items and groups)
const mixedOptions: MenuItem[] = [
	{ text: 'Quick Save', icon: 'i-solar:diskette-bold', value: 'save' },
	{
		text: 'Export As',
		children: [
			{ text: 'PNG', value: 'png' },
			{ text: 'SVG', value: 'svg' }
		]
	},
	{ text: 'Settings', icon: 'i-solar:settings-bold', value: 'settings' }
]

// Sample data with custom field names
const customData: MenuItem[] = [
	{
		title: 'File',
		actions: [
			{ title: 'New', shortcut: 'Ctrl+N', actionId: 'new' },
			{ title: 'Open', shortcut: 'Ctrl+O', actionId: 'open' }
		]
	}
]

const customFields: MenuFields = {
	text: 'title',
	value: 'actionId',
	description: 'shortcut',
	children: 'actions'
}

describe('Menu', () => {
	describe('rendering', () => {
		it('renders with correct data attributes', () => {
			const { container } = render(Menu)

			const menu = container.querySelector('[data-menu]')
			expect(menu).toBeInTheDocument()
		})

		it('has aria-label for accessibility', () => {
			const { container } = render(Menu)

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('aria-label', 'Menu')
		})

		it('renders trigger button', () => {
			const { container } = render(Menu)

			const trigger = container.querySelector('[data-menu-trigger]')
			expect(trigger).toBeInTheDocument()
		})

		it('renders default label', () => {
			const { container } = render(Menu)

			const label = container.querySelector('[data-menu-label]')
			expect(label?.textContent).toBe('Menu')
		})

		it('renders custom label', () => {
			const { container } = render(Menu, {
				props: { label: 'Actions' }
			})

			const label = container.querySelector('[data-menu-label]')
			expect(label?.textContent).toBe('Actions')
		})

		it('renders icon when provided', () => {
			const { container } = render(Menu, {
				props: { icon: 'i-solar:menu-dots-bold' }
			})

			const icon = container.querySelector('[data-menu-icon]')
			expect(icon).toBeInTheDocument()
			expect(icon).toHaveClass('i-solar:menu-dots-bold')
		})

		it('does not render icon when not provided', () => {
			const { container } = render(Menu)

			const icon = container.querySelector('[data-menu-icon]')
			expect(icon).not.toBeInTheDocument()
		})

		it('renders arrow by default', () => {
			const { container } = render(Menu)

			const arrow = container.querySelector('[data-menu-arrow]')
			expect(arrow).toBeInTheDocument()
		})

		it('does not render arrow when showArrow is false', () => {
			const { container } = render(Menu, {
				props: { showArrow: false }
			})

			const arrow = container.querySelector('[data-menu-arrow]')
			expect(arrow).not.toBeInTheDocument()
		})
	})

	describe('dropdown behavior', () => {
		it('dropdown is initially closed', () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const dropdown = container.querySelector('[data-menu-dropdown]')
			expect(dropdown).not.toBeInTheDocument()
		})

		it('opens dropdown on trigger click', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const dropdown = container.querySelector('[data-menu-dropdown]')
			expect(dropdown).toBeInTheDocument()
		})

		it('closes dropdown on second trigger click', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)
			await fireEvent.click(trigger!)

			const dropdown = container.querySelector('[data-menu-dropdown]')
			expect(dropdown).not.toBeInTheDocument()
		})

		it('closes dropdown on Escape key', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			await fireEvent.keyDown(document, { key: 'Escape' })

			const dropdown = container.querySelector('[data-menu-dropdown]')
			expect(dropdown).not.toBeInTheDocument()
		})

		it('sets data-open attribute when open', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const menu = container.querySelector('[data-menu]')
			// When closed, data-open attribute is not present (undefined)
			expect(menu).not.toHaveAttribute('data-open')

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			// When open, data-open='true'
			expect(menu).toHaveAttribute('data-open', 'true')
		})

		it('arrow is present when menu is open', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			// Arrow rotation is handled by CSS via [data-open] on parent
			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-open', 'true')

			const arrow = container.querySelector('[data-menu-arrow]')
			expect(arrow).toBeInTheDocument()
		})
	})

	describe('flat options', () => {
		it('renders all flat options', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			expect(items).toHaveLength(4)
		})

		it('renders item labels correctly', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const labels = container.querySelectorAll('[data-menu-item-label]')
			expect(labels[0]?.textContent).toBe('Copy')
			expect(labels[1]?.textContent).toBe('Paste')
		})

		it('renders item icons', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const icons = container.querySelectorAll('[data-menu-item-icon]')
			expect(icons).toHaveLength(4)
			expect(icons[0]).toHaveClass('i-solar:copy-bold')
		})

		it('marks disabled items', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			const disabledItem = items[3]
			expect(disabledItem).toHaveAttribute('disabled')
			expect(disabledItem).toHaveAttribute('data-disabled', 'true')
		})
	})

	describe('grouped options', () => {
		it('renders groups', async () => {
			const { container } = render(Menu, {
				props: { options: groupedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const groups = container.querySelectorAll('[data-menu-group]')
			expect(groups).toHaveLength(2)
		})

		it('renders group labels', async () => {
			const { container } = render(Menu, {
				props: { options: groupedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const groupLabels = container.querySelectorAll('[data-menu-group-label]')
			expect(groupLabels[0]?.textContent?.trim()).toContain('Image')
			expect(groupLabels[1]?.textContent?.trim()).toContain('Data')
		})

		it('renders children within groups', async () => {
			const { container } = render(Menu, {
				props: { options: groupedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			// 2 items in Image group + 2 items in Data group = 4 total
			expect(items).toHaveLength(4)
		})

		it('renders divider between groups', async () => {
			const { container } = render(Menu, {
				props: { options: groupedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const dividers = container.querySelectorAll('[data-menu-divider]')
			// Divider before second group only
			expect(dividers).toHaveLength(1)
		})

		it('does not render divider before first group', async () => {
			const { container } = render(Menu, {
				props: { options: groupedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const dropdown = container.querySelector('[data-menu-dropdown]')
			const firstChild = dropdown?.firstElementChild
			expect(firstChild).not.toHaveAttribute('data-menu-divider')
		})

		it('renders item descriptions', async () => {
			const { container } = render(Menu, {
				props: { options: groupedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const descriptions = container.querySelectorAll('[data-menu-item-description]')
			expect(descriptions).toHaveLength(4)
			expect(descriptions[0]?.textContent).toBe('High-quality image')
		})
	})

	describe('mixed options', () => {
		it('renders both standalone items and groups', async () => {
			const { container } = render(Menu, {
				props: { options: mixedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const groups = container.querySelectorAll('[data-menu-group]')
			expect(groups).toHaveLength(1) // Only "Export As" is a group

			const allItems = container.querySelectorAll('[data-menu-item]')
			// Quick Save + Settings (standalone) + 2 in Export As group = 4
			expect(allItems).toHaveLength(4)
		})
	})

	describe('custom fields', () => {
		it('uses custom text field', async () => {
			const { container } = render(Menu, {
				props: { options: customData, fields: customFields }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const groupLabel = container.querySelector('[data-menu-group-label]')
			expect(groupLabel?.textContent?.trim()).toContain('File')
		})

		it('uses custom children field', async () => {
			const { container } = render(Menu, {
				props: { options: customData, fields: customFields }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			expect(items).toHaveLength(2) // New and Open
		})

		it('uses custom description field', async () => {
			const { container } = render(Menu, {
				props: { options: customData, fields: customFields }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const descriptions = container.querySelectorAll('[data-menu-item-description]')
			expect(descriptions[0]?.textContent).toBe('Ctrl+N')
		})
	})

	describe('selection', () => {
		it('calls onselect with value when item clicked', async () => {
			const onselect = vi.fn()
			const { container } = render(Menu, {
				props: { options: flatOptions, onselect }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			await fireEvent.click(items[0]!)

			expect(onselect).toHaveBeenCalledTimes(1)
			expect(onselect).toHaveBeenCalledWith('copy', expect.objectContaining({ text: 'Copy' }))
		})

		it('calls onselect with correct value for grouped items', async () => {
			const onselect = vi.fn()
			const { container } = render(Menu, {
				props: { options: groupedOptions, onselect }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			await fireEvent.click(items[0]!)

			expect(onselect).toHaveBeenCalledWith(
				'png',
				expect.objectContaining({ text: 'Export as PNG' })
			)
		})

		it('calls onselect with custom value field', async () => {
			const onselect = vi.fn()
			const { container } = render(Menu, {
				props: { options: customData, fields: customFields, onselect }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			await fireEvent.click(items[0]!)

			expect(onselect).toHaveBeenCalledWith('new', expect.objectContaining({ title: 'New' }))
		})

		it('closes menu after selection', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			await fireEvent.click(items[0]!)

			const dropdown = container.querySelector('[data-menu-dropdown]')
			expect(dropdown).not.toBeInTheDocument()
		})

		it('does not call onselect for disabled items', async () => {
			const onselect = vi.fn()
			const { container } = render(Menu, {
				props: { options: flatOptions, onselect }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			// Last item (Delete) is disabled
			await fireEvent.click(items[3]!)

			expect(onselect).not.toHaveBeenCalled()
		})
	})

	describe('keyboard navigation', () => {
		it('selects item on Enter key', async () => {
			const onselect = vi.fn()
			const { container } = render(Menu, {
				props: { options: flatOptions, onselect }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			await fireEvent.keyDown(items[0]!, { key: 'Enter' })

			expect(onselect).toHaveBeenCalledWith('copy', expect.objectContaining({ text: 'Copy' }))
		})

		it('selects item on Space key', async () => {
			const onselect = vi.fn()
			const { container } = render(Menu, {
				props: { options: flatOptions, onselect }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			await fireEvent.keyDown(items[0]!, { key: ' ' })

			expect(onselect).toHaveBeenCalledWith('copy', expect.objectContaining({ text: 'Copy' }))
		})
	})

	describe('sizes', () => {
		it('applies sm size data attribute', () => {
			const { container } = render(Menu, {
				props: { size: 'sm' }
			})

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-size', 'sm')
		})

		it('applies md size data attribute', () => {
			const { container } = render(Menu, {
				props: { size: 'md' }
			})

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-size', 'md')
		})

		it('applies lg size data attribute', () => {
			const { container } = render(Menu, {
				props: { size: 'lg' }
			})

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-size', 'lg')
		})
	})

	describe('alignment', () => {
		it('sets left alignment by default', () => {
			const { container } = render(Menu)

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-align', 'left')
		})

		it('sets right alignment', () => {
			const { container } = render(Menu, {
				props: { align: 'right' }
			})

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-align', 'right')
		})

		it('normalizes start to left', () => {
			const { container } = render(Menu, {
				props: { align: 'start' }
			})

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-align', 'left')
		})

		it('normalizes end to right', () => {
			const { container } = render(Menu, {
				props: { align: 'end' }
			})

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-align', 'right')
		})
	})

	describe('disabled state', () => {
		it('sets disabled data attribute', () => {
			const { container } = render(Menu, {
				props: { disabled: true }
			})

			const menu = container.querySelector('[data-menu]')
			expect(menu).toHaveAttribute('data-disabled', 'true')
		})

		it('disables trigger button', () => {
			const { container } = render(Menu, {
				props: { disabled: true }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			expect(trigger).toHaveAttribute('disabled')
		})

		it('does not open when disabled', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions, disabled: true }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const dropdown = container.querySelector('[data-menu-dropdown]')
			expect(dropdown).not.toBeInTheDocument()
		})
	})

	describe('accessibility', () => {
		it('trigger has aria-haspopup="menu"', () => {
			const { container } = render(Menu)

			const trigger = container.querySelector('[data-menu-trigger]')
			expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
		})

		it('trigger has aria-expanded', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			expect(trigger).toHaveAttribute('aria-expanded', 'false')

			await fireEvent.click(trigger!)

			expect(trigger).toHaveAttribute('aria-expanded', 'true')
		})

		it('trigger has aria-label', () => {
			const { container } = render(Menu, {
				props: { label: 'Actions' }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			expect(trigger).toHaveAttribute('aria-label', 'Actions')
		})

		it('dropdown has role="menu"', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const dropdown = container.querySelector('[data-menu-dropdown]')
			expect(dropdown).toHaveAttribute('role', 'menu')
		})

		it('items have role="menuitem"', async () => {
			const { container } = render(Menu, {
				props: { options: flatOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			items.forEach((item) => {
				expect(item).toHaveAttribute('role', 'menuitem')
			})
		})

		it('dividers have role="separator"', async () => {
			const { container } = render(Menu, {
				props: { options: groupedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const dividers = container.querySelectorAll('[data-menu-divider]')
			dividers.forEach((divider) => {
				expect(divider).toHaveAttribute('role', 'separator')
			})
		})

		it('group labels have role="presentation"', async () => {
			const { container } = render(Menu, {
				props: { options: groupedOptions }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const groupLabels = container.querySelectorAll('[data-menu-group-label]')
			groupLabels.forEach((label) => {
				expect(label).toHaveAttribute('role', 'presentation')
			})
		})
	})

	describe('field fallbacks', () => {
		it('falls back to label field for text', async () => {
			const options = [{ label: 'Test Label', value: 'test' }]
			const { container } = render(Menu, {
				props: { options }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const itemLabel = container.querySelector('[data-menu-item-label]')
			expect(itemLabel?.textContent).toBe('Test Label')
		})

		it('falls back to id field for value', async () => {
			const options = [{ text: 'Test', id: 'test-id' }]
			const onselect = vi.fn()
			const { container } = render(Menu, {
				props: { options, onselect }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const items = container.querySelectorAll('[data-menu-item]')
			await fireEvent.click(items[0]!)

			expect(onselect).toHaveBeenCalledWith('test-id', expect.anything())
		})
	})

	describe('empty state', () => {
		it('renders empty dropdown when no options', async () => {
			const { container } = render(Menu, {
				props: { options: [] }
			})

			const trigger = container.querySelector('[data-menu-trigger]')
			await fireEvent.click(trigger!)

			const dropdown = container.querySelector('[data-menu-dropdown]')
			expect(dropdown).toBeInTheDocument()

			const items = container.querySelectorAll('[data-menu-item]')
			expect(items).toHaveLength(0)
		})
	})

	describe('custom snippets', () => {
		describe('item snippet', () => {
			it('renders custom item snippet for flat options', async () => {
				const { container } = render(MenuSnippetTest, {
					props: {
						options: flatOptions,
						useItemSnippet: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				const customItems = container.querySelectorAll('[data-custom-item]')
				expect(customItems).toHaveLength(4)
				expect(customItems[0]?.textContent).toContain('Custom: Copy')
			})

			it('renders custom item snippet for grouped children', async () => {
				const { container } = render(MenuSnippetTest, {
					props: {
						options: groupedOptions,
						useItemSnippet: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				const customItems = container.querySelectorAll('[data-custom-item]')
				expect(customItems).toHaveLength(4) // 4 children total in grouped options
				expect(customItems[0]?.textContent).toContain('Custom: Export as PNG')
			})

			it('calls onselect when custom item is clicked', async () => {
				const onselect = vi.fn()
				const { container } = render(MenuSnippetTest, {
					props: {
						options: flatOptions,
						useItemSnippet: true,
						onselect
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				const customItems = container.querySelectorAll('[data-custom-item]')
				await fireEvent.click(customItems[0]!)

				expect(onselect).toHaveBeenCalledWith('copy', expect.objectContaining({ text: 'Copy' }))
			})

			it('handles keyboard events in custom item', async () => {
				const onselect = vi.fn()
				const { container } = render(MenuSnippetTest, {
					props: {
						options: flatOptions,
						useItemSnippet: true,
						onselect
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				const customItems = container.querySelectorAll('[data-custom-item]')
				await fireEvent.keyDown(customItems[0]!, { key: 'Enter' })

				expect(onselect).toHaveBeenCalledWith('copy', expect.objectContaining({ text: 'Copy' }))
			})
		})

		describe('groupLabel snippet', () => {
			it('renders custom group label snippet', async () => {
				const { container } = render(MenuSnippetTest, {
					props: {
						options: groupedOptions,
						useGroupLabelSnippet: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				const customGroupLabels = container.querySelectorAll('[data-custom-group-label]')
				expect(customGroupLabels).toHaveLength(2)
				expect(customGroupLabels[0]?.textContent).toContain('Group: Image')
				expect(customGroupLabels[1]?.textContent).toContain('Group: Data')
			})

			it('still uses default item rendering with custom group label', async () => {
				const { container } = render(MenuSnippetTest, {
					props: {
						options: groupedOptions,
						useGroupLabelSnippet: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				// Should have custom group labels
				const customGroupLabels = container.querySelectorAll('[data-custom-group-label]')
				expect(customGroupLabels).toHaveLength(2)

				// But default menu items
				const defaultItems = container.querySelectorAll('[data-menu-item]')
				expect(defaultItems).toHaveLength(4)
			})
		})

		describe('combined snippets', () => {
			it('renders both custom item and group label snippets', async () => {
				const { container } = render(MenuSnippetTest, {
					props: {
						options: groupedOptions,
						useItemSnippet: true,
						useGroupLabelSnippet: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				const customItems = container.querySelectorAll('[data-custom-item]')
				const customGroupLabels = container.querySelectorAll('[data-custom-group-label]')

				expect(customItems).toHaveLength(4)
				expect(customGroupLabels).toHaveLength(2)
			})
		})

		describe('per-item snippet override', () => {
			it('uses named snippet for items with snippet field', async () => {
				const optionsWithSnippet: MenuItem[] = [
					{ text: 'Normal Item', value: 'normal' },
					{ text: 'Premium Feature', value: 'premium', snippet: 'premium' },
					{ text: 'Special Offer', value: 'special', snippet: 'special' }
				]

				const { container } = render(MenuSnippetTest, {
					props: {
						options: optionsWithSnippet,
						useNamedSnippets: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				// All items have data-menu-item (default item directly, custom items wrapped)
				const allItems = container.querySelectorAll('[data-menu-item]')
				expect(allItems).toHaveLength(3)

				// Normal item should use default rendering (not wrapped with data-menu-item-custom)
				const defaultItems = container.querySelectorAll(
					'[data-menu-item]:not([data-menu-item-custom])'
				)
				expect(defaultItems).toHaveLength(1)

				// Premium item should use premium snippet
				const premiumItems = container.querySelectorAll('[data-premium-item]')
				expect(premiumItems).toHaveLength(1)
				expect(premiumItems[0]?.textContent).toContain('🔒 Premium: Premium Feature')

				// Special item should use special snippet
				const specialItems = container.querySelectorAll('[data-special-item]')
				expect(specialItems).toHaveLength(1)
				expect(specialItems[0]?.textContent).toContain('⭐ Special: Special Offer')

				// Custom items are wrapped with data-menu-item-custom
				const customWrappers = container.querySelectorAll('[data-menu-item-custom]')
				expect(customWrappers).toHaveLength(2)
			})

			it('falls back to default when named snippet not found', async () => {
				const optionsWithMissingSnippet: MenuItem[] = [
					{ text: 'Unknown Snippet', value: 'unknown', snippet: 'nonexistent' }
				]

				const { container } = render(MenuSnippetTest, {
					props: {
						options: optionsWithMissingSnippet,
						useNamedSnippets: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				// Should fall back to default item rendering
				const defaultItems = container.querySelectorAll('[data-menu-item]')
				expect(defaultItems).toHaveLength(1)
				expect(defaultItems[0]?.textContent).toContain('Unknown Snippet')
			})

			it('calls onselect when named snippet item is clicked', async () => {
				const onselect = vi.fn()
				const optionsWithSnippet: MenuItem[] = [
					{ text: 'Premium Feature', value: 'premium', snippet: 'premium' }
				]

				const { container } = render(MenuSnippetTest, {
					props: {
						options: optionsWithSnippet,
						useNamedSnippets: true,
						onselect
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				const premiumItems = container.querySelectorAll('[data-premium-item]')
				await fireEvent.click(premiumItems[0]!)

				expect(onselect).toHaveBeenCalledWith(
					'premium',
					expect.objectContaining({ text: 'Premium Feature' })
				)
			})

			it('per-item snippet takes precedence over item snippet', async () => {
				const optionsWithSnippet: MenuItem[] = [
					{ text: 'Normal Item', value: 'normal' },
					{ text: 'Premium Feature', value: 'premium', snippet: 'premium' }
				]

				const { container } = render(MenuSnippetTest, {
					props: {
						options: optionsWithSnippet,
						useItemSnippet: true,
						useGroupLabelSnippet: true,
						useNamedSnippets: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				// Normal item should use the item snippet (not default)
				const customItems = container.querySelectorAll('[data-custom-item]')
				expect(customItems).toHaveLength(1)
				expect(customItems[0]?.textContent).toContain('Custom: Normal Item')

				// Premium item should use its named snippet (premium), not the generic item snippet
				const premiumItems = container.querySelectorAll('[data-premium-item]')
				expect(premiumItems).toHaveLength(1)
				expect(premiumItems[0]?.textContent).toContain('🔒 Premium: Premium Feature')
			})
		})

		describe('custom snippet field name', () => {
			it('uses custom field name for snippet', async () => {
				const optionsWithCustomField: MenuItem[] = [
					{ text: 'Normal', value: 'normal' },
					{ text: 'Special', value: 'special', renderer: 'special' }
				]

				const { container } = render(MenuSnippetTest, {
					props: {
						options: optionsWithCustomField,
						fields: { snippet: 'renderer' },
						useNamedSnippets: true
					}
				})

				const trigger = container.querySelector('[data-menu-trigger]')
				await fireEvent.click(trigger!)

				// Both items have data-menu-item (default item directly, custom wrapped)
				const allItems = container.querySelectorAll('[data-menu-item]')
				expect(allItems).toHaveLength(2)

				// Normal uses default rendering (button is the menu-item itself)
				const defaultItems = container.querySelectorAll(
					'[data-menu-item]:not([data-menu-item-custom])'
				)
				expect(defaultItems).toHaveLength(1)

				// Special uses the special snippet (via custom 'renderer' field)
				const specialItems = container.querySelectorAll('[data-special-item]')
				expect(specialItems).toHaveLength(1)

				// Special item wrapper has data-menu-item-custom
				const customWrappers = container.querySelectorAll('[data-menu-item-custom]')
				expect(customWrappers).toHaveLength(1)
			})
		})
	})
})
