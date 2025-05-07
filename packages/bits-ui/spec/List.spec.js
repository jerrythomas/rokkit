import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/svelte'
import List from '../src/List.svelte'

describe('List Component', () => {
	const mockItems = [
		{ id: '1', name: 'Item 1', description: 'Description 1' },
		{ id: '2', name: 'Item 2', description: 'Description 2' },
		{ id: '3', name: 'Item 3', description: 'Description 3' }
	]

	const mockFields = {
		id: 'id',
		label: 'name',
		description: 'description'
	}

	beforeEach(() => {
		cleanup()
	})

	it('renders a list component', () => {
		const { container } = render(List, {
			items: mockItems,
			fields: mockFields
		})
		expect(container.querySelector('[data-list]')).toBeTruthy()
	})

	it('renders items based on provided data', () => {
		const { getAllByRole } = render(List, {
			items: mockItems,
			fields: mockFields
		})

		const listItems = getAllByRole('option')
		expect(listItems.length).toBe(mockItems.length)
	})

	it('selects an item when clicked', async () => {
		const onSelect = vi.fn()
		const { getAllByRole } = render(List, {
			items: mockItems,
			fields: mockFields,
			onselect: onSelect
		})

		const listItems = getAllByRole('option')
		await fireEvent.click(listItems[1])

		expect(onSelect).toHaveBeenCalledTimes(1)
		expect(onSelect.mock.calls[0][0].detail.value).toEqual(mockItems[1])
	})

	it('filters items based on search input when searchable is true', async () => {
		const { getAllByRole, getByPlaceholderText } = render(List, {
			items: mockItems,
			fields: mockFields,
			searchable: true,
			searchPlaceholder: 'Search...'
		})

		const searchInput = getByPlaceholderText('Search...')
		await fireEvent.input(searchInput, { target: { value: 'Item 1' } })

		const listItems = getAllByRole('option')
		expect(listItems.length).toBeLessThan(mockItems.length) // Should be filtered
	})

	it('renders custom child snippet when provided', () => {
		const customChild = vi.fn().mockImplementation((item) => {
			return `<div>Custom: ${item.get('label')}</div>`
		})

		const { container } = render(List, {
			items: mockItems,
			fields: mockFields,
			child: customChild
		})
		expect(container).toMatchSnapshot()
		expect(customChild).toHaveBeenCalledTimes(mockItems.length)
	})

	it('renders empty state when no items match search', async () => {
		const { getByPlaceholderText, getByText } = render(List, {
			items: mockItems,
			fields: mockFields,
			searchable: true,
			searchPlaceholder: 'Search...'
		})

		const searchInput = getByPlaceholderText('Search...')
		await fireEvent.input(searchInput, { target: { value: 'No match' } })

		expect(getByText('No items found')).toBeTruthy()
	})

	it('renders custom empty state when provided', async () => {
		const emptyMessage = 'Nothing to see here'
		const { getByPlaceholderText, getByText } = render(List, {
			items: mockItems,
			fields: mockFields,
			searchable: true,
			searchPlaceholder: 'Search...',
			empty: () => emptyMessage
		})

		const searchInput = getByPlaceholderText('Search...')
		await fireEvent.input(searchInput, { target: { value: 'No match' } })

		expect(getByText(emptyMessage)).toBeTruthy()
	})

	it('uses Proxy with custom field mappings', () => {
		const customItems = [{ item_id: '1', item_name: 'Test Item' }]

		const customFields = {
			id: 'item_id',
			label: 'item_name'
		}

		const customChild = vi.fn().mockImplementation((item) => {
			// Verify that the proxied item correctly maps the fields
			return `<div>${item.get('label')}</div>`
		})

		render(List, {
			items: customItems,
			fields: customFields,
			child: customChild
		})

		expect(customChild).toHaveBeenCalled()
		expect(customChild.mock.calls[0][0].get('label')).toBe('Test Item')
		expect(customChild.mock.calls[0][0].get('id')).toBe('1')
	})
})
