import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import TreeTable from '../src/components/TreeTable.svelte'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const nested = [
	{
		region: 'EU',
		sales: 100,
		children: [
			{ region: 'EU/Germany', sales: 60 },
			{ region: 'EU/France', sales: 40 }
		]
	},
	{
		region: 'AM',
		sales: 80,
		children: [
			{ region: 'AM/USA', sales: 50 },
			{ region: 'AM/Canada', sales: 30 }
		]
	}
]

const columns = [
	{ name: 'region', label: 'Region' },
	{ name: 'sales', label: 'Sales' }
]

describe('TreeTable', () => {
	// ─── Rendering ─────────────────────────────────────────────────────────────

	it('renders a treegrid', () => {
		const { container } = render(TreeTable, { data: nested })
		const grid = container.querySelector('[data-tree-table] [role="treegrid"]')
		expect(grid).toBeTruthy()
	})

	it('renders only root rows initially (children collapsed)', () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const rows = container.querySelectorAll('[data-tree-table-row]')
		expect(rows.length).toBe(2)
	})

	it('renders all root values', () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const cells = container.querySelectorAll('[data-cell-value]')
		const texts = Array.from(cells).map((c) => c.textContent?.trim())
		expect(texts).toEqual(['EU', '100', 'AM', '80'])
	})

	it('marks the first column as the hierarchy column by default', () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const firstHeader = container.querySelector('[data-table-header-cell]')
		expect(firstHeader?.getAttribute('data-hierarchy')).toBe('true')
	})

	it('honors column.hierarchy=true to pick a different hierarchy column', () => {
		const { container } = render(TreeTable, {
			data: nested,
			columns: [
				{ name: 'region', label: 'Region' },
				{ name: 'sales', label: 'Sales', hierarchy: true }
			]
		})
		const headers = container.querySelectorAll('[data-table-header-cell]')
		expect(headers[0]?.hasAttribute('data-hierarchy')).toBe(false)
		expect(headers[1]?.getAttribute('data-hierarchy')).toBe('true')
	})

	it('hierarchy cell shows row.__label when set (group rows from nestByColumns)', () => {
		const labeled = [
			{
				__group: true,
				__column: 'region',
				__label: 'EMEA',
				region: 'EMEA',
				children: [{ city: 'Paris', revenue: 320 }]
			}
		]
		const { container } = render(TreeTable, {
			data: labeled,
			columns: [
				{ name: 'city', label: 'Location', hierarchy: true },
				{ name: 'revenue', label: 'Revenue' }
			]
		})
		const cells = container.querySelectorAll('td[data-hierarchy="true"] [data-cell-value]')
		// Root row is a group → renders __label ('EMEA') even though hierarchy column is 'city'
		expect(cells[0]?.textContent?.trim()).toBe('EMEA')
	})

	it('hierarchy cell falls back to column value for leaf rows', async () => {
		const data = [
			{
				__group: true,
				__column: 'region',
				__label: 'EMEA',
				region: 'EMEA',
				children: [{ city: 'Paris', revenue: 320 }]
			}
		]
		const { container } = render(TreeTable, {
			data,
			columns: [
				{ name: 'city', label: 'Location', hierarchy: true },
				{ name: 'revenue', label: 'Revenue' }
			]
		})
		// Expand the group → first leaf shows its city value
		const toggle = container.querySelector('[data-tree-table-toggle]') as HTMLElement
		await fireEvent.click(toggle)
		await waitFor(() => {
			const cells = container.querySelectorAll('td[data-hierarchy="true"] [data-cell-value]')
			expect(cells[1]?.textContent?.trim()).toBe('Paris')
		})
	})

	it('renders connector lines only inside the hierarchy column', () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const hierarchyCells = container.querySelectorAll('td[data-hierarchy="true"]')
		expect(hierarchyCells.length).toBe(2)
		hierarchyCells.forEach((cell) => {
			expect(cell.querySelector('[data-tree-table-cell-prefix]')).toBeTruthy()
		})
		const nonHierarchyCells = container.querySelectorAll(
			'td[data-table-cell]:not([data-hierarchy])'
		)
		nonHierarchyCells.forEach((cell) => {
			expect(cell.querySelector('[data-tree-table-cell-prefix]')).toBeFalsy()
		})
	})

	it('renders the toggle button for expandable rows', () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const toggles = container.querySelectorAll('[data-tree-table-toggle]')
		expect(toggles.length).toBe(2)
	})

	// ─── Expand / collapse ─────────────────────────────────────────────────────

	it('expands a row when its toggle is clicked', async () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const firstToggle = container.querySelector('[data-tree-table-toggle]') as HTMLElement
		await fireEvent.click(firstToggle)
		await waitFor(() => {
			const rows = container.querySelectorAll('[data-tree-table-row]')
			expect(rows.length).toBe(4) // EU + 2 children + AM
		})
	})

	it('shows aria-expanded on expandable rows', () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const rows = container.querySelectorAll('[data-tree-table-row]')
		rows.forEach((row) => {
			expect(row.getAttribute('aria-expanded')).toBe('false')
		})
	})

	// ─── Sort ──────────────────────────────────────────────────────────────────

	it('sorts roots ascending on first header click', async () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const regionHeader = container.querySelector('[data-column="region"]') as HTMLElement
		await fireEvent.click(regionHeader)
		await waitFor(() => {
			const cells = container.querySelectorAll('td[data-column="region"] [data-cell-value]')
			expect(Array.from(cells).map((c) => c.textContent?.trim())).toEqual(['AM', 'EU'])
		})
	})

	it('sort preserves hierarchy — children sort within parent', async () => {
		const { container } = render(TreeTable, { data: nested, columns })
		const regionHeader = container.querySelector('[data-column="region"]') as HTMLElement
		await fireEvent.click(regionHeader) // ascending
		// Expand AM (now first row)
		const firstToggle = container.querySelector('[data-tree-table-toggle]') as HTMLElement
		await fireEvent.click(firstToggle)
		await waitFor(() => {
			const cells = container.querySelectorAll('td[data-column="region"] [data-cell-value]')
			expect(Array.from(cells).map((c) => c.textContent?.trim())).toEqual([
				'AM',
				'AM/Canada',
				'AM/USA',
				'EU'
			])
		})
	})

	it('fires onsort callback', async () => {
		const onsort = vi.fn()
		const { container } = render(TreeTable, { data: nested, columns, onsort })
		const regionHeader = container.querySelector('[data-column="region"]') as HTMLElement
		await fireEvent.click(regionHeader)
		expect(onsort).toHaveBeenCalledWith([{ column: 'region', direction: 'ascending' }])
	})

	// ─── Selection ─────────────────────────────────────────────────────────────

	it('sets data-selectable attribute', () => {
		const { container } = render(TreeTable, { data: nested, columns, selectable: 'single' })
		const root = container.querySelector('[data-tree-table]')
		expect(root?.getAttribute('data-selectable')).toBe('single')
	})

	it('does not fire onselect when selectable=false', async () => {
		const onselect = vi.fn()
		const { container } = render(TreeTable, {
			data: nested,
			columns,
			selectable: false,
			onselect
		})
		const firstRow = container.querySelector('[data-tree-table-row]') as HTMLElement
		await fireEvent.click(firstRow)
		expect(onselect).not.toHaveBeenCalled()
	})

	// ─── Empty state ───────────────────────────────────────────────────────────

	it('shows empty state when no data', () => {
		const { container } = render(TreeTable, { data: [], columns })
		expect(container.querySelector('[data-table-empty]')).toBeTruthy()
	})
})
