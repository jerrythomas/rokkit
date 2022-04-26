import { writable } from 'svelte/store'
import { nest } from 'd3-collection'

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
		result =
			list.lookup[a[list.groupKey]] < list.lookup[b[list.groupKey]]
				? -1
				: list.lookup[a[list.groupKey]] > list.lookup[b[list.groupKey]]
				? 1
				: 0
	}
	if (result == 0) {
		result =
			a[list.sortKey] < b[list.sortKey]
				? -1
				: a[list.sortKey] > b[list.sortKey]
				? 1
				: 0
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
	#data = []
	#primaryKey = 'id'
	#filterKey
	#sortKey
	#groupKey
	#lookup
	#searchText = ''

	#filterUsing
	#sortUsing

	filtered = writable([])

	/**
	 *
	 * @param {Array<object>} data
	 */
	constructor(data) {
		this.#data = data
		this.filtered.set(data)
	}

	get primaryKey() {
		return this.#primaryKey
	}
	get filterKey() {
		return this.#filterKey
	}
	get groupKey() {
		return this.#groupKey
	}
	get sortKey() {
		return this.#sortKey
	}
	get lookup() {
		return this.#lookup
	}
	get data() {
		return this.#data
	}
	get searchText() {
		return this.#searchText
	}
	get filter() {
		return this.#filterUsing
	}
	get sorter() {
		return this.#sortUsing
	}

	key(value) {
		this.#primaryKey = value
		this.#data = this.data.map((item, index) =>
			value in item ? item : { ...item, [value]: index }
		)

		return this
	}

	sortBy(key, using = compare) {
		this.#sortKey = key
		this.#sortUsing = using

		return this.sort().refresh()
	}

	groupBy(key, lookup) {
		this.#groupKey = key

		if (lookup) this.#lookup = lookup
		else
			this.#lookup = this.data
				.map((item) => item[key])
				.reduce((obj, value) => ({ ...obj, [value]: value }), {})

		return this.sort().refresh()
	}

	filterBy(key, using = quickSearch) {
		this.#filterKey = key
		this.#filterUsing = using
		return this
	}
	sort() {
		if (this.sorter) this.data.sort((a, b) => this.sorter(a, b, this))
		return this
	}

	add(item) {
		const index = this.data.findIndex(
			(d) => d[this.primaryKey] === item[this.primaryKey]
		)
		if (index == -1) {
			if (!(this.primaryKey in item)) {
				item[this.primaryKey] = this.data.length
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
			this.#data = [...this.data.slice(0, index), ...this.data.slice(index + 1)]
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
		this.#searchText = text
		return this.refresh()
	}

	refresh() {
		let data = [...this.data]

		if (this.filterKey && this.searchText) {
			data = this.filter(this, this.searchText)
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
}
