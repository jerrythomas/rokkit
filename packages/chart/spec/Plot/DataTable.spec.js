import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import DataTable from '../../src/Plot/DataTable.svelte'

const rows = [
	{ k: 'a', v: 1 },
	{ k: 'b', v: null }
]

describe('Plot DataTable — the accessible fallback table', () => {
	it('renders one row per datum over the given columns, blank for a missing value', () => {
		const { container } = render(DataTable, { props: { rows, columns: ['k', 'v'], title: 'Sales' } })
		const table = container.querySelector('table.plot-sr-table')
		expect(table?.getAttribute('aria-label')).toBe('Sales')
		expect(table?.querySelector('caption')?.textContent).toBe('Sales')
		expect([...table.querySelectorAll('th')].map((th) => th.textContent)).toEqual(['k', 'v'])
		expect([...table.querySelectorAll('tbody tr')].map((tr) => tr.textContent)).toEqual(['a1', 'b'])
	})

	it('names itself generically and has no caption without a title', () => {
		const { container } = render(DataTable, { props: { rows, columns: ['k'], title: '' } })
		const table = container.querySelector('table')
		expect(table?.getAttribute('aria-label')).toBe('Chart data')
		expect(table?.querySelector('caption')).toBeNull()
	})

	it('renders nothing without rows or without columns', () => {
		expect(render(DataTable, { props: { rows: [], columns: ['k'] } }).container.querySelector('table')).toBeNull()
		expect(render(DataTable, { props: { rows, columns: [] } }).container.querySelector('table')).toBeNull()
	})
})
