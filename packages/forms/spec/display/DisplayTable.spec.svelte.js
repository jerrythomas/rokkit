import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'

import DisplayTable from '../../src/display/DisplayTable.svelte'

describe('DisplayTable', () => {
	beforeEach(() => cleanup())

	const sampleData = [
		{ id: 1, name: 'Alice', role: 'Engineer', salary: 90000, active: true },
		{ id: 2, name: 'Bob', role: 'Designer', salary: 75000, active: false },
		{ id: 3, name: 'Carol', role: 'Manager', salary: 110000, active: true }
	]

	const sampleColumns = [
		{ key: 'name', label: 'Name' },
		{ key: 'role', label: 'Role' }
	]

	it('should render with data-display-table attribute', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns }
		})
		expect(container.querySelector('[data-display-table]')).toBeTruthy()
	})

	it('should render a table inside', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns }
		})
		expect(container.querySelector('[data-table]')).toBeTruthy()
	})

	it('should render header cells for each column', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns }
		})
		const headerCells = container.querySelectorAll('[data-table-header-cell]')
		expect(headerCells.length).toBeGreaterThanOrEqual(sampleColumns.length)
	})

	it('should render a row for each data item', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns }
		})
		const rows = container.querySelectorAll('[data-table-row]')
		expect(rows).toHaveLength(3)
	})

	it('should render title when provided', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns, title: 'Team Members' }
		})
		const titleEl = container.querySelector('[data-display-title]')
		expect(titleEl?.textContent).toBe('Team Members')
	})

	it('should not render title element when title is absent', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns }
		})
		expect(container.querySelector('[data-display-title]')).toBeNull()
	})

	it('should set data-selectable when select prop is provided', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns, select: 'one' }
		})
		const tableEl = container.querySelector('[data-display-table]')
		expect(tableEl?.hasAttribute('data-selectable')).toBe(true)
		expect(tableEl?.getAttribute('data-selectable')).toBe('one')
	})

	it('should not set data-selectable when select is absent', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns }
		})
		const tableEl = container.querySelector('[data-display-table]')
		expect(tableEl?.hasAttribute('data-selectable')).toBe(false)
	})

	it('should render with empty data array showing empty state', () => {
		const { container } = render(DisplayTable, {
			props: { data: [], columns: sampleColumns }
		})
		const tableEl = container.querySelector('[data-display-table]')
		expect(tableEl).toBeTruthy()
		const rows = container.querySelectorAll('[data-table-row]')
		expect(rows).toHaveLength(0)
	})

	it('should apply class to display-table container', () => {
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns, class: 'my-table' }
		})
		const tableEl = container.querySelector('[data-display-table]')
		expect(tableEl?.classList.contains('my-table')).toBe(true)
	})

	it('should render currency-formatted values', () => {
		const columns = [{ key: 'salary', label: 'Salary', format: 'currency' }]
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		// First row salary formatted as currency
		expect(cells[0].textContent).toContain('90,000')
	})

	it('should render number-formatted values', () => {
		const columns = [{ key: 'salary', label: 'Salary', format: 'number' }]
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent).toContain('90,000')
	})

	it('should render boolean-formatted values', () => {
		const columns = [{ key: 'active', label: 'Active', format: 'boolean' }]
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent.trim()).toBe('✓')
		expect(cells[1].textContent.trim()).toBe('✗')
	})

	it('should render duration-formatted values (minutes only)', () => {
		const durationData = [{ task: 'Meeting', duration: 45 }]
		const columns = [{ key: 'duration', label: 'Duration', format: 'duration' }]
		const { container } = render(DisplayTable, {
			props: { data: durationData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent.trim()).toBe('45m')
	})

	it('should render duration-formatted values (hours and minutes)', () => {
		const durationData = [{ task: 'Sprint', duration: 90 }]
		const columns = [{ key: 'duration', label: 'Duration', format: 'duration' }]
		const { container } = render(DisplayTable, {
			props: { data: durationData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent.trim()).toBe('1h 30m')
	})

	it('should render duration-formatted values (exact hours)', () => {
		const durationData = [{ task: 'Fullday', duration: 120 }]
		const columns = [{ key: 'duration', label: 'Duration', format: 'duration' }]
		const { container } = render(DisplayTable, {
			props: { data: durationData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent.trim()).toBe('2h')
	})

	it('should render datetime-formatted values', () => {
		const dtData = [{ created: new Date(2024, 0, 15, 10, 30) }]
		const columns = [{ key: 'created', label: 'Created', format: 'datetime' }]
		const { container } = render(DisplayTable, {
			props: { data: dtData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent.trim()).toBeTruthy()
	})

	it('should render "—" for null values with a format', () => {
		const nullData = [{ salary: null }]
		const columns = [{ key: 'salary', label: 'Salary', format: 'currency' }]
		const { container } = render(DisplayTable, {
			props: { data: nullData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent.trim()).toBe('—')
	})

	it('should render "—" for undefined values with a format', () => {
		const undData = [{ salary: undefined }]
		const columns = [{ key: 'salary', label: 'Salary', format: 'currency' }]
		const { container } = render(DisplayTable, {
			props: { data: undData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent.trim()).toBe('—')
	})

	it('should use String() for unknown format', () => {
		const d = [{ code: 42 }]
		const columns = [{ key: 'code', label: 'Code', format: 'unknown-format' }]
		const { container } = render(DisplayTable, {
			props: { data: d, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent.trim()).toBe('42')
	})

	it('should use key as label when label is absent', () => {
		const columns = [{ key: 'name' }]
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns }
		})
		// Header should show 'name' as the label
		const headerTexts = container.querySelectorAll('[data-table-header-text]')
		expect(headerTexts[0].textContent).toBe('name')
	})

	it('should call onselect when a row is clicked', async () => {
		const onselect = vi.fn()
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns: sampleColumns, onselect }
		})

		const rows = container.querySelectorAll('[data-table-row]')
		await fireEvent.click(rows[0])

		expect(onselect).toHaveBeenCalled()
	})

	it('should render with columns that have width and align', () => {
		const columns = [
			{ key: 'name', label: 'Name', width: '200px', align: 'left' },
			{ key: 'salary', label: 'Salary', align: 'right' }
		]
		const { container } = render(DisplayTable, {
			props: { data: sampleData, columns }
		})
		expect(container.querySelector('[data-table]')).toBeTruthy()
	})

	it('should render datetime format from timestamp number', () => {
		const tsData = [{ ts: 1705312200000 }]
		const columns = [{ key: 'ts', label: 'Timestamp', format: 'datetime' }]
		const { container } = render(DisplayTable, {
			props: { data: tsData, columns }
		})
		const cells = container.querySelectorAll('[data-table-cell]')
		expect(cells[0].textContent).toBeTruthy()
	})
})
