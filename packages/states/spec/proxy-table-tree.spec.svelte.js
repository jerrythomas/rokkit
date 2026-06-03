import { describe, it, expect } from 'vitest'
import { ProxyTableTree } from '../src/proxy-table-tree.svelte.js'
import { Wrapper } from '../src/wrapper.svelte.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const nestedRows = [
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

// ─── Constructor + flatView ───────────────────────────────────────────────────

describe('ProxyTableTree — constructor', () => {
	it('exposes only roots in flatView (children stay collapsed)', () => {
		const t = new ProxyTableTree(nestedRows)
		expect(t.flatView).toHaveLength(2)
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual(['EU', 'AM'])
	})

	it('lookup contains every row including nested children', () => {
		const t = new ProxyTableTree(nestedRows)
		expect(t.lookup.size).toBe(6)
	})

	it('derives columns from the first row including the children field', () => {
		const t = new ProxyTableTree(nestedRows)
		const names = t.columns.map((c) => c.name)
		expect(names).toContain('region')
		expect(names).toContain('sales')
	})

	it('honors a custom children field', () => {
		const data = [{ name: 'A', kids: [{ name: 'A.1' }, { name: 'A.2' }] }]
		const t = new ProxyTableTree(data, { fields: { children: 'kids' } })
		expect(t.lookup.size).toBe(3)
	})
})

// ─── Hierarchy-aware sort ─────────────────────────────────────────────────────

describe('ProxyTableTree — sortBy preserves hierarchy', () => {
	it('sorts only siblings within each parent — children stay under their parent', () => {
		const t = new ProxyTableTree(nestedRows)
		t.sortBy('region') // ascending
		// Roots: AM, EU (alphabetical)
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual(['AM', 'EU'])
		// Expand AM
		t.flatView[0].proxy.expanded = true
		const flatAfterExpand = t.flatView.map((n) => n.proxy.value.region)
		// AM's children sorted alphabetically: AM/Canada, AM/USA
		expect(flatAfterExpand).toEqual(['AM', 'AM/Canada', 'AM/USA', 'EU'])
	})

	it('descending sort applies at every depth', () => {
		const t = new ProxyTableTree(nestedRows)
		t.sortBy('region') // asc
		t.sortBy('region') // desc
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual(['EU', 'AM'])
		t.flatView[0].proxy.expanded = true
		const flat = t.flatView.map((n) => n.proxy.value.region)
		expect(flat).toEqual(['EU', 'EU/Germany', 'EU/France', 'AM'])
	})

	it('numeric ascending sort works on nested values', () => {
		const t = new ProxyTableTree(nestedRows)
		t.sortBy('sales')
		// Roots ascending by sales: AM(80), EU(100)
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual(['AM', 'EU'])
		t.flatView[0].proxy.expanded = true
		// AM children ascending: AM/Canada(30), AM/USA(50)
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual([
			'AM',
			'AM/Canada',
			'AM/USA',
			'EU'
		])
	})

	it('clearSort restores original hierarchy + order', () => {
		const t = new ProxyTableTree(nestedRows)
		t.sortBy('region')
		t.clearSort()
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual(['EU', 'AM'])
		t.flatView[0].proxy.expanded = true
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual([
			'EU',
			'EU/Germany',
			'EU/France',
			'AM'
		])
	})

	it('update(newData) re-applies active sort recursively', () => {
		const t = new ProxyTableTree(nestedRows)
		t.sortBy('region')
		t.update([
			{
				region: 'ZZ',
				children: [{ region: 'ZZ/b' }, { region: 'ZZ/a' }]
			},
			{ region: 'AA', children: [] }
		])
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual(['AA', 'ZZ'])
		t.flatView[1].proxy.expanded = true
		expect(t.flatView.map((n) => n.proxy.value.region)).toEqual(['AA', 'ZZ', 'ZZ/a', 'ZZ/b'])
	})
})

// ─── Integration with Wrapper ─────────────────────────────────────────────────

describe('ProxyTableTree — integration with Wrapper', () => {
	it('Wrapper navigates roots + expanded children', () => {
		const t = new ProxyTableTree(nestedRows)
		const w = new Wrapper(t, { collapsible: true })
		w.first(null)
		expect(w.focusedKey).toBe('0')
		w.expand(null) // expand EU
		w.next(null) // first child
		expect(w.focusedKey).toBe('0-0')
	})

	it('Right (expand) on already-open group advances to first child', () => {
		const t = new ProxyTableTree(nestedRows)
		const w = new Wrapper(t, { collapsible: true })
		w.first(null)
		w.expand(null) // first expand: opens
		w.expand(null) // second expand: moves into children
		expect(w.focusedKey).toBe('0-0')
	})

	it('Left (collapse) on a child moves focus to parent', () => {
		const t = new ProxyTableTree(nestedRows)
		const w = new Wrapper(t, { collapsible: true })
		w.first(null)
		w.expand(null)
		w.next(null) // on child
		w.collapse(null)
		expect(w.focusedKey).toBe('0')
	})
})
