import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import TableNamedSnippetTest from './TableNamedSnippetTest.svelte'

/**
 * Per-column named snippets: `column.snippet = 'name'` routes that column's
 * cells to `snippets[name]`, leaving every other column on the default renderer.
 *
 * `TableColumn.snippet` was declared and documented long before it was read —
 * see docs/backlog/2026-09-14-table-column-snippet-dead.md. These tests pin the
 * behaviour the docs already promised.
 */

const data = [
	{ name: 'Ada', role: 'Engineer' },
	{ name: 'Linus', role: 'Maintainer' }
]

const columns = [{ name: 'name' }, { name: 'role' }, { name: 'ops', snippet: 'actions' }]

describe('Table per-column named snippets', () => {
	afterEach(cleanup)

	it('routes a column with column.snippet to the named snippet', () => {
		const { container } = render(TableNamedSnippetTest, { data, columns })
		const named = [...container.querySelectorAll('[data-named-cell]')]
		expect(named).toHaveLength(data.length)
		expect(named[0].textContent).toContain('Actions: Ada')
	})

	it('applies it only to the column that names it', () => {
		const { container } = render(TableNamedSnippetTest, { data, columns })
		const cols = [...container.querySelectorAll('[data-named-cell]')].map((n) =>
			n.getAttribute('data-named-column')
		)
		expect(new Set(cols)).toEqual(new Set(['ops']))
	})

	it('leaves the other columns on the default cell renderer', () => {
		const { container } = render(TableNamedSnippetTest, { data, columns })
		const values = [...container.querySelectorAll('[data-cell-value]')].map((n) => n.textContent)
		expect(values).toContain('Ada')
		expect(values).toContain('Engineer')
	})

	it('wins over the blanket `cell` snippet', () => {
		// A named column is more specific than `cell`, the same way itemContent
		// loses to a per-item named snippet everywhere else in the library.
		const { container } = render(TableNamedSnippetTest, { data, columns, withCell: true })
		expect(container.querySelectorAll('[data-named-cell]')).toHaveLength(data.length)
		const defaults = [...container.querySelectorAll('[data-default-cell]')].map((n) => n.textContent)
		expect(defaults).toContain('Ada')
		expect(defaults).not.toContain('')
	})

	it('falls back to the default renderer when the named snippet is absent', () => {
		// column.snippet naming something nobody passed must not blank the cell.
		const missing = [{ name: 'name' }, { name: 'ops', snippet: 'nope' }]
		const { container } = render(TableNamedSnippetTest, { data, columns: missing })
		expect(container.querySelectorAll('[data-named-cell]')).toHaveLength(0)
		expect(container.querySelectorAll('[data-table-cell]').length).toBeGreaterThan(0)
	})
})
