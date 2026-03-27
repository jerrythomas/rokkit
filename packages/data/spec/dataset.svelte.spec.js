import { describe, it, expect } from 'vitest'
import { reactiveDataset, ReactiveDataSet } from '../src/dataset.svelte.js'

describe('ReactiveDataSet', () => {
	const seed = [
		{ name: 'Alice', score: 90 },
		{ name: 'Bob', score: 70 },
		{ name: 'Carol', score: 80 }
	]

	it('factory function returns a ReactiveDataSet', () => {
		expect(reactiveDataset([])).toBeInstanceOf(ReactiveDataSet)
	})

	it('rows returns all source rows with no filter/transform', () => {
		const ds = reactiveDataset([...seed])
		expect(ds.rows).toEqual(seed)
	})

	it('where filters rows', () => {
		const ds = reactiveDataset([...seed]).where((r) => r.score >= 80)
		expect(ds.rows).toEqual([
			{ name: 'Alice', score: 90 },
			{ name: 'Carol', score: 80 }
		])
	})

	it('apply transforms rows', () => {
		const ds = reactiveDataset([...seed]).apply((r) => ({ ...r, score: r.score + 10 }))
		expect(ds.rows.map((r) => r.score)).toEqual([100, 80, 90])
	})

	it('sortBy sorts rows ascending', () => {
		const ds = reactiveDataset([...seed]).sortBy('score')
		expect(ds.rows.map((r) => r.name)).toEqual(['Bob', 'Carol', 'Alice'])
	})

	it('clearFilter removes the filter', () => {
		const ds = reactiveDataset([...seed]).where((r) => r.score >= 80)
		expect(ds.rows).toHaveLength(2)
		ds.clearFilter()
		expect(ds.rows).toHaveLength(3)
	})

	it('clearTransforms removes all transforms', () => {
		const ds = reactiveDataset([...seed]).apply((r) => ({ ...r, score: 0 }))
		expect(ds.rows[0].score).toBe(0)
		ds.clearTransforms()
		expect(ds.rows[0].score).toBe(90)
	})

	it('setData replaces source rows', () => {
		const ds = reactiveDataset([...seed])
		ds.setData([{ name: 'Dave', score: 50 }])
		expect(ds.rows).toEqual([{ name: 'Dave', score: 50 }])
	})

	it('push appends a row', () => {
		const ds = reactiveDataset([...seed])
		ds.push({ name: 'Dave', score: 50 })
		expect(ds.rows).toHaveLength(4)
		expect(ds.rows[3].name).toBe('Dave')
	})

	it('remove deletes matching rows from source', () => {
		const ds = reactiveDataset([...seed])
		ds.remove((r) => r.name === 'Bob')
		expect(ds.rows.map((r) => r.name)).toEqual(['Alice', 'Carol'])
	})

	it('update patches matching rows in source', () => {
		const ds = reactiveDataset([...seed])
		ds.update((r) => r.name === 'Bob', { score: 99 })
		expect(ds.rows.find((r) => r.name === 'Bob').score).toBe(99)
	})

	it('update with function patch', () => {
		const ds = reactiveDataset([...seed])
		ds.update(
			(r) => r.score < 85,
			(r) => ({ ...r, score: r.score + 5 })
		)
		expect(ds.rows.map((r) => r.score)).toEqual([90, 75, 85])
	})

	it('snapshot returns a plain array copy', () => {
		const ds = reactiveDataset([...seed])
		const snap = ds.snapshot()
		expect(snap).toEqual(seed)
		expect(snap).not.toBe(ds.rows)
	})

	it('columns derives column definitions', () => {
		const ds = reactiveDataset([...seed])
		const cols = ds.columns
		expect(cols).toHaveLength(2)
		expect(cols.find((c) => c.name === 'name').scale).toBe('discrete')
		expect(cols.find((c) => c.name === 'score').scale).toBe('discrete')
	})

	it('withColumns merges enhancements into column defs', () => {
		const ds = reactiveDataset([...seed]).withColumns([{ name: 'score', label: 'Score (%)' }])
		const col = ds.columns.find((c) => c.name === 'score')
		expect(col.label).toBe('Score (%)')
	})

	it('chaining returns the same instance', () => {
		const ds = reactiveDataset([])
		expect(ds.where(() => true)).toBe(ds)
		expect(ds.apply((r) => r)).toBe(ds)
		expect(ds.sortBy('name')).toBe(ds)
		expect(ds.withColumns([])).toBe(ds)
		expect(ds.clearFilter()).toBe(ds)
		expect(ds.clearTransforms()).toBe(ds)
		expect(ds.setData([])).toBe(ds)
		expect(ds.push({})).toBe(ds)
		expect(ds.remove(() => false)).toBe(ds)
		expect(ds.update(() => false, {})).toBe(ds)
	})
})
