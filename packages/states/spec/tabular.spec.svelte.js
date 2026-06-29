import { describe, it, expect } from 'vitest'
import { TableWrapper } from '../src/tabular.svelte.js'

describe('TableWrapper', () => {
	it('stores the data reference', () => {
		const data = [{ a: 1 }, { a: 2 }]
		const t = new TableWrapper(data)
		expect(t.data).toBe(data)
	})

	it('initialises headers as an empty array', () => {
		const t = new TableWrapper([])
		expect(t.headers).toEqual([])
	})

	it('data is null when constructed with null', () => {
		const t = new TableWrapper(null)
		expect(t.data).toBeNull()
	})

	it('headers is reactive — can be reassigned', () => {
		const t = new TableWrapper([])
		t.headers = ['a', 'b', 'c']
		expect(t.headers).toEqual(['a', 'b', 'c'])
	})
})
