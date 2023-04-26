import { writable, get } from 'svelte/store'
import { nest } from 'd3-collection'
import { v4 as uuid } from '@lukeed/uuid'
import { ascending } from 'd3-array'

/**
 * Compares two items for sorting. When grouped, uses group comparison before item comparison
 *
 * @param {*} a first item
 * @param {*} b second item
 * @param {*} list
 * @returns
 */
export function compare(a, b, list) {
	let result = 0

	if (list.groupKey) {
		result = ascending(
			list.lookup[a[list.groupKey]],
			list.lookup[b[list.groupKey]]
		)
	}
	if (result == 0) {
		result = ascending(a[list.sortKey], b[list.sortKey])
	}
	return result
}

/**
 * Search the data for existence of string in the data
 *
 * @param {List} list
 * @param {string} value
 * @returns
 */
export function quickSearch(list, value) {
	return list.data.filter((d) =>
		d[list.filterKey].toLowerCase().includes(value.toLowerCase())
	)
}

export class List {
	/**
	 *
	 * @param {Array<object>} data
	 */
	constructor(data) {
		this.data = data

		this.primaryKey = 'id'
		this.filterKey = undefined
		this.sortKey = undefined
		this.groupKey = undefined
		this.lookup = {}
		this.searchText = ''

		this.filterUsing = undefined
		this.sortUsing = undefined
		this.filtered = writable(data)
	}

	key(value) {
		this.primaryKey = value
		this.data = this.data.map((item) =>
			value in item ? item : { ...item, [value]: uuid() }
		)

		return this
	}

	sortBy(key, using = compare) {
		this.sortKey = key
		this.sortUsing = using

		return this.sort().refresh()
	}

	groupBy(key, lookup = null) {
		this.groupKey = key

		if (lookup) this.lookup = lookup
		else
			this.lookup = this.data
				.map((item) => item[key])
				.reduce((obj, value) => ({ ...obj, [value]: value }), {})

		return this.sort().refresh()
	}

	filterBy(key, using = quickSearch) {
		this.filterKey = key
		this.filterUsing = using
		return this
	}

	sort() {
		if (this.sortUsing) this.data.sort((a, b) => this.sortUsing(a, b, this))
		return this
	}

	add(item) {
		const index = this.data.findIndex(
			(d) => d[this.primaryKey] === item[this.primaryKey]
		)
		if (index == -1) {
			if (!(this.primaryKey in item)) {
				item[this.primaryKey] = uuid()
			}
			this.data.push(item)
			this.sort().refresh()
		}
		return this
	}

	remove(item) {
		const index = this.data.findIndex(
			(d) => d[this.primaryKey] === item[this.primaryKey]
		)
		if (index > -1) {
			this.data = [...this.data.slice(0, index), ...this.data.slice(index + 1)]
			this.refresh()
		}
		return this
	}

	modify(item) {
		const index = this.data.findIndex(
			(d) => d[this.primaryKey] === item[this.primaryKey]
		)
		if (index > -1) {
			this.data[index] = { ...item }
			this.sort().refresh()
		}
		return this
	}

	search(text) {
		this.searchText = text
		return this.refresh()
	}

	refresh() {
		let data = [...this.data]

		if (this.filterKey && this.searchText) {
			data = this.filterUsing(this, this.searchText)
		}

		if (this.groupKey) {
			data = nest()
				.key((d) => d[this.groupKey])
				.entries(data)
				.map(({ key, values }) => ({
					key,
					name: this.lookup[key],
					data: values
				}))
		}

		this.filtered.set(data)
		return this
	}
	current() {
		return get(this.filtered)
	}
}

/**
 *
 * @param {Array<object>} data
 * @returns
 */
export function list(data) {
	return new List(data)
}
