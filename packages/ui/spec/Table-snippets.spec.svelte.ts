import { describe, it, expect, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Table from '../src/components/Table.svelte'
import TableSnippetsTest from './TableSnippetsTest.svelte'

/**
 * Table exposes four snippet slots — header, row, cell and empty — and none had
 * been supplied, so each slot plus the default it replaces was unrendered. The
 * empty-state row in particular only appears with no data, which no case set up.
 */

beforeEach(() => cleanup())

const data = [
	{ name: 'Ada', role: 'eng', flag: 'i-mdi-star' },
	{ name: 'Bob', role: 'ops', flag: '' }
]
const columns = [{ name: 'name' }, { name: 'role' }]

describe('Table — empty state', () => {
	it('renders an empty row spanning every column when there is no data', () => {
		const { container } = render(Table, { props: { data: [], columns } })

		const row = container.querySelector('[data-table-empty-row]')
		expect(row).toBeTruthy()
		expect(row?.querySelector('td')?.getAttribute('colspan')).toBe('2')
	})

	it('renders the custom empty snippet inside that row', () => {
		const { container } = render(TableSnippetsTest, {
			props: { withEmpty: true, data: [], columns }
		})

		expect(container.querySelector('[data-table-empty-row] [data-custom-empty]')).toBeTruthy()
	})

	it('renders no empty row once there is data', () => {
		const { container } = render(Table, { props: { data, columns } })

		expect(container.querySelector('[data-table-empty-row]')).toBeNull()
	})

	it('renders an empty table for the default empty data prop', () => {
		const { container } = render(Table, { props: { columns } })

		expect(container.querySelector('[data-table-empty-row]')).toBeTruthy()
	})
})

describe('Table — snippet slots', () => {
	it('replaces the header row with the header snippet', () => {
		const { container } = render(TableSnippetsTest, {
			props: { withHeader: true, data, columns }
		})

		expect(container.querySelector('[data-custom-header]')).toBeTruthy()
	})

	it('replaces each body row with the row snippet', () => {
		const { container } = render(TableSnippetsTest, { props: { withRow: true, data, columns } })

		const rows = container.querySelectorAll('[data-custom-row]')
		expect(rows).toHaveLength(2)
		expect(rows[0].getAttribute('data-row-index')).toBe('0')
	})

	it('replaces each cell body with the cell snippet', () => {
		const { container } = render(TableSnippetsTest, { props: { withCell: true, data, columns } })

		expect(container.querySelectorAll('[data-custom-cell]').length).toBeGreaterThan(0)
		// Cells still live inside real <td>s so column metadata survives.
		expect(container.querySelector('[data-table-cell] [data-custom-cell]')).toBeTruthy()
	})
})

describe('Table — cell icons', () => {
	it('renders no icon when the column declares no icon field', () => {
		const { container } = render(Table, { props: { data, columns } })

		expect(container.querySelector('[data-table-cell-icon]')).toBeNull()
	})

	it('renders an icon from the mapped field', () => {
		const withIcon = [{ name: 'name', fields: { icon: 'flag' } }]
		const { container } = render(Table, { props: { data, columns: withIcon } })

		expect(container.innerHTML).toContain('i-mdi-star')
	})

	it('renders no icon for a row whose icon value is empty', () => {
		// Bob's flag is '', which must read as "no icon" rather than an empty class.
		const withIcon = [{ name: 'name', fields: { icon: 'flag' } }]
		const { container } = render(Table, { props: { data: [data[1]], columns: withIcon } })

		expect(container.innerHTML).not.toContain('i-mdi-star')
	})

	it('runs an iconFormatter when one is supplied', () => {
		const withIcon = [
			{ name: 'name', fields: { icon: 'flag' }, iconFormatter: () => 'i-mdi-custom' }
		]
		const { container } = render(Table, { props: { data, columns: withIcon } })

		expect(container.innerHTML).toContain('i-mdi-custom')
	})
})
