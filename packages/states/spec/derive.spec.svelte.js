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

			const fetchLength = () => data.length
			expect(fetchLength()).toEqual(3)
			items[0].children = [{ text: 'AA' }, { text: 'AB' }]
			expect(fetchLength()).toEqual(3)
			items[0]._expanded = true
			expect(fetchLength()).toEqual(5)

			items[0]._expanded = true
			expect(fetchLength()).toEqual(5)
			items[0].children[1].children = [{ text: 'ABA' }]
			expect(fetchLength()).toEqual(5)
			items[0].children[1]._expanded = true
			expect(fetchLength()).toEqual(6)
		})

		it('should work with custom fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', expanded: 'open' }
			const data = $derived(flatVisibleNodes(items, fields))
			const fetchLength = () => data.length
			expect(fetchLength()).toEqual(3)
			items[0].items = [{ text: 'AA' }, { text: 'AB' }]
			expect(fetchLength()).toEqual(3)
			items[0].open = true
			expect(fetchLength()).toEqual(5)

			items[0].open = true
			expect(fetchLength()).toEqual(5)
			items[0].items[1].items = [{ text: 'ABA' }]
			expect(fetchLength()).toEqual(5)
			items[0].items[1].open = true
			expect(fetchLength()).toEqual(6)
		})

		it('should handle nested custom fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', expanded: 'open', fields: { children: 'children' } }
			const data = $derived(flatVisibleNodes(items, fields))
			const fetchLength = () => data.length
			expect(fetchLength()).toEqual(3)
			items[0].items = [{ text: 'AA' }, { text: 'AB' }]
			expect(fetchLength()).toEqual(3)
			items[0].open = true
			expect(fetchLength()).toEqual(5)

			items[0].open = true
			expect(fetchLength()).toEqual(5)
			items[0].items[1].children = [{ text: 'ABA' }]
			expect(fetchLength()).toEqual(5)
			items[0].items[1]._expanded = true
			expect(fetchLength()).toEqual(6)
		})

		it('should allow finding fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', expanded: 'open', fields: { children: 'children' } }
			const data = $derived(flatVisibleNodes(items, fields))
			const getCurrent = () => data
			const result = getCurrent().findIndex((row) => equals(row.value, { text: 'B' }))
			expect(result).toEqual(1)
		})
	})
	describe('deriveLookupWithProxy', () => {
		it('should handle a string array', () => {
			let items = $state(['A', 'B', 'C'])
			const lookup = $derived(deriveLookupWithProxy(items))
			const result = () => lookup
			expect(Array.from(result().keys())).toEqual(['0', '1', '2'])
			expect(result().get('0').value).toEqual('A')
			expect(result().get('1').value).toEqual('B')
			expect(result().get('2').value).toEqual('C')

			const add = () => items.push('D')
			add()
			// result = $state.snapshot(lookup)
			expect(result().get('3').value).toEqual('D')

			items = ['B', 'C', 'D']
			// result = $state.snapshot(lookup)
			expect(Array.from(result().keys())).toEqual(['0', '1', '2'])
			expect(result().get('0').value).toEqual('B')
			expect(result().get('1').value).toEqual('C')
			expect(result().get('2').value).toEqual('D')
		})

		it('should handle an object array', () => {
			let items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const lookup = $derived(deriveLookupWithProxy(items))
			const result = () => lookup
			expect(Array.from(result().keys())).toEqual(['0', '1', '2'])
			expect(result().get('0').value).toEqual({ text: 'A' })
			expect(result().get('1').value).toEqual({ text: 'B' })
			expect(result().get('2').value).toEqual({ text: 'C' })

			const add = () => items.push({ text: 'D' })
			add()

			expect(result().get('3').value).toEqual({ text: 'D' })

			items = [{ text: 'B' }, { text: 'C' }, { text: 'D' }]

			expect(Array.from(result().keys())).toEqual(['0', '1', '2'])
			expect(result().get('0').value).toEqual({ text: 'B' })
			expect(result().get('1').value).toEqual({ text: 'C' })
			expect(result().get('2').value).toEqual({ text: 'D' })
		})

		it('should handle a nested array', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const lookup = $derived(deriveLookupWithProxy(items))
			const result = () => lookup
			const getItems = () => items

			expect(Array.from(result().keys())).toEqual(['0', '1', '2'])
			expect(result().get('0').value).toEqual(items[0])
			expect(result().get('1').value).toEqual(items[1])
			expect(result().get('2').value).toEqual(items[2])

			const addChildren = () => {
				items[0].children = [{ text: 'A1' }, { text: 'A2' }]
			}
			addChildren()
			flushSync()
			expect(Array.from(result().keys())).toEqual(['0', '0-0', '0-1', '1', '2'])
			expect(result().get('0').value).toEqual(items[0])
			expect(result().get('0-0').value).toEqual(items[0].children[0])
			expect(result().get('0-1').value).toEqual(items[0].children[1])

			items[0].children[1].children = [{ text: 'A21' }, { text: 'A22' }]

			expect(Array.from(result().keys())).toEqual(['0', '0-0', '0-1', '0-1-0', '0-1-1', '1', '2'])

			const updateSelected = (key, value) => (lookup.get(key).value.selected = value)
			updateSelected('0-1-0', true)
			expect(getItems()[0].children[1].children[0]).toEqual({
				text: 'A21',
				selected: true
			})
		})

		it('should handle custom fields', () => {
			const items = $state([{ text: 'A' }, { text: 'B' }, { text: 'C' }])
			const fields = { children: 'items', fields: { children: 'values' } }
			const lookup = $derived(deriveLookupWithProxy(items, fields))
			const result = () => lookup
			const getItems = () => items

			expect(Array.from(result().keys())).toEqual(['0', '1', '2'])
			expect(result().get('0').value).toEqual(items[0])
			expect(result().get('1').value).toEqual(items[1])
			expect(result().get('2').value).toEqual(items[2])

			items[0].items = [{ text: 'A1' }, { text: 'A2' }]

			expect(Array.from(result().keys())).toEqual(['0', '0-0', '0-1', '1', '2'])
			expect(result().get('0').value).toEqual(items[0])
			expect(result().get('0-0').value).toEqual(items[0].items[0])
			expect(result().get('0-1').value).toEqual(items[0].items[1])

			items[0].items[1].values = [{ text: 'A21' }, { text: 'A22' }]

			expect(Array.from(result().keys())).toEqual(['0', '0-0', '0-1', '0-1-0', '0-1-1', '1', '2'])
			items[0].items[1].values[0].values = [{ text: 'A211' }, { text: 'A222' }]

			expect(Array.from(result().keys())).toEqual([
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
			expect(result().get('0-1-0-0').value).toEqual(items[0].items[1].values[0].values[0])

			const updateSelected = (key, value) => (lookup.get(key).value.selected = value)
			updateSelected('0-1-0-0', true)

			flushSync()

			expect(getItems()[0].items[1].values[0].values[0]).toEqual({
				text: 'A211',
				selected: true
			})
		})
	})
})
