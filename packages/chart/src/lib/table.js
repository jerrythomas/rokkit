import { ascending, descending } from 'd3-array'
import { nest } from 'd3-collection'
import { writable } from 'svelte/store'
import { omit } from 'ramda'

class DataTable {
	#input = []
	#filters = []
	#groupBy
	#sortBy
	#timelapseBy
	#stringFields = []
	#numericFields = []
	#data = writable([])

	constructor(data, options) {
		const { groupBy, sortBy, filters, timelapseBy } = options || {}

		this.#input = data

		this.groupBy(groupBy)
		if (filters) {
			if (Array.isArray(filters))
				filters.map((f) => this.addFilter(f.attribute, f.value))
			else this.addFilter(filters.attribute, filters.value)
		}
		if (sortBy) this.sortBy(sortBy.attribute, sortBy.ascending)
		if (timelapseBy) this.timelapseBy(timelapseBy)

		// if (Array.isArray(stringFields) && Array.isArray(numericFields)) {
		// 	this.#stringFields = stringFields
		// 	this.#numericFields = numericFields
		// } else {
		Object.keys(data[0]).map((key) => {
			if (data.map((d) => d[key]).some(isNaN)) this.#stringFields.push(key)
			else this.#numericFields.push(key)
		})
		// }
	}

	get data() {
		return this.#data
	}

	get originalData() {
		return this.#input
	}

	get options() {
		return {
			filters: this.#filters,
			groupBy: this.#groupBy,
			sortBy: this.#sortBy,
			timelapseBy: this.#timelapseBy,
			stringFields: this.#stringFields,
			numericFields: this.#numericFields
		}
	}

	clearFilters() {
		this.#filters = []
		return this
	}

	addFilter(attribute, value) {
		this.#filters.push({ attribute, value })
		return this
	}

	groupBy(attribute) {
		this.#groupBy = attribute
		return this
	}

	sortBy(attribute, ascending = true) {
		this.#sortBy = { attribute, ascending }
		return this
	}

	timelapseBy(attribute) {
		this.#timelapseBy = attribute
		this.#groupBy = attribute
	}

	/**
	 * Applies the ations on the input data making the results available in a store.
	 *
	 * @returns {DataTable} this instance
	 */
	apply() {
		// let stringFields = []
		// let combinations = []
		let data = [...this.#input]

		this.#filters.map(({ attribute, value }) => {
			data = data.filter((d) =>
				Array.isArray(value)
					? value.includes(d[attribute])
					: d[attribute] === value
			)
		})

		if (this.#sortBy) {
			data = data.sort((a, b) =>
				this.#sortBy.ascending
					? ascending(a[this.#sortBy.attribute], b[this.#sortBy.attribute])
					: descending(a[this.#sortBy.attribute], b[this.#sortBy.attribute])
			)
		}

		// if (this.#timelapseBy) {
		// 	stringFields = this.#stringFields.filter((f) => f !== this.#timelapseBy)
		// 	combinations = pipe(map(pick(stringFields)), uniq)(data)
		// }

		if (this.#groupBy) {
			data = nest()
				.key((d) => d[this.#groupBy])
				.rollup((values) => values.map((value) => omit([this.#groupBy], value)))
				.entries(data)

			// if (this.#timelapseBy) {
			// 	const imputedValues = zipObj(
			// 		this.#numericFields,
			// 		Array(this.#numericFields.length).fill(0)
			// 	)
			// 	const missingRows = pipe(
			// 		map(pick(stringFields)),
			// 		uniq,
			// 		difference(combinations),
			// 		map(mergeRight(imputedValues))
			// 	)

			// 	data = data.map(({ key, value }) => ({
			// 		key,
			// 		value: [...value, ...missingRows(value)]
			// 	}))
			// }
		}

		this.data.set(data)
		return this
	}
}

export function table(data, options) {
	return new DataTable(data, options)
}
