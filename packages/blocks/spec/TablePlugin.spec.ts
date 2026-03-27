import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TablePlugin from '../src/TablePlugin.svelte'

const validTable = JSON.stringify({
	columns: ['Year', 'Revenue'],
	rows: [
		{ Year: 2023, Revenue: 4.2 },
		{ Year: 2024, Revenue: 4.7 }
	]
})

describe('TablePlugin', () => {
	it('renders a table element', () => {
		const { container } = render(TablePlugin, { props: { code: validTable } })
		expect(container.querySelector('table')).toBeTruthy()
	})

	it('renders column headers', () => {
		const { container } = render(TablePlugin, { props: { code: validTable } })
		const headers = container.querySelectorAll('th')
		expect(headers.length).toBeGreaterThanOrEqual(2)
		expect(Array.from(headers).some((h) => h.textContent?.includes('Year'))).toBeTruthy()
		expect(Array.from(headers).some((h) => h.textContent?.includes('Revenue'))).toBeTruthy()
	})

	it('renders data rows', () => {
		const { container } = render(TablePlugin, { props: { code: validTable } })
		const rows = container.querySelectorAll('tbody tr')
		expect(rows.length).toBe(2)
	})

	it('renders error badge for invalid JSON', () => {
		const { container } = render(TablePlugin, { props: { code: 'not json' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})
})
