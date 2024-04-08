import { describe, expect, it } from 'vitest'
import { compare, quickSearch, list } from '../src/list'
import * as context from './fixtures/list-data'

describe('List Data', () => {
	it('Should create a list', () => {
		const lst = list(context.data)
		expect(lst.data).toBe(context.data)
		expect(lst.primaryKey).toBe('id')
		expect(lst.searchText).toBe('')
		expect(lst.sortKey).toBeFalsy()
		expect(lst.sortUsing).toBeFalsy()
		expect(lst.groupKey).toBeFalsy()
		expect(lst.filterKey).toBeFalsy()
		expect(lst.filterUsing).toBeFalsy()
		expect(lst.current()).toBe(context.data)
	})

	it('Should create a sorted list', () => {
		const lst = list([...context.data]).sortBy('name')

		expect(lst.data).toEqual(context.sorted)
		expect(lst.primaryKey).toBe('id')
		expect(lst.searchText).toBe('')
		expect(lst.sortKey).toBe('name')
		expect(lst.sortUsing).toEqual(compare)
		expect(lst.groupKey).toBeFalsy()
		expect(lst.filterKey).toBeFalsy()
		expect(lst.filterUsing).toBeFalsy()
		expect(lst.current()).toEqual(context.sorted)
	})

	it('Should create a grouped list', () => {
		const lst = list([...context.data]).groupBy('lookup_id', context.lookup)

		expect(lst.data).toEqual(context.data)
		expect(lst.primaryKey).toBe('id')
		expect(lst.searchText).toBe('')
		expect(lst.sortKey).toBeFalsy()
		expect(lst.sortUsing).toBeFalsy()
		expect(lst.groupKey).toBe('lookup_id')
		expect(lst.filterKey).toBeFalsy()
		expect(lst.filterUsing).toBeFalsy()
		expect(lst.current()).toEqual(context.grouped)
	})
	it('Should create a sorted and grouped list', () => {
		const lst = list([...context.data])
			.sortBy('name')
			.groupBy('lookup_id', context.lookup)

		expect(lst.data).toEqual(context.sorted)
		expect(lst.primaryKey).toBe('id')
		expect(lst.searchText).toBe('')
		expect(lst.sortKey).toBe('name')
		expect(lst.sortUsing).toBe(compare)
		expect(lst.groupKey).toBe('lookup_id')
		expect(lst.filterKey).toBeFalsy()
		expect(lst.filterUsing).toBeFalsy()
		expect(lst.current()).toEqual(context.sortedAndGrouped)
	})

	it('Should create a searchable list', () => {
		const lst = list([...context.data]).filterBy('name')

		expect(lst.data).toEqual(context.data)
		expect(lst.primaryKey).toBe('id')
		expect(lst.searchText).toBe('')
		expect(lst.sortKey).toBeFalsy()
		expect(lst.sortUsing).toBeFalsy()
		expect(lst.groupKey).toBeFalsy()
		expect(lst.filterKey).toBe('name')
		expect(lst.filterUsing).toBe(quickSearch)
		expect(lst.current()).toEqual(context.data)

		lst.search('Alpha')
		expect(lst.current()).toEqual(context.searchResult)
	})

	it('Should create a searchable sorted list', () => {
		const lst = list([...context.data])
			.filterBy('name')
			.sortBy('name')

		expect(lst.data).toEqual(context.sorted)
		expect(lst.primaryKey).toBe('id')
		expect(lst.searchText).toBe('')
		expect(lst.sortKey).toBe('name')
		expect(lst.sortUsing).toBe(compare)
		expect(lst.groupKey).toBeFalsy()
		expect(lst.filterKey).toBe('name')
		expect(lst.filterUsing).toBe(quickSearch)
		expect(lst.current()).toEqual(context.sorted)

		lst.search('Alpha')
		expect(lst.current()).toEqual(context.searchResult)
	})

	it('Should create a searchable grouped list', () => {
		const lst = list([...context.data])
			.filterBy('name')
			.groupBy('lookup_id', context.lookup)

		expect(lst.data).toEqual(context.data)
		expect(lst.primaryKey).toBe('id')
		expect(lst.searchText).toBe('')
		expect(lst.sortKey).toBeFalsy()
		expect(lst.sortUsing).toBeFalsy()
		expect(lst.groupKey).toBe('lookup_id')
		expect(lst.filterKey).toBe('name')
		expect(lst.filterUsing).toBe(quickSearch)
		expect(lst.current()).toEqual(context.grouped)

		lst.search('Alpha')
		expect(lst.current()).toEqual(context.groupSearchResult)
	})

	it('Should create a searchable sorted & grouped list', () => {
		const lst = list([...context.data])
			.filterBy('name')
			.sortBy('name')
			.groupBy('lookup_id', context.lookup)

		expect(lst.data).toEqual(context.sorted)
		expect(lst.primaryKey, 'id')
		expect(lst.searchText, '')
		expect(lst.sortKey, 'name')
		expect(lst.sorter, compare)
		expect(lst.groupKey, 'lookup_id')
		expect(lst.filterKey, 'name')
		expect(lst.filter, quickSearch)
		expect(lst.current()).toEqual(context.sortedAndGrouped)

		lst.search('Alpha')
		expect(lst.current()).toEqual(context.groupSearchResult)
	})

	it('Should add an item to list', () => {
		const data = context.add
		const lst = list([...data.start])

		data.additions.forEach(({ item, result }) => {
			lst.add(item)
			expect(lst.data).toEqual(result.data.unsorted)
			expect(lst.current()).toEqual(result.data.unsorted, 'Should update store after add')
		})
	})

	it('Should add an item to sorted list', () => {
		const data = context.add
		const lst = list([...data.start]).sortBy('id')

		data.additions.forEach(({ item, result }) => {
			lst.add(item)
			expect(lst.data).toEqual(result.data.sorted)
			expect(lst.current()).toEqual(result.data.sorted, 'Should update store after add')
		})
	})

	it('Should add an item to grouped list', () => {
		const data = context.add
		const lst = list([...data.start]).groupBy('lookup_id', context.lookup)

		data.additions.forEach(({ item, result }) => {
			lst.add(item)
			expect(lst.data).toEqual(result.data.unsorted)
			expect(lst.current()).toEqual(result.grouped.unsorted, 'Should update store after add')
		})
	})

	it('Should add an item to sorted and grouped list', () => {
		const data = context.add
		const lst = list([...data.start])
			.groupBy('lookup_id', context.lookup)
			.sortBy('id')

		data.additions.forEach(({ item, result }) => {
			lst.add(item)
			expect(lst.data).toEqual(result.data.sorted)
			expect(lst.current()).toEqual(result.grouped.sorted, 'Should update store after add')
		})
	})

	it('Should remove an item from list', () => {
		const data = context.remove
		const lst = list([...data.start])

		data.removals.forEach(({ item, result }) => {
			lst.remove(item)
			expect(lst.data).toEqual(result.data.unsorted)
			expect(lst.current()).toEqual(result.data.unsorted, 'Should update store after remove')
		})
	})

	it('Should remove an item from sorted list', () => {
		const data = context.remove
		const lst = list([...data.start]).sortBy('name')

		data.removals.forEach(({ item, result }) => {
			lst.remove(item)
			expect(lst.data).toEqual(result.data.sorted)
			expect(lst.current()).toEqual(result.data.sorted, 'Should update store after remove')
		})
	})

	it('Should remove an item from grouped list', () => {
		const data = context.remove
		const lst = list([...data.start]).groupBy('lookup_id', data.lookup)

		data.removals.forEach(({ item, result }) => {
			lst.remove(item)
			expect(lst.data).toEqual(result.data.unsorted)
			expect(lst.current()).toEqual(result.grouped.unsorted, 'Should update store after remove')
		})
	})

	it('Should remove an item from sorted and grouped list', () => {
		const data = context.remove
		const lst = list([...data.start])
			.groupBy('lookup_id', data.lookup)
			.sortBy('name')

		data.removals.forEach(({ item, result }) => {
			lst.remove(item)
			expect(lst.data).toEqual(result.data.sorted)
			expect(lst.current()).toEqual(result.grouped.sorted, 'Should update store after remove')
		})
	})

	it('Should modify an item in list', () => {
		const data = context.modify
		const lst = list([...data.start])

		data.modifications.forEach(({ item, result }) => {
			lst.modify(item)

			expect(lst.data).toEqual(result.data.unsorted)
			expect(lst.current()).toEqual(result.data.unsorted, 'Should update store after modify')
		})
	})

	it('Should modify an item in sorted list', () => {
		const data = context.modify
		const lst = list([...data.start]).sortBy('name')

		data.modifications.forEach(({ item, result }) => {
			lst.modify(item)
			expect(lst.data).toEqual(result.data.sorted)
			expect(lst.current()).toEqual(result.data.sorted, 'Should update store after modify')
		})
	})

	it('Should modify an item in grouped list', () => {
		const data = context.modify
		const lst = list([...data.start]).groupBy('lookup_id', data.lookup)

		data.modifications.forEach(({ item, result }) => {
			lst.modify(item)
			expect(lst.data).toEqual(result.data.unsorted)
			expect(lst.current()).toEqual(result.grouped.unsorted, 'Should update store after modify')
		})
	})

	it('Should modify an item in sorted and grouped list', () => {
		const data = context.modify
		const lst = list([...data.start])
			.groupBy('lookup_id', data.lookup)
			.sortBy('name')

		data.modifications.forEach(({ item, result }) => {
			lst.modify(item)
			expect(lst.data).toEqual(result.grouped.data)
			expect(lst.current()).toEqual(result.grouped.sorted, 'Should update store after modify')
		})
	})

	it('Should handle alternate key', () => {
		const { start, actions } = context.altKey

		const lst = list([...start]).key('key')
		lst.add(actions.add.item)
		expect(lst.data).toEqual(actions.add.result)
		lst.remove(actions.remove.item)
		expect(lst.data).toEqual(actions.remove.result)
		lst.modify(actions.modify.item)
		expect(lst.data).toEqual(actions.modify.result)
	})

	it('Should handle missing lookup', () => {
		const { start, lookup } = context.altKey

		const lst = list([...start])
			.key('key')
			.groupBy('lookup_key')
		expect(lst.lookup).toEqual(lookup)
	})

	it('Should sort by group first', () => {
		const lst = list([...context.sorting.items])
			.groupBy('lookup_id', context.sorting.lookup)
			.sortBy('name')
		lst.data.sort((a, b) => compare(a, b, lst))
		expect(lst.data).toEqual(context.sorting.result.data)
	})

	it('Should handle alternate key (missing)', () => {
		const input = [{ name: 'alpha' }, { name: 'beta' }, { name: 'charlie' }]

		const lst = list([...input])
			.key('key')
			.sortBy('name')

		expect(lst.data.length).toBe(3)
		expect(lst.data.map(({ key }) => key).length).toBe(3)

		let delta = { name: 'delta' }
		lst.add(delta)
		expect(lst.data.length).toBe(4)
		const beta = lst.data.find(({ name }) => name === 'beta')

		lst.remove(beta)
		expect(lst.data.length).toEqual(3)
		delta = { ...lst.data.find(({ name }) => name === 'delta'), name: 'foxtrot' }
		lst.modify(delta)
		expect(lst.data.length).toBe(3)
		const modifiedItem = lst.data.find(({ key }) => key === delta.key)
		expect(modifiedItem).toEqual({ key: delta.key, name: 'foxtrot' })
	})
})
