import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import TreeTable from '../src/components/TreeTable.svelte'
import TreeTableTest from './TreeTableTest.svelte'

/**
 * TreeTable was the single largest gap in the .svelte debt. The existing spec
 * renders a flat table; none of what makes it a TREE table had run — the
 * hierarchy prefix with its chevron and connector lines, the expand toggle, the
 * four snippet slots, the caption, the empty state, or selection.
 */

beforeEach(() => cleanup())

const nested = [
	{
		region: 'EU',
		sales: 100,
		flag: 'i-mdi-star',
		children: [
			{ region: 'EU/DE', sales: 60 },
			{ region: 'EU/FR', sales: 40 }
		]
	},
	{ region: 'AM', sales: 80, children: [{ region: 'AM/US', sales: 80 }] }
]
const columns = [{ name: 'region', hierarchy: true }, { name: 'sales' }]

const rows = (c: Element) => [...c.querySelectorAll('tbody tr')]

describe('TreeTable — hierarchy prefix', () => {
	it('renders a prefix with an expand toggle for an expandable row', () => {
		const { container } = render(TreeTable, { props: { data: nested, columns } })

		expect(container.querySelector('[data-tree-table-cell-prefix]')).toBeTruthy()
		expect(container.querySelector('[data-tree-table-cell-prefix] button')).toBeTruthy()
	})

	it('expands a row to reveal its children', async () => {
		const { container } = render(TreeTable, { props: { data: nested, columns } })
		const before = rows(container).length

		await fireEvent.click(container.querySelector('[data-tree-table-cell-prefix] button')!)
		await tick()

		expect(rows(container).length).toBeGreaterThan(before)
	})

	it('collapses again on a second click', async () => {
		const { container } = render(TreeTable, { props: { data: nested, columns } })
		const collapsed = rows(container).length

		const toggle = () => container.querySelector('[data-tree-table-cell-prefix] button')!
		await fireEvent.click(toggle())
		await tick()
		await fireEvent.click(toggle())
		await tick()

		expect(rows(container).length).toBe(collapsed)
	})

	it('renders a spacer instead of a toggle for a leaf row', async () => {
		const { container } = render(TreeTable, { props: { data: nested, columns } })

		await fireEvent.click(container.querySelector('[data-tree-table-cell-prefix] button')!)
		await tick()

		expect(container.querySelector('[data-tree-table-empty]')).toBeTruthy()
	})

	it('renders a flat table when no row has children', () => {
		const flat = [{ region: 'EU', sales: 1 }]
		const { container } = render(TreeTable, { props: { data: flat, columns } })

		expect(container.querySelector('[data-tree-table-cell-prefix] button')).toBeNull()
	})
})

describe('TreeTable — caption and empty state', () => {
	it('renders a caption when one is supplied', () => {
		const { container } = render(TreeTable, {
			props: { data: nested, columns, caption: 'Sales by region' }
		})

		expect(container.querySelector('[data-table-caption]')?.textContent).toBe('Sales by region')
	})

	it('renders no caption element when none is supplied', () => {
		const { container } = render(TreeTable, { props: { data: nested, columns } })

		expect(container.querySelector('[data-table-caption]')).toBeNull()
	})

	it('renders an empty row spanning every column with no data', () => {
		const { container } = render(TreeTable, { props: { data: [], columns } })

		const row = container.querySelector('[data-table-empty-row]')
		expect(row).toBeTruthy()
		expect(row?.querySelector('td')?.getAttribute('colspan')).toBe('2')
	})

	it('renders an empty table for the default empty data prop', () => {
		const { container } = render(TreeTable, { props: { columns } })

		expect(container.querySelector('[data-table-empty-row]')).toBeTruthy()
	})
})

describe('TreeTable — snippet slots', () => {
	it('replaces the header row', () => {
		const { container } = render(TreeTableTest, {
			props: { withHeader: true, data: nested, columns }
		})

		expect(container.querySelector('[data-custom-header]')).toBeTruthy()
	})

	it('replaces each body row', () => {
		const { container } = render(TreeTableTest, {
			props: { withRow: true, data: nested, columns }
		})

		expect(container.querySelectorAll('[data-custom-row]').length).toBeGreaterThan(0)
	})

	it('replaces each cell body', () => {
		const { container } = render(TreeTableTest, {
			props: { withCell: true, data: nested, columns }
		})

		expect(container.querySelectorAll('[data-custom-cell]').length).toBeGreaterThan(0)
	})

	it('replaces the empty state', () => {
		const { container } = render(TreeTableTest, {
			props: { withEmpty: true, data: [], columns }
		})

		expect(container.querySelector('[data-table-empty-row] [data-custom-empty]')).toBeTruthy()
	})
})

describe('TreeTable — cell values and icons', () => {
	it('runs a column formatter', () => {
		const formatted = [{ name: 'region', hierarchy: true }, { name: 'sales', formatter: (v) => `$${v}` }]
		const { container } = render(TreeTable, { props: { data: nested, columns: formatted } })

		expect(container.textContent).toContain('$100')
	})

	it('renders a cell icon from the mapped field', () => {
		const withIcon = [
			{ name: 'region', hierarchy: true, fields: { icon: 'flag' } },
			{ name: 'sales' }
		]
		const { container } = render(TreeTable, { props: { data: nested, columns: withIcon } })

		expect(container.querySelector('[data-cell-icon]')).toBeTruthy()
	})

	it('renders no icon for a row whose icon value is missing', () => {
		const withIcon = [
			{ name: 'region', hierarchy: true, fields: { icon: 'flag' } },
			{ name: 'sales' }
		]
		const { container } = render(TreeTable, {
			props: { data: [{ region: 'AM', sales: 1 }], columns: withIcon }
		})

		expect(container.querySelector('[data-cell-icon]')).toBeNull()
	})

	it('runs an iconFormatter when one is supplied', () => {
		const withIcon = [
			{ name: 'region', hierarchy: true, fields: { icon: 'flag' }, iconFormatter: () => 'i-mdi-x' },
			{ name: 'sales' }
		]
		const { container } = render(TreeTable, { props: { data: nested, columns: withIcon } })

		expect(container.querySelector('[data-cell-icon]')?.classList.contains('i-mdi-x')).toBe(true)
	})
})

describe('TreeTable — selection and sorting guards', () => {
	it('does not select when selectable is false', async () => {
		const onselect = vi.fn()
		const { container } = render(TreeTable, {
			props: { data: nested, columns, selectable: false, onselect }
		})

		await fireEvent.click(rows(container)[0])
		await tick()

		expect(onselect).not.toHaveBeenCalled()
	})

	it('does not select while disabled', async () => {
		const onselect = vi.fn()
		const { container } = render(TreeTable, {
			props: { data: nested, columns, disabled: true, onselect }
		})

		await fireEvent.click(rows(container)[0])
		await tick()

		expect(onselect).not.toHaveBeenCalled()
	})

	it('does not sort a column marked unsortable', async () => {
		const onsort = vi.fn()
		const unsortable = [
			{ name: 'region', hierarchy: true },
			{ name: 'sales', sortable: false }
		]
		const { container } = render(TreeTable, {
			props: { data: nested, columns: unsortable, onsort }
		})

		const headers = container.querySelectorAll('thead th')
		await fireEvent.click(headers[headers.length - 1])
		await tick()

		expect(onsort).not.toHaveBeenCalled()
	})
})
