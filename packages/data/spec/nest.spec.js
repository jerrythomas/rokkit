import { describe, it, expect } from 'vitest'
import { nestByPath, nestByColumns } from '../src/nest'

// ─── nestByPath ───────────────────────────────────────────────────────────────

describe('nestByPath', () => {
	it('returns empty array for empty input', () => {
		expect(nestByPath([], { column: 'path' })).toEqual([])
		expect(nestByPath(null, { column: 'path' })).toEqual([])
	})

	it('nests rows under a single root path', () => {
		const rows = [
			{ path: 'root/a', label: 'A' },
			{ path: 'root/b', label: 'B' }
		]
		const nested = nestByPath(rows, { column: 'path' })
		expect(nested).toHaveLength(1)
		expect(nested[0].path).toBe('root')
		expect(nested[0].children).toHaveLength(2)
		expect(nested[0].children[0]).toMatchObject({ path: 'root/a', label: 'A' })
		expect(nested[0].children[1]).toMatchObject({ path: 'root/b', label: 'B' })
	})

	it('synthesizes intermediate parents when paths skip levels', () => {
		const rows = [{ path: 'a/b/c', label: 'C' }]
		const nested = nestByPath(rows, { column: 'path' })
		expect(nested[0].path).toBe('a')
		expect(nested[0].children[0].path).toBe('a/b')
		expect(nested[0].children[0].children[0]).toMatchObject({ path: 'a/b/c', label: 'C' })
	})

	it('respects a custom separator', () => {
		const rows = [{ path: 'a.b.c' }]
		const nested = nestByPath(rows, { column: 'path', separator: '.' })
		expect(nested[0].path).toBe('a')
		expect(nested[0].children[0].path).toBe('a.b')
	})

	it('drops the path field when keepPath=false', () => {
		const rows = [{ path: 'a/b', label: 'B' }]
		const nested = nestByPath(rows, { column: 'path', keepPath: false })
		expect('path' in nested[0]).toBe(false)
		expect('path' in nested[0].children[0]).toBe(false)
		expect(nested[0].children[0].label).toBe('B')
	})

	it('skips rows with missing or empty path', () => {
		const rows = [{ path: '' }, { path: null }, { label: 'orphan' }, { path: 'root' }]
		const nested = nestByPath(rows, { column: 'path' })
		expect(nested).toHaveLength(1)
		expect(nested[0].path).toBe('root')
	})

	it('merges leaf payload into the deepest synthesized node', () => {
		const rows = [
			{ path: 'a', label: 'A-root' },
			{ path: 'a/b', label: 'B', icon: 'mdi:b' }
		]
		const nested = nestByPath(rows, { column: 'path' })
		expect(nested[0].label).toBe('A-root')
		expect(nested[0].children[0]).toMatchObject({ label: 'B', icon: 'mdi:b' })
	})

	it('handles multiple root branches', () => {
		const rows = [{ path: 'a/b' }, { path: 'c/d' }]
		const nested = nestByPath(rows, { column: 'path' })
		expect(nested).toHaveLength(2)
		expect(nested.map((n) => n.path)).toEqual(['a', 'c'])
	})
})

// ─── nestByColumns ────────────────────────────────────────────────────────────

describe('nestByColumns', () => {
	it('returns empty array for empty input', () => {
		expect(nestByColumns([], ['region'])).toEqual([])
	})

	it('returns rows unchanged when columns list is empty', () => {
		const rows = [{ id: 1 }, { id: 2 }]
		expect(nestByColumns(rows, [])).toEqual(rows)
	})

	it('groups rows by a single column', () => {
		const rows = [
			{ region: 'EU', country: 'France' },
			{ region: 'EU', country: 'Germany' },
			{ region: 'AM', country: 'USA' }
		]
		const nested = nestByColumns(rows, ['region'])
		expect(nested).toHaveLength(2)
		expect(nested[0]).toMatchObject({ __group: true, __column: 'region', region: 'EU' })
		expect(nested[0].children).toHaveLength(2)
		expect(nested[1].region).toBe('AM')
		expect(nested[1].children).toHaveLength(1)
	})

	it('groups by multiple columns (nested)', () => {
		const rows = [
			{ region: 'EU', country: 'France', city: 'Paris' },
			{ region: 'EU', country: 'France', city: 'Lyon' },
			{ region: 'EU', country: 'Germany', city: 'Berlin' },
			{ region: 'AM', country: 'USA', city: 'Boston' }
		]
		const nested = nestByColumns(rows, ['region', 'country'])
		// region=EU > [France, Germany], region=AM > [USA]
		expect(nested[0].region).toBe('EU')
		expect(nested[0].children.map((c) => c.country)).toEqual(['France', 'Germany'])
		expect(nested[0].children[0].children).toHaveLength(2)
		expect(nested[0].children[0].children.map((c) => c.city)).toEqual(['Paris', 'Lyon'])
	})

	it('preserves insertion order within each group', () => {
		const rows = [
			{ region: 'AM', country: 'USA' },
			{ region: 'EU', country: 'France' },
			{ region: 'AM', country: 'Canada' }
		]
		const nested = nestByColumns(rows, ['region'])
		expect(nested.map((n) => n.region)).toEqual(['AM', 'EU'])
		expect(nested[0].children.map((c) => c.country)).toEqual(['USA', 'Canada'])
	})

	it('exposes __group + __column on synthetic group rows', () => {
		const rows = [{ region: 'EU', x: 1 }]
		const nested = nestByColumns(rows, ['region'])
		expect(nested[0].__group).toBe(true)
		expect(nested[0].__column).toBe('region')
	})

	it('accepts a custom groupRowFactory', () => {
		const rows = [{ region: 'EU', sales: 100 }, { region: 'EU', sales: 200 }]
		const factory = (col, value, children) => ({
			[col]: value,
			total: children.reduce((s, c) => s + c.sales, 0),
			children
		})
		const nested = nestByColumns(rows, ['region'], { groupRowFactory: factory })
		expect(nested[0].total).toBe(300)
		expect(nested[0].__group).toBeUndefined()
	})

	it('handles null/undefined values as their own bucket', () => {
		const rows = [{ region: null }, { region: undefined }, { region: 'EU' }]
		const nested = nestByColumns(rows, ['region'])
		expect(nested).toHaveLength(3)
	})
})
