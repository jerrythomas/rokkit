import { describe, it, expect, vi } from 'vitest'
import { ProxyTable } from '../src/proxy-table.svelte.js'
import { Wrapper } from '../src/wrapper.svelte.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const rows = [
	{ id: 1, name: 'Charlie', age: 30 },
	{ id: 2, name: 'Alice', age: 25 },
	{ id: 3, name: 'Bob', age: 28 }
]

// ─── Constructor + column derivation ──────────────────────────────────────────

describe('ProxyTable — constructor', () => {
	it('derives columns from data when none provided', () => {
		const t = new ProxyTable(rows)
		expect(t.columns.map((c) => c.name)).toEqual(['id', 'name', 'age'])
	})

	it('uses provided columns and fills sortable/sorted defaults', () => {
		const t = new ProxyTable(rows, { columns: [{ name: 'name', label: 'Name' }] })
		expect(t.columns).toEqual([
			{ name: 'name', label: 'Name', sortable: true, sorted: 'none' }
		])
	})

	it('preserves caller-provided sortable=false on a column', () => {
		const t = new ProxyTable(rows, {
			columns: [{ name: 'id', sortable: false }, { name: 'name' }]
		})
		expect(t.columns[0].sortable).toBe(false)
		expect(t.columns[1].sortable).toBe(true)
	})

	it('exposes flatView containing one entry per row', () => {
		const t = new ProxyTable(rows)
		expect(t.flatView).toHaveLength(3)
		expect(t.lookup.size).toBe(3)
	})

	it('initial sortState is empty', () => {
		const t = new ProxyTable(rows)
		expect(t.sortState).toEqual([])
	})
})

// ─── sortBy ───────────────────────────────────────────────────────────────────

describe('ProxyTable — sortBy', () => {
	it('cycles none → ascending on first call', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		expect(t.sortState).toEqual([{ column: 'name', direction: 'ascending' }])
		expect(t.columns.find((c) => c.name === 'name')?.sorted).toBe('ascending')
	})

	it('cycles ascending → descending on second call', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		t.sortBy('name')
		expect(t.sortState).toEqual([{ column: 'name', direction: 'descending' }])
	})

	it('cycles descending → none on third call', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		t.sortBy('name')
		t.sortBy('name')
		expect(t.sortState).toEqual([])
		expect(t.columns.find((c) => c.name === 'name')?.sorted).toBe('none')
	})

	it('reorders rows by the sorted column (ascending)', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		expect(t.flatView.map((n) => n.proxy.value.name)).toEqual(['Alice', 'Bob', 'Charlie'])
	})

	it('reorders rows by the sorted column (descending)', () => {
		const t = new ProxyTable(rows)
		t.sortBy('age')
		t.sortBy('age')
		expect(t.flatView.map((n) => n.proxy.value.name)).toEqual(['Charlie', 'Bob', 'Alice'])
	})

	it('single-column sort replaces prior sort', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		t.sortBy('age')
		expect(t.sortState).toEqual([{ column: 'age', direction: 'ascending' }])
	})

	it('extend=true pushes another column onto the sort stack', () => {
		const data = [
			{ team: 'A', score: 10 },
			{ team: 'B', score: 5 },
			{ team: 'A', score: 5 },
			{ team: 'B', score: 10 }
		]
		const t = new ProxyTable(data)
		t.sortBy('team')
		t.sortBy('score', true)
		expect(t.sortState).toEqual([
			{ column: 'team', direction: 'ascending' },
			{ column: 'score', direction: 'ascending' }
		])
		// All A rows first (sorted by score), then B rows (sorted by score)
		expect(t.flatView.map((n) => n.proxy.value)).toEqual([
			{ team: 'A', score: 5 },
			{ team: 'A', score: 10 },
			{ team: 'B', score: 5 },
			{ team: 'B', score: 10 }
		])
	})

	it('cycling a column in the multi-sort stack drops it on the third click', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		t.sortBy('age', true) // extend
		t.sortBy('age', true) // age: ascending → descending
		expect(t.sortState).toEqual([
			{ column: 'name', direction: 'ascending' },
			{ column: 'age', direction: 'descending' }
		])
		t.sortBy('age', true) // age: descending → none → removed from stack
		expect(t.sortState).toEqual([{ column: 'name', direction: 'ascending' }])
	})

	it('does not sort non-sortable columns', () => {
		const t = new ProxyTable(rows, {
			columns: [{ name: 'id', sortable: false }, { name: 'name' }]
		})
		t.sortBy('id')
		expect(t.sortState).toEqual([])
	})

	it('ignores unknown column names', () => {
		const t = new ProxyTable(rows)
		t.sortBy('missing')
		expect(t.sortState).toEqual([])
	})

	it('fires onsort callback after applying', () => {
		const onsort = vi.fn()
		const t = new ProxyTable(rows, { onsort })
		t.sortBy('name')
		expect(onsort).toHaveBeenCalledWith([{ column: 'name', direction: 'ascending' }])
	})
})

// ─── clearSort ────────────────────────────────────────────────────────────────

describe('ProxyTable — clearSort', () => {
	it('restores original data order', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		t.clearSort()
		expect(t.flatView.map((n) => n.proxy.value.name)).toEqual(['Charlie', 'Alice', 'Bob'])
	})

	it('empties sortState', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		t.clearSort()
		expect(t.sortState).toEqual([])
	})

	it('resets all column sorted flags to "none"', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		t.sortBy('age', true)
		t.clearSort()
		expect(t.columns.every((c) => c.sorted === 'none')).toBe(true)
	})

	it('fires onsort with empty state', () => {
		const onsort = vi.fn()
		const t = new ProxyTable(rows, { onsort })
		t.sortBy('name')
		onsort.mockClear()
		t.clearSort()
		expect(onsort).toHaveBeenCalledWith([])
	})
})

// ─── update (data + sort interaction) ─────────────────────────────────────────

describe('ProxyTable — update', () => {
	it('replaces underlying data', () => {
		const t = new ProxyTable(rows)
		t.update([{ id: 99, name: 'Zoe', age: 40 }])
		expect(t.flatView).toHaveLength(1)
		expect(t.flatView[0].proxy.value.name).toBe('Zoe')
	})

	it('re-applies active sort to the new data', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name') // ascending: Alice, Bob, Charlie
		t.update([
			{ id: 10, name: 'Mallory' },
			{ id: 11, name: 'Eve' }
		])
		expect(t.flatView.map((n) => n.proxy.value.name)).toEqual(['Eve', 'Mallory'])
	})

	it('preserves data order when sortState is empty', () => {
		const t = new ProxyTable(rows)
		const newData = [{ name: 'Z' }, { name: 'A' }]
		t.update(newData)
		expect(t.flatView.map((n) => n.proxy.value.name)).toEqual(['Z', 'A'])
	})
})

// ─── updateColumns ────────────────────────────────────────────────────────────

describe('ProxyTable — updateColumns', () => {
	it('replaces columns', () => {
		const t = new ProxyTable(rows)
		t.updateColumns([{ name: 'name' }, { name: 'age' }])
		expect(t.columns.map((c) => c.name)).toEqual(['name', 'age'])
	})

	it('preserves sorted state for columns that survive the swap', () => {
		const t = new ProxyTable(rows)
		t.sortBy('name')
		t.updateColumns([{ name: 'name' }, { name: 'age' }])
		expect(t.columns.find((c) => c.name === 'name')?.sorted).toBe('ascending')
	})

	it('new columns default to sortable=true, sorted="none"', () => {
		const t = new ProxyTable(rows)
		t.updateColumns([{ name: 'fresh' }])
		expect(t.columns[0]).toMatchObject({ name: 'fresh', sortable: true, sorted: 'none' })
	})
})

// ─── Integration: Wrapper navigates over ProxyTable ───────────────────────────

describe('ProxyTable — integration with Wrapper', () => {
	it('a plain Wrapper can navigate over a ProxyTable', () => {
		const t = new ProxyTable(rows)
		const w = new Wrapper(t, { collapsible: false })
		w.first(null)
		expect(w.focusedKey).toBe('0')
		w.next(null)
		expect(w.focusedKey).toBe('1')
		w.last(null)
		expect(w.focusedKey).toBe('2')
	})

	it('Wrapper.select() fires onselect with the row value', () => {
		const onselect = vi.fn()
		const t = new ProxyTable(rows)
		const w = new Wrapper(t, { onselect, collapsible: false })
		w.select('1')
		expect(onselect).toHaveBeenCalledWith(rows[1], expect.anything())
	})

	it('sorting reorders what Wrapper navigates', () => {
		const t = new ProxyTable(rows)
		const w = new Wrapper(t, { collapsible: false })
		t.sortBy('name')
		w.first(null)
		// After sort: Alice (key '0'), Bob ('1'), Charlie ('2')
		expect(t.lookup.get(w.focusedKey)?.value.name).toBe('Alice')
	})
})
