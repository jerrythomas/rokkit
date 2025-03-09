import { describe, it, expect } from 'vitest'
import { TableWrapper } from '../src/tabular.svelte'
// import { FieldMapper } from '@rokkit/core'
// import { flushSync } from 'svelte'
import { sampleData } from './fixtures/table'

describe('TableWrapper', () => {
	const input = $state(sampleData)
	it('should wrap a tabular data', () => {
		const wrapper = new TableWrapper(input)
		expect(wrapper.data).toEqual(input)
	})
})
