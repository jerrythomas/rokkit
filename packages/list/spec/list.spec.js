import fs from 'fs'
import yaml from 'js-yaml'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { compare, quickSearch } from '../src/list.js'
import { list } from '../src/index.js'
import { nest } from 'd3-collection'
import { getSubscribedData } from './helpers.js'

const ListSuite = suite('List Data')

ListSuite.before(async (context) => {
	context.data = [
		{ id: 2, name: 'Beta', lookup_id: 1 },
		{ id: 3, name: 'Charlie', lookup_id: 1 },
		{ id: 1, name: 'Alpha', lookup_id: 1 },
		{ id: 4, name: 'Delta', lookup_id: 2 },
		{ id: 5, name: 'Echo', lookup_id: 2 }
	]
	context.sorted = [
		{ id: 1, name: 'Alpha', lookup_id: 1 },
		{ id: 2, name: 'Beta', lookup_id: 1 },
		{ id: 3, name: 'Charlie', lookup_id: 1 },
		{ id: 4, name: 'Delta', lookup_id: 2 },
		{ id: 5, name: 'Echo', lookup_id: 2 }
	]
	context.lookup = { 1: 'One', 2: 'Two', 3: 'Three' }
	context.grouped = nest()
		.key((d) => d.lookup_id)
		.entries(context.data)
		.map(({ key, values }) => ({
			key,
			name: context.lookup[key],
			data: values
		}))

	context.sortedAndGrouped = nest()
		.key((d) => d.lookup_id)
		.entries(context.sorted)
		.map(({ key, values }) => ({
			key,
			name: context.lookup[key],
			data: values
		}))

	context.searchResult = [{ id: 1, name: 'Alpha', lookup_id: 1 }]
	context.groupSearchResult = [
		{
			key: '1',
			name: 'One',
			data: [{ id: 1, name: 'Alpha', lookup_id: 1 }]
		}
	]

	try {
		context.remove = yaml.load(fs.readFileSync('spec/fixtures/list/remove.yml'))
		context.add = yaml.load(fs.readFileSync('spec/fixtures/list/add.yml'))
		context.modify = yaml.load(fs.readFileSync('spec/fixtures/list/modify.yml'))
		context.altKey = yaml.load(
			fs.readFileSync('spec/fixtures/list/alt-key.yml')
		)
		context.sorting = yaml.load(fs.readFileSync('spec/fixtures/list/sort.yml'))
	} catch (err) {
		console.error(err)
	}
})

ListSuite('Should create a list', (context) => {
	let l = list(context.data)
	assert.equal(l.data, context.data)
	assert.equal(l.primaryKey, 'id')
	assert.equal(l.searchText, '')
	assert.not(l.sortKey)
	assert.not(l.sorter)
	assert.not(l.groupKey)
	assert.not(l.filterKey)
	assert.not(l.filter)
	assert.equal(getSubscribedData(l.filtered), context.data)
})

ListSuite('Should create a sorted list', (context) => {
	let l = list([...context.data]).sortBy('name')

	assert.equal(l.data, context.sorted)
	assert.equal(l.primaryKey, 'id')
	assert.equal(l.searchText, '')
	assert.equal(l.sortKey, 'name')
	assert.equal(l.sorter, compare)
	assert.not(l.groupKey)
	assert.not(l.filterKey)
	assert.not(l.filter)
	assert.equal(getSubscribedData(l.filtered), context.sorted)
})

ListSuite('Should create a grouped list', (context) => {
	let l = list([...context.data]).groupBy('lookup_id', context.lookup)

	assert.equal(l.data, context.data)
	assert.equal(l.primaryKey, 'id')
	assert.equal(l.searchText, '')
	assert.not(l.sortKey)
	assert.not(l.sorter)
	assert.equal(l.groupKey, 'lookup_id')
	assert.not(l.filterKey)
	assert.not(l.filter)
	assert.equal(getSubscribedData(l.filtered), context.grouped)
})
ListSuite('Should create a sorted and grouped list', (context) => {
	let l = list([...context.data])
		.sortBy('name')
		.groupBy('lookup_id', context.lookup)

	assert.equal(l.data, context.sorted)
	assert.equal(l.primaryKey, 'id')
	assert.equal(l.searchText, '')
	assert.equal(l.sortKey, 'name')
	assert.equal(l.sorter, compare)
	assert.equal(l.groupKey, 'lookup_id')
	assert.not(l.filterKey)
	assert.not(l.filter)
	assert.equal(getSubscribedData(l.filtered), context.sortedAndGrouped)
})

ListSuite('Should create a searchable list', (context) => {
	let l = list([...context.data]).filterBy('name')

	assert.equal(l.data, context.data)
	assert.equal(l.primaryKey, 'id')
	assert.equal(l.searchText, '')
	assert.not(l.sortKey)
	assert.not(l.sorter)
	assert.not(l.groupKey)
	assert.equal(l.filterKey, 'name')
	assert.equal(l.filter, quickSearch)
	assert.equal(getSubscribedData(l.filtered), context.data)

	l.search('Alpha')
	assert.equal(getSubscribedData(l.filtered), context.searchResult)
})

ListSuite('Should create a searchable sorted list', (context) => {
	let l = list([...context.data])
		.filterBy('name')
		.sortBy('name')

	assert.equal(l.data, context.sorted)
	assert.equal(l.primaryKey, 'id')
	assert.equal(l.searchText, '')
	assert.equal(l.sortKey, 'name')
	assert.equal(l.sorter, compare)
	assert.not(l.groupKey)
	assert.equal(l.filterKey, 'name')
	assert.equal(l.filter, quickSearch)
	assert.equal(getSubscribedData(l.filtered), context.sorted)

	l.search('Alpha')
	assert.equal(getSubscribedData(l.filtered), context.searchResult)
})

ListSuite('Should create a searchable grouped list', (context) => {
	let l = list([...context.data])
		.filterBy('name')
		.groupBy('lookup_id', context.lookup)

	assert.equal(l.data, context.data)
	assert.equal(l.primaryKey, 'id')
	assert.equal(l.searchText, '')
	assert.not(l.sortKey)
	assert.not(l.sorter)
	assert.equal(l.groupKey, 'lookup_id')
	assert.equal(l.filterKey, 'name')
	assert.equal(l.filter, quickSearch)
	assert.equal(getSubscribedData(l.filtered), context.grouped)

	l.search('Alpha')
	assert.equal(getSubscribedData(l.filtered), context.groupSearchResult)
})

ListSuite('Should create a searchable sorted & grouped list', (context) => {
	let l = list([...context.data])
		.filterBy('name')
		.sortBy('name')
		.groupBy('lookup_id', context.lookup)

	assert.equal(l.data, context.sorted)
	assert.equal(l.primaryKey, 'id')
	assert.equal(l.searchText, '')
	assert.equal(l.sortKey, 'name')
	assert.equal(l.sorter, compare)
	assert.equal(l.groupKey, 'lookup_id')
	assert.equal(l.filterKey, 'name')
	assert.equal(l.filter, quickSearch)
	assert.equal(getSubscribedData(l.filtered), context.sortedAndGrouped)

	l.search('Alpha')
	assert.equal(getSubscribedData(l.filtered), context.groupSearchResult)
})

ListSuite('Should add an item to list', (context) => {
	const data = context.add
	let l = list([...data.start])

	data.additions.map(({ item, result }) => {
		l.add(item)
		assert.equal(l.data, result.data.unsorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.data.unsorted,
			'Should update store after add'
		)
	})
})
ListSuite('Should add an item to sorted list', (context) => {
	const data = context.add
	let l = list([...data.start]).sortBy('id')

	data.additions.map(({ item, result }) => {
		l.add(item)
		assert.equal(l.data, result.data.sorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.data.sorted,
			'Should update store after add'
		)
	})
})
ListSuite('Should add an item to grouped list', (context) => {
	const data = context.add
	let l = list([...data.start]).groupBy('lookup_id', context.lookup)

	data.additions.map(({ item, result }) => {
		l.add(item)
		assert.equal(l.data, result.data.unsorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.grouped.unsorted,
			'Should update store after add'
		)
	})
})
ListSuite('Should add an item to sorted and grouped list', (context) => {
	const data = context.add
	let l = list([...data.start])
		.groupBy('lookup_id', context.lookup)
		.sortBy('id')

	data.additions.map(({ item, result }) => {
		l.add(item)
		assert.equal(l.data, result.data.sorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.grouped.sorted,
			'Should update store after add'
		)
	})
})

ListSuite('Should remove an item from list', (context) => {
	const data = context.remove
	let l = list([...data.start])

	data.removals.map(({ item, result }) => {
		l.remove(item)
		assert.equal(l.data, result.data.unsorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.data.unsorted,
			'Should update store after remove'
		)
	})
})

ListSuite('Should remove an item from sorted list', (context) => {
	const data = context.remove
	let l = list([...data.start]).sortBy('name')

	data.removals.map(({ item, result }) => {
		l.remove(item)
		assert.equal(l.data, result.data.sorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.data.sorted,
			'Should update store after remove'
		)
	})
})
ListSuite('Should remove an item from grouped list', (context) => {
	const data = context.remove
	let l = list([...data.start]).groupBy('lookup_id', data.lookup)

	data.removals.map(({ item, result }) => {
		l.remove(item)
		assert.equal(l.data, result.data.unsorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.grouped.unsorted,
			'Should update store after remove'
		)
	})
})
ListSuite('Should remove an item from sorted and grouped list', (context) => {
	const data = context.remove
	let l = list([...data.start])
		.groupBy('lookup_id', data.lookup)
		.sortBy('name')

	data.removals.map(({ item, result }) => {
		l.remove(item)
		assert.equal(l.data, result.data.sorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.grouped.sorted,
			'Should update store after remove'
		)
	})
})

ListSuite('Should modify an item in list', (context) => {
	const data = context.modify
	let l = list([...data.start])

	data.modifications.map(({ item, result }) => {
		l.modify(item)

		assert.equal(l.data, result.data.unsorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.data.unsorted,
			'Should update store after modify'
		)
	})
})
ListSuite('Should modify an item in sorted list', (context) => {
	const data = context.modify
	let l = list([...data.start]).sortBy('name')

	data.modifications.map(({ item, result }) => {
		l.modify(item)
		assert.equal(l.data, result.data.sorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.data.sorted,
			'Should update store after modify'
		)
	})
})
ListSuite('Should modify an item in grouped list', (context) => {
	const data = context.modify
	let l = list([...data.start]).groupBy('lookup_id', data.lookup)

	data.modifications.map(({ item, result }) => {
		l.modify(item)
		assert.equal(l.data, result.data.unsorted)
		assert.equal(
			getSubscribedData(l.filtered),
			result.grouped.unsorted,
			'Should update store after modify'
		)
	})
})
ListSuite('Should modify an item in sorted and grouped list', (context) => {
	const data = context.modify
	let l = list([...data.start])
		.groupBy('lookup_id', data.lookup)
		.sortBy('name')

	data.modifications.map(({ item, result }) => {
		l.modify(item)
		assert.equal(l.data, result.grouped.data)
		assert.equal(
			getSubscribedData(l.filtered),
			result.grouped.sorted,
			'Should update store after modify'
		)
	})
})

ListSuite('Should handle alternate key', (context) => {
	const { start, actions } = context.altKey

	let l = list([...start]).key('key')
	l.add(actions.add.item)
	assert.equal(l.data, actions.add.result)
	l.remove(actions.remove.item)
	assert.equal(l.data, actions.remove.result)
	l.modify(actions.modify.item)
	assert.equal(l.data, actions.modify.result)
})

ListSuite('Should handle missing lookup', (context) => {
	const { start, lookup } = context.altKey

	let l = list([...start])
		.key('key')
		.groupBy('lookup_key')
	assert.equal(l.lookup, lookup)
})

ListSuite('Should sort by group first', (context) => {
	let l = list([...context.sorting.items])
		.groupBy('lookup_id', context.sorting.lookup)
		.sortBy('name')
	l.data.sort((a, b) => compare(a, b, l))
	assert.equal(l.data, context.sorting.result.data)
})

ListSuite.run()
