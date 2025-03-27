import { describe, it, expect } from 'vitest'
import { flatVisibleNodes, deriveLookupWithProxy } from '../src/derive.svelte'
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
	describe('deriveLookupWithProxy', () => {
		it('should handle a string array', () => {
			let items = $state(['A', 'B', 'C'])
			const lookup = $derived(deriveLookupWithProxy(items))
			let result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual(['0', '1', '2'])
			expect(result.get('0').value).toEqual({ text: 'A' })
			expect(result.get('1').value).toEqual({ text: 'B' })
			expect(result.get('2').value).toEqual({ text: 'C' })

			items.push('D')
			result = $state.snapshot(lookup)
			expect(result.get('3').value).toEqual({ text: 'D' })

			items = ['B', 'C', 'D']
			result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual(['0', '1', '2'])
			expect(result.get('0').value).toEqual({ text: 'B' })
			expect(result.get('1').value).toEqual({ text: 'C' })
			expect(result.get('2').value).toEqual({ text: 'D' })
		})

		it('should handle an object array', () => {
			let items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const lookup = $derived(deriveLookupWithProxy(items))
			let result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual(['0', '1', '2'])
			expect(result.get('0').value).toEqual({ text: 'A' })
			expect(result.get('1').value).toEqual({ text: 'B' })
			expect(result.get('2').value).toEqual({ text: 'C' })

			items.push({ text: 'D' })
			result = $state.snapshot(lookup)
			expect(result.get('3').value).toEqual({ text: 'D' })

			items = [{ text: 'B' }, { text: 'C' }, { text: 'D' }]
			result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual(['0', '1', '2'])
			expect(result.get('0').value).toEqual({ text: 'B' })
			expect(result.get('1').value).toEqual({ text: 'C' })
			expect(result.get('2').value).toEqual({ text: 'D' })
		})

		it('should handle a nested array', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const lookup = $derived(deriveLookupWithProxy(items))
			let result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual(['0', '1', '2'])
			expect(result.get('0').value).toEqual(items[0])
			expect(result.get('1').value).toEqual(items[1])
			expect(result.get('2').value).toEqual(items[2])

			items[0].children = [{ text: 'A1' }, { text: 'A2' }]
			result = $state.snapshot(lookup)

			expect(Array.from(result.keys())).toEqual(['0', '0-0', '0-1', '1', '2'])
			expect(result.get('0').value).toEqual(items[0])
			expect(result.get('0-0').value).toEqual(items[0].children[0])
			expect(result.get('0-1').value).toEqual(items[0].children[1])

			items[0].children[1].children = [{ text: 'A21' }, { text: 'A22' }]
			result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual(['0', '0-0', '0-1', '0-1-0', '0-1-1', '1', '2'])
			lookup.get('0-1-0').value.selected = true
			expect($state.snapshot(items[0].children[1].children[0])).toEqual({
				text: 'A21',
				selected: true
			})
		})

		it('should handle custom fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', fields: { children: 'values' } }
			const lookup = $derived(deriveLookupWithProxy(items, fields))
			let result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual(['0', '1', '2'])
			expect(result.get('0').value).toEqual(items[0])
			expect(result.get('1').value).toEqual(items[1])
			expect(result.get('2').value).toEqual(items[2])

			items[0].items = [{ text: 'A1' }, { text: 'A2' }]
			result = $state.snapshot(lookup)

			expect(Array.from(result.keys())).toEqual(['0', '0-0', '0-1', '1', '2'])
			expect(result.get('0').value).toEqual(items[0])
			expect(result.get('0-0').value).toEqual(items[0].items[0])
			expect(result.get('0-1').value).toEqual(items[0].items[1])

			items[0].items[1].values = [{ text: 'A21' }, { text: 'A22' }]
			result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual(['0', '0-0', '0-1', '0-1-0', '0-1-1', '1', '2'])
			items[0].items[1].values[0].values = [{ text: 'A211' }, { text: 'A222' }]
			result = $state.snapshot(lookup)
			expect(Array.from(result.keys())).toEqual([
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
			expect(result.get('0-1-0-0').value).toEqual(items[0].items[1].values[0].values[0])
			lookup.get('0-1-0-0').value.selected = true
			flushSync()
			expect($state.snapshot(items[0].items[1].values[0].values[0])).toEqual({
				text: 'A211',
				selected: true
			})
		})
	})
})
