import { describe, it, expect } from 'vitest'
import { DataSet } from '../src/dataset.svelte'

describe('DataSet', () => {
	it('should create a DataSet object', () => {
		const data = new DataSet([1, 2, 3])
		expect(data.data).toEqual([1, 2, 3])
	})
})
