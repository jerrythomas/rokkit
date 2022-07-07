import { describe, expect, it } from 'vitest'
import { compare, quickSearch, list } from '../src/lib/list'
import * as context from './fixtures/list-data'
import { getSubscribedData } from './helpers.js'

describe('List Data', () => {
	it('Should create a list', () => {
		let l = list(context.data)
		expect(l.data).toBe(context.data)
		expect(l.primaryKey).toBe('id')
		expect(l.searchText).toBe('')
		expect(l.sortKey).toBeFalsy()
		expect(l.sortUsing).toBeFalsy()
		expect(l.groupKey).toBeFalsy()
		expect(l.filterKey).toBeFalsy()
		expect(l.filterUsing).toBeFalsy()
		expect(getSubscribedData(l.filtered)).toBe(context.data)
	})

	it('Should create a sorted list', () => {
		let l = list([...context.data]).sortBy('name')

		expect(l.data).toEqual(context.sorted)
		expect(l.primaryKey).toBe('id')
		expect(l.searchText).toBe('')
		expect(l.sortKey).toBe('name')
		expect(l.sortUsing).toEqual(compare)
		expect(l.groupKey).toBeFalsy()
		expect(l.filterKey).toBeFalsy()
		expect(l.filterUsing).toBeFalsy()
		expect(getSubscribedData(l.filtered)).toEqual(context.sorted)
	})

	it('Should create a grouped list', () => {
		let l = list([...context.data]).groupBy('lookup_id', context.lookup)

		expect(l.data).toEqual(context.data)
		expect(l.primaryKey).toBe('id')
		expect(l.searchText).toBe('')
		expect(l.sortKey).toBeFalsy()
		expect(l.sortUsing).toBeFalsy()
		expect(l.groupKey).toBe('lookup_id')
		expect(l.filterKey).toBeFalsy()
		expect(l.filterUsing).toBeFalsy()
		expect(getSubscribedData(l.filtered)).toEqual(context.grouped)
	})
	it('Should create a sorted and grouped list', () => {
		let l = list([...context.data])
			.sortBy('name')
			.groupBy('lookup_id', context.lookup)

		expect(l.data).toEqual(context.sorted)
		expect(l.primaryKey).toBe('id')
		expect(l.searchText).toBe('')
		expect(l.sortKey).toBe('name')
		expect(l.sortUsing).toBe(compare)
		expect(l.groupKey).toBe('lookup_id')
		expect(l.filterKey).toBeFalsy()
		expect(l.filterUsing).toBeFalsy()
		expect(getSubscribedData(l.filtered)).toEqual(context.sortedAndGrouped)
	})

	it('Should create a searchable list', () => {
		let l = list([...context.data]).filterBy('name')

		expect(l.data).toEqual(context.data)
		expect(l.primaryKey).toBe('id')
		expect(l.searchText).toBe('')
		expect(l.sortKey).toBeFalsy()
		expect(l.sortUsing).toBeFalsy()
		expect(l.groupKey).toBeFalsy()
		expect(l.filterKey).toBe('name')
		expect(l.filterUsing).toBe(quickSearch)
		expect(getSubscribedData(l.filtered)).toEqual(context.data)

		l.search('Alpha')
		expect(getSubscribedData(l.filtered)).toEqual(context.searchResult)
	})

	it('Should create a searchable sorted list', () => {
		let l = list([...context.data])
			.filterBy('name')
			.sortBy('name')

		expect(l.data).toEqual(context.sorted)
		expect(l.primaryKey).toBe('id')
		expect(l.searchText).toBe('')
		expect(l.sortKey).toBe('name')
		expect(l.sortUsing).toBe(compare)
		expect(l.groupKey).toBeFalsy()
		expect(l.filterKey).toBe('name')
		expect(l.filterUsing).toBe(quickSearch)
		expect(getSubscribedData(l.filtered)).toEqual(context.sorted)

		l.search('Alpha')
		expect(getSubscribedData(l.filtered)).toEqual(context.searchResult)
	})

	it('Should create a searchable grouped list', () => {
		let l = list([...context.data])
			.filterBy('name')
			.groupBy('lookup_id', context.lookup)

		expect(l.data).toEqual(context.data)
		expect(l.primaryKey).toBe('id')
		expect(l.searchText).toBe('')
		expect(l.sortKey).toBeFalsy()
		expect(l.sortUsing).toBeFalsy()
		expect(l.groupKey).toBe('lookup_id')
		expect(l.filterKey).toBe('name')
		expect(l.filterUsing).toBe(quickSearch)
		expect(getSubscribedData(l.filtered)).toEqual(context.grouped)

		l.search('Alpha')
		expect(getSubscribedData(l.filtered)).toEqual(context.groupSearchResult)
	})

	it('Should create a searchable sorted & grouped list', () => {
		let l = list([...context.data])
			.filterBy('name')
			.sortBy('name')
			.groupBy('lookup_id', context.lookup)

		expect(l.data).toEqual(context.sorted)
		expect(l.primaryKey, 'id')
		expect(l.searchText, '')
		expect(l.sortKey, 'name')
		expect(l.sorter, compare)
		expect(l.groupKey, 'lookup_id')
		expect(l.filterKey, 'name')
		expect(l.filter, quickSearch)
		expect(getSubscribedData(l.filtered)).toEqual(context.sortedAndGrouped)

		l.search('Alpha')
		expect(getSubscribedData(l.filtered)).toEqual(context.groupSearchResult)
	})

	it('Should add an item to list', () => {
		const data = context.add
		let l = list([...data.start])

		data.additions.map(({ item, result }) => {
			l.add(item)
			expect(l.data).toEqual(result.data.unsorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.data.unsorted,
				'Should update store after add'
			)
		})
	})

	it('Should add an item to sorted list', () => {
		const data = context.add
		let l = list([...data.start]).sortBy('id')

		data.additions.map(({ item, result }) => {
			l.add(item)
			expect(l.data).toEqual(result.data.sorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.data.sorted,
				'Should update store after add'
			)
		})
	})

	it('Should add an item to grouped list', () => {
		const data = context.add
		let l = list([...data.start]).groupBy('lookup_id', context.lookup)

		data.additions.map(({ item, result }) => {
			l.add(item)
			expect(l.data).toEqual(result.data.unsorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.grouped.unsorted,
				'Should update store after add'
			)
		})
	})

	it('Should add an item to sorted and grouped list', () => {
		const data = context.add
		let l = list([...data.start])
			.groupBy('lookup_id', context.lookup)
			.sortBy('id')

		data.additions.map(({ item, result }) => {
			l.add(item)
			expect(l.data).toEqual(result.data.sorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.grouped.sorted,
				'Should update store after add'
			)
		})
	})

	it('Should remove an item from list', () => {
		const data = context.remove
		let l = list([...data.start])

		data.removals.map(({ item, result }) => {
			l.remove(item)
			expect(l.data).toEqual(result.data.unsorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.data.unsorted,
				'Should update store after remove'
			)
		})
	})

	it('Should remove an item from sorted list', () => {
		const data = context.remove
		let l = list([...data.start]).sortBy('name')

		data.removals.map(({ item, result }) => {
			l.remove(item)
			expect(l.data).toEqual(result.data.sorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.data.sorted,
				'Should update store after remove'
			)
		})
	})

	it('Should remove an item from grouped list', () => {
		const data = context.remove
		let l = list([...data.start]).groupBy('lookup_id', data.lookup)

		data.removals.map(({ item, result }) => {
			l.remove(item)
			expect(l.data).toEqual(result.data.unsorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.grouped.unsorted,
				'Should update store after remove'
			)
		})
	})

	it('Should remove an item from sorted and grouped list', () => {
		const data = context.remove
		let l = list([...data.start])
			.groupBy('lookup_id', data.lookup)
			.sortBy('name')

		data.removals.map(({ item, result }) => {
			l.remove(item)
			expect(l.data).toEqual(result.data.sorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.grouped.sorted,
				'Should update store after remove'
			)
		})
	})

	it('Should modify an item in list', () => {
		const data = context.modify
		let l = list([...data.start])

		data.modifications.map(({ item, result }) => {
			l.modify(item)

			expect(l.data).toEqual(result.data.unsorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.data.unsorted,
				'Should update store after modify'
			)
		})
	})

	it('Should modify an item in sorted list', () => {
		const data = context.modify
		let l = list([...data.start]).sortBy('name')

		data.modifications.map(({ item, result }) => {
			l.modify(item)
			expect(l.data).toEqual(result.data.sorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.data.sorted,
				'Should update store after modify'
			)
		})
	})

	it('Should modify an item in grouped list', () => {
		const data = context.modify
		let l = list([...data.start]).groupBy('lookup_id', data.lookup)

		data.modifications.map(({ item, result }) => {
			l.modify(item)
			expect(l.data).toEqual(result.data.unsorted)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.grouped.unsorted,
				'Should update store after modify'
			)
		})
	})

	it('Should modify an item in sorted and grouped list', () => {
		const data = context.modify
		let l = list([...data.start])
			.groupBy('lookup_id', data.lookup)
			.sortBy('name')

		data.modifications.map(({ item, result }) => {
			l.modify(item)
			expect(l.data).toEqual(result.grouped.data)
			expect(getSubscribedData(l.filtered)).toEqual(
				result.grouped.sorted,
				'Should update store after modify'
			)
		})
	})

	it('Should handle alternate key', () => {
		const { start, actions } = context.altKey

		let l = list([...start]).key('key')
		l.add(actions.add.item)
		expect(l.data).toEqual(actions.add.result)
		l.remove(actions.remove.item)
		expect(l.data).toEqual(actions.remove.result)
		l.modify(actions.modify.item)
		expect(l.data).toEqual(actions.modify.result)
	})

	it('Should handle missing lookup', () => {
		const { start, lookup } = context.altKey

		let l = list([...start])
			.key('key')
			.groupBy('lookup_key')
		expect(l.lookup).toEqual(lookup)
	})

	it('Should sort by group first', () => {
		let l = list([...context.sorting.items])
			.groupBy('lookup_id', context.sorting.lookup)
			.sortBy('name')
		l.data.sort((a, b) => compare(a, b, l))
		expect(l.data).toEqual(context.sorting.result.data)
	})

	it('Should handle alternate key (missing)', () => {
		const input = [{ name: 'alpha' }, { name: 'beta' }, { name: 'charlie' }]

		let l = list([...input])
			.key('key')
			.sortBy('name')

		expect(l.data.length).toBe(3)
		expect(l.data.map(({ key }) => key).length).toBe(3)

		let delta = { name: 'delta' }
		l.add(delta)
		expect(l.data.length).toBe(4)
		let beta = l.data.find(({ name }) => name === 'beta')

		l.remove(beta)
		expect(l.data.length).toEqual(3)
		delta = { ...l.data.find(({ name }) => name === 'delta'), name: 'foxtrot' }
		l.modify(delta)
		expect(l.data.length).toBe(3)
		let modifiedItem = l.data.find(({ key }) => key === delta.key)
		expect(modifiedItem).toEqual({ key: delta.key, name: 'foxtrot' })
	})
})
