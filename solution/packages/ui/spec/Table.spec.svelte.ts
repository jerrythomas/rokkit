import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Table from '../src/components/Table.svelte'

const sampleData = [
	{ id: 1, name: 'Alice', age: 28, city: 'Boston' },
	{ id: 2, name: 'Bob', age: 35, city: 'Seattle' },
	{ id: 3, name: 'Charlie', age: 22, city: 'Austin' }
]

describe('Table', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a table container', () => {
		const { container } = render(Table, { data: sampleData })
		expect(container.querySelector('[data-table]')).toBeTruthy()
	})

	it('renders a table element with grid role', () => {
		const { container } = render(Table, { data: sampleData })
		const table = container.querySelector('table')
		expect(table).toBeTruthy()
		expect(table?.getAttribute('role')).toBe('grid')
	})

	it('auto-derives columns from data', () => {
		const { container } = render(Table, { data: sampleData })
		const headers = container.querySelectorAll('[data-table-header-cell]')
		expect(headers.length).toBe(4) // id, name, age, city
		expect(headers[0].textContent).toContain('id')
		expect(headers[1].textContent).toContain('name')
		expect(headers[2].textContent).toContain('age')
		expect(headers[3].textContent).toContain('city')
	})

	it('renders with custom columns', () => {
		const columns = [
			{ name: 'name', label: 'Full Name' },
			{ name: 'age', label: 'Age' }
		]
		const { container } = render(Table, { data: sampleData, columns })
		const headers = container.querySelectorAll('[data-table-header-cell]')
		expect(headers.length).toBe(2)
		expect(headers[0].textContent).toContain('Full Name')
		expect(headers[1].textContent).toContain('Age')
	})

	it('renders column headers with correct labels', () => {
		const columns = [{ name: 'name', label: 'Employee Name' }]
		const { container } = render(Table, { data: sampleData, columns })
		const header = container.querySelector('[data-table-header-text]')
		expect(header?.textContent).toBe('Employee Name')
	})

	it('falls back to column name when no label provided', () => {
		const columns = [{ name: 'name' }]
		const { container } = render(Table, { data: sampleData, columns })
		const header = container.querySelector('[data-table-header-text]')
		expect(header?.textContent).toBe('name')
	})

	it('renders all rows', () => {
		const { container } = render(Table, { data: sampleData })
		const rows = container.querySelectorAll('[data-table-row]')
		expect(rows.length).toBe(3)
	})

	it('renders cell values', () => {
		const { container } = render(Table, { data: sampleData })
		const cells = container.querySelectorAll('[data-table-cell]')
		// First row: id=1, name=Alice, age=28, city=Boston
		expect(cells[1].textContent).toContain('Alice')
		expect(cells[2].textContent).toContain('28')
		expect(cells[3].textContent).toContain('Boston')
	})

	it('renders data-path on rows', () => {
		const { container } = render(Table, { data: sampleData })
		const rows = container.querySelectorAll('[data-table-row]')
		expect(rows[0].getAttribute('data-path')).toBe('0')
		expect(rows[1].getAttribute('data-path')).toBe('1')
		expect(rows[2].getAttribute('data-path')).toBe('2')
	})

	it('renders data-column on cells', () => {
		const columns = [{ name: 'name' }, { name: 'age' }]
		const { container } = render(Table, { data: sampleData, columns })
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].getAttribute('data-column')).toBe('name')
		expect(cells[1].getAttribute('data-column')).toBe('age')
	})

	// ─── Caption ────────────────────────────────────────────────────

	it('renders caption when provided', () => {
		const { container } = render(Table, { data: sampleData, caption: 'Employees' })
		const caption = container.querySelector('[data-table-caption]')
		expect(caption?.textContent).toBe('Employees')
	})

	it('sets aria-label from caption', () => {
		const { container } = render(Table, { data: sampleData, caption: 'Employees' })
		const table = container.querySelector('table')
		expect(table?.getAttribute('aria-label')).toBe('Employees')
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('shows empty state when no data', () => {
		const { container } = render(Table, { data: [] })
		const empty = container.querySelector('[data-table-empty]')
		expect(empty).toBeTruthy()
		expect(empty?.textContent).toContain('No data')
	})

	// ─── Size Variants ──────────────────────────────────────────────

	it('applies size variant', () => {
		const { container } = render(Table, { data: sampleData, size: 'sm' })
		expect(container.querySelector('[data-table]')?.getAttribute('data-size')).toBe('sm')
	})

	// ─── Striped ────────────────────────────────────────────────────

	it('applies striped attribute', () => {
		const { container } = render(Table, { data: sampleData, striped: true })
		const table = container.querySelector('table')
		expect(table?.hasAttribute('data-striped')).toBe(true)
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('applies disabled attribute', () => {
		const { container } = render(Table, { data: sampleData, disabled: true })
		expect(container.querySelector('[data-table]')?.hasAttribute('data-disabled')).toBe(true)
	})

	// ─── Sort ───────────────────────────────────────────────────────

	it('renders sort icons on sortable columns', () => {
		const { container } = render(Table, { data: sampleData })
		const sortIcons = container.querySelectorAll('[data-table-sort-icon]')
		expect(sortIcons.length).toBeGreaterThan(0)
	})

	it('marks sortable columns with data-sortable', () => {
		const { container } = render(Table, { data: sampleData })
		const headers = container.querySelectorAll('[data-table-header-cell]')
		headers.forEach((h) => {
			expect(h.hasAttribute('data-sortable')).toBe(true)
		})
	})

	it('sets initial sort order to none', () => {
		const { container } = render(Table, { data: sampleData })
		const headers = container.querySelectorAll('[data-table-header-cell]')
		headers.forEach((h) => {
			expect(h.getAttribute('data-sort-order')).toBe('none')
		})
	})

	it('sorts ascending on first header click', async () => {
		const { container } = render(Table, { data: sampleData })
		const nameHeader = container.querySelector('[data-column="name"]')!
		await fireEvent.click(nameHeader)

		expect(nameHeader.getAttribute('data-sort-order')).toBe('ascending')

		const cells = container.querySelectorAll('[data-column="name"][data-table-cell]')
		const names = Array.from(cells).map((c) => c.textContent?.trim())
		expect(names).toEqual(['Alice', 'Bob', 'Charlie'])
	})

	it('sorts descending on second header click', async () => {
		const { container } = render(Table, { data: sampleData })
		const nameHeader = container.querySelector('[data-column="name"]')!
		await fireEvent.click(nameHeader) // ascending
		await fireEvent.click(nameHeader) // descending

		expect(nameHeader.getAttribute('data-sort-order')).toBe('descending')

		const cells = container.querySelectorAll('[data-column="name"][data-table-cell]')
		const names = Array.from(cells).map((c) => c.textContent?.trim())
		expect(names).toEqual(['Charlie', 'Bob', 'Alice'])
	})

	it('clears sort on third header click', async () => {
		const { container } = render(Table, { data: sampleData })
		const nameHeader = container.querySelector('[data-column="name"]')!
		await fireEvent.click(nameHeader) // ascending
		await fireEvent.click(nameHeader) // descending
		await fireEvent.click(nameHeader) // none

		expect(nameHeader.getAttribute('data-sort-order')).toBe('none')
	})

	it('fires onsort callback', async () => {
		const onsort = vi.fn()
		const { container } = render(Table, { data: sampleData, onsort })
		const nameHeader = container.querySelector('[data-column="name"]')!
		await fireEvent.click(nameHeader)

		expect(onsort).toHaveBeenCalledWith([{ column: 'name', direction: 'ascending' }])
	})

	it('does not sort non-sortable columns', async () => {
		const columns = [{ name: 'name', sortable: false }]
		const { container } = render(Table, { data: sampleData, columns })
		const nameHeader = container.querySelector('[data-column="name"]')!
		await fireEvent.click(nameHeader)

		expect(nameHeader.getAttribute('data-sort-order')).toBe('none')
	})

	// ─── Custom formatter ───────────────────────────────────────────

	it('applies custom cell formatter', () => {
		const columns = [
			{ name: 'age', formatter: (v: unknown) => `${v} years` }
		]
		const { container } = render(Table, { data: sampleData, columns })
		const cells = container.querySelectorAll('[data-column="age"]')
		// First data cell (skip header)
		const dataCells = Array.from(cells).filter((c) => c.tagName === 'TD')
		expect(dataCells[0].textContent).toContain('28 years')
	})

	// ─── Field mapping ──────────────────────────────────────────────

	it('supports column field mapping', () => {
		const data = [
			{ name: 'Alice', gender: 'F' },
			{ name: 'Bob', gender: 'M' }
		]
		const columns = [
			{ name: 'name', fields: { text: 'name', icon: 'gender' }, iconFormatter: (v: unknown) => `icon-${v}` }
		]
		const { container } = render(Table, { data, columns })
		const icon = container.querySelector('[data-cell-icon]')
		expect(icon?.classList.contains('icon-F')).toBe(true)
	})
})
