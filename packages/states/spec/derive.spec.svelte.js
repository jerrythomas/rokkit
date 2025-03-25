import { describe, it, expect } from 'vitest'
import { flatVisibleNodes, deriveLookup } from '../src/derive.svelte'
import { equals } from 'ramda'
import { flushSync } from 'svelte'

describe('derive', () => {
	describe('flatVisibleNodes', () => {
		it('should generate a derived store', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'children', expanded: '_expanded' }
			const data = $derived(flatVisibleNodes(items, fields))

			expect($state.snapshot(data.length)).toEqual(3)
			items[0].children = [{ text: 'AA' }, { text: 'AB' }]
			expect($state.snapshot(data.length)).toEqual(3)
			items[0]._expanded = true
			expect($state.snapshot(data.length)).toEqual(5)

			items[0]._expanded = true
			expect($state.snapshot(data).length).toEqual(5)
			items[0].children[1].children = [{ text: 'ABA' }]
			expect($state.snapshot(data).length).toEqual(5)
			items[0].children[1]._expanded = true
			expect($state.snapshot(data).length).toEqual(6)
		})

		it('should work with custom fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', expanded: 'open' }
			const data = $derived(flatVisibleNodes(items, fields))

			expect($state.snapshot(data.length)).toEqual(3)
			items[0].items = [{ text: 'AA' }, { text: 'AB' }]
			expect($state.snapshot(data.length)).toEqual(3)
			items[0].open = true
			expect($state.snapshot(data.length)).toEqual(5)

			items[0].open = true
			expect($state.snapshot(data).length).toEqual(5)
			items[0].items[1].items = [{ text: 'ABA' }]
			expect($state.snapshot(data).length).toEqual(5)
			items[0].items[1].open = true
			expect($state.snapshot(data).length).toEqual(6)
		})

		it('should handle nested custom fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', expanded: 'open', fields: { children: 'children' } }
			const data = $derived(flatVisibleNodes(items, fields))

			expect($state.snapshot(data.length)).toEqual(3)
			items[0].items = [{ text: 'AA' }, { text: 'AB' }]
			expect($state.snapshot(data.length)).toEqual(3)
			items[0].open = true
			expect($state.snapshot(data.length)).toEqual(5)

			items[0].open = true
			expect($state.snapshot(data).length).toEqual(5)
			items[0].items[1].children = [{ text: 'ABA' }]
			expect($state.snapshot(data).length).toEqual(5)
			items[0].items[1]._expanded = true
			expect($state.snapshot(data).length).toEqual(6)
		})

		it('should allow finding fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', expanded: 'open', fields: { children: 'children' } }
			const data = $derived(flatVisibleNodes(items, fields))

			const result = data.findIndex((row) => equals(row.value, { text: 'B' }))
			expect(result).toEqual(1)
		})
	})
	describe('deriveLookup', () => {
		it('should handle a string array', () => {
			let items = $state(['A', 'B', 'C'])
			const lookup = $derived(deriveLookup(items))
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: 'A' },
				1: { depth: 0, value: 'B' },
				2: { depth: 0, value: 'C' }
			})

			items.push('D')
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: 'A' },
				1: { depth: 0, value: 'B' },
				2: { depth: 0, value: 'C' },
				3: { depth: 0, value: 'D' }
			})

			items = ['B', 'C', 'D']
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: 'B' },
				1: { depth: 0, value: 'C' },
				2: { depth: 0, value: 'D' }
			})
		})

		it('should handle an object array', () => {
			let items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const lookup = $derived(deriveLookup(items))
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: { text: 'A' } },
				1: { depth: 0, value: { text: 'B' } },
				2: { depth: 0, value: { text: 'C' } }
			})

			items.push({ text: 'D' })
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: { text: 'A' } },
				1: { depth: 0, value: { text: 'B' } },
				2: { depth: 0, value: { text: 'C' } },
				3: { depth: 0, value: { text: 'D' } }
			})

			items = [{ text: 'B' }, { text: 'C' }, { text: 'D' }]
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: { text: 'B' } },
				1: { depth: 0, value: { text: 'C' } },
				2: { depth: 0, value: { text: 'D' } }
			})
		})

		it('should handle a nested array', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const lookup = $derived(deriveLookup(items))
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: { text: 'A' } },
				1: { depth: 0, value: { text: 'B' } },
				2: { depth: 0, value: { text: 'C' } }
			})
			items[0].children = [{ text: 'A1' }, { text: 'A2' }]
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: { text: 'A', children: [{ text: 'A1' }, { text: 'A2' }] } },
				'0-0': { depth: 1, value: { text: 'A1' } },
				'0-1': { depth: 1, value: { text: 'A2' } },
				1: { depth: 0, value: { text: 'B' } },
				2: { depth: 0, value: { text: 'C' } }
			})

			items[0].children[1].children = [{ text: 'A21' }, { text: 'A22' }]
			expect(Object.keys($state.snapshot(lookup)).sort()).toEqual([
				'0',
				'0-0',
				'0-1',
				'0-1-0',
				'0-1-1',
				'1',
				'2'
			])
		})

		it('should handle custom fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', fields: { children: 'values' } }
			const lookup = $derived(deriveLookup(items, fields))
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: { text: 'A' } },
				1: { depth: 0, value: { text: 'B' } },
				2: { depth: 0, value: { text: 'C' } }
			})
			items[0].items = [{ text: 'A1' }, { text: 'A2' }]
			expect($state.snapshot(lookup)).toEqual({
				0: { depth: 0, value: { text: 'A', items: [{ text: 'A1' }, { text: 'A2' }] } },
				'0-0': { depth: 1, value: { text: 'A1' } },
				'0-1': { depth: 1, value: { text: 'A2' } },
				1: { depth: 0, value: { text: 'B' } },
				2: { depth: 0, value: { text: 'C' } }
			})

			items[0].items[1].values = [{ text: 'A21' }, { text: 'A22' }]
			expect(Object.keys($state.snapshot(lookup)).sort()).toEqual([
				'0',
				'0-0',
				'0-1',
				'0-1-0',
				'0-1-1',
				'1',
				'2'
			])
			items[0].items[1].values[0].values = [{ text: 'A211' }, { text: 'A222' }]
			expect(Object.keys($state.snapshot(lookup)).sort()).toEqual([
				'0',
				'0-0',
				'0-1',
				'0-1-0',
				'0-1-0-0',
				'0-1-0-1',
				'0-1-1',
				'1',
				'2'
			])
			expect($state.snapshot(lookup)['0-1-0-0'].value).toEqual(
				items[0].items[1].values[0].values[0]
			)
			lookup['0-1-0-0'].value.selected = true
			flushSync()
			expect($state.snapshot(items[0].items[1].values[0].values[0])).toEqual({
				text: 'A211',
				selected: true
			})
		})
	})
})
