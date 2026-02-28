import { writable, get } from 'svelte/store'
import { ascending } from 'd3-array'
import { nest } from 'd3-collection'
import { v4 as uuid } from '@lukeed/uuid'

/**
 * Compares two items for sorting. When grouped, uses group comparison before item comparison
 *
 * @param {*} a first item
 * @param {*} b second item
 * @param {*} data
 * @returns
 */
export function compare(a, b, data) {
	let result = 0

	if (data.groupKey) {
		result = ascending(data.lookup[a[data.groupKey]], data.lookup[b[data.groupKey]])
	}
	if (result === 0) {
		result = ascending(a[data.sortKey], b[data.sortKey])
	}
	return result
}

/**
 * Search the data for existence of string in the data
 *
 * @param {List} data
 * @param {string} value
 * @returns
 */
export function quickSearch(data, value) {
	return data.data.filter((d) => d[data.filterKey].toLowerCase().includes(value.toLowerCase()))
}

/**
 * Implements a list containing data and functionality for sorting, filtering, and grouping.
 */
export class List {
	/**
	 * Creates a List instance with initial data and default settings for keys and functions.
	 * @param {Array<object>} data - The initial array of objects to populate the list.
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

	/**
	 * Sets a primary key attribute for list items and assigns a unique identifier if not present.
	 *
	 * @param {string} value - The property name to be set as the primary key.
	 * @returns {List} This list instance for method chaining.
	 */
	key(value) {
		this.primaryKey = value
		this.data = this.data.map((item) => (value in item ? item : { ...item, [value]: uuid() }))

		return this
	}

	/**
	 * Configures sorting by a given key and sorting function.
	 *
	 * @param {string} key - The property name to sort by.
	 * @param {Function} [using=compare] - The function used to sort the list items.
	 * @returns {List} This list instance for method chaining.
	 */
	sortBy(key, using = compare) {
		this.sortKey = key
		this.sortUsing = using

		return this.sort().refresh()
	}

	/**
	 * Groups list items by a given key and maps group keys for display using an optional lookup object.
	 *
	 * @param {string} key - The property name to group by.
	 * @param {object|null} [lookup=null] - An object mapping group keys to display names.
	 * @returns {List} This list instance for method chaining.
	 */
	groupBy(key, lookup = null) {
		this.groupKey = key

		if (lookup) this.lookup = lookup
		else
			this.lookup = this.data
				.map((item) => item[key])
				.reduce((obj, value) => ({ ...obj, [value]: value }), {})

		return this.sort().refresh()
	}

	/**
	 * Sets the key and function for filtering list items.
	 *
	 * @param {string} key - The property name to filter by.
	 * @param {Function} [using=quickSearch] - The function used to filter the list items.
	 * @returns {List} This list instance for method chaining.
	 */
	filterBy(key, using = quickSearch) {
		this.filterKey = key
		this.filterUsing = using
		return this
	}

	/**
	 * Sorts the list based on the configured sorting function.
	 *
	 * @returns {List} This list instance for method chaining.
	 */
	sort() {
		if (this.sortUsing) this.data.sort((a, b) => this.sortUsing(a, b, this))
		return this
	}

	/**
	 * Adds a new item to the list, assigning a primary key if necessary, and then sorts and refreshes the list.
	 *
	 * @param {object} item - The item to add to the list.
	 * @returns {List} This list instance for method chaining.
	 */
	add(item) {
		const index = this.data.findIndex((d) => d[this.primaryKey] === item[this.primaryKey])
		if (index === -1) {
			if (!(this.primaryKey in item)) {
				item[this.primaryKey] = uuid()
			}
			this.data.push(item)
			this.sort().refresh()
		}
		return this
	}

	/**
	 * Removes an item from the list by primary key and refreshes the list.
	 *
	 * @param {object} item - The item to remove from the list.
	 * @returns {List} This list instance for method chaining.
	 */
	remove(item) {
		const index = this.data.findIndex((d) => d[this.primaryKey] === item[this.primaryKey])
		if (index > -1) {
			this.data = [...this.data.slice(0, index), ...this.data.slice(index + 1)]
			this.refresh()
		}
		return this
	}

	/**
	 * Modifies an existing item in the list, identified by primary key, and then sorts and refreshes the list.
	 *
	 * @param {object} item - The item to modify in the list.
	 * @returns {List} This list instance for method chaining.
	 */
	modify(item) {
		const index = this.data.findIndex((d) => d[this.primaryKey] === item[this.primaryKey])
		if (index > -1) {
			this.data[index] = { ...item }
			this.sort().refresh()
		}
		return this
	}

	/**
	 * Sets the text to search for in the list's items and then refreshes the list.
	 *
	 * @param {string} text - The text to search for.
	 * @returns {List} This list instance for method chaining.
	 */
	search(text) {
		this.searchText = text
		return this.refresh()
	}

	/**
	 * Refreshes the list based on current sorting, grouping, and filtering configuration.
	 *
	 * @returns {List} This list instance for method chaining.
	 */
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
	/**
	 * Gets the current state of the filtered list data.
	 *
	 * @returns {Array<object>} The current filtered data of the list.
	 */
	current() {
		return get(this.filtered)
	}
}

/**
 * Create a new list
 *
 * @param {Array<object>} data
 * @returns
 */
export function list(data) {
	return new List(data)
}
