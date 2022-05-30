import { ascending, descending } from 'd3-array'
import { nest, values } from 'd3-collection'
import { writable } from 'svelte/store'

import {
	pipe,
	map,
	difference,
	pick,
	omit,
	uniq,
	groupBy,
	zipObj,
	mergeLeft,
	mergeRight
} from 'ramda'

export function timelapse(data, by, forward = true, defaults = {}) {
	let numericFields = []
	let stringFields = []
	let columns = Object.keys(data[0])

	columns
		.filter((f) => f !== by)
		.map((field) => {
			if (data.map((d) => d[field]).some(isNaN)) stringFields.push(field)
			else numericFields.push(field)
		})

	const imputedValues = mergeRight(
		zipObj(numericFields, Array(numericFields.length).fill(0)),
		defaults
	)
	const groups = pipe(map(pick(stringFields)), uniq)(data)
	let grouped = nest()
		.key((d) => d[by])
		.rollup((values) => values.map((value) => omit([by], value)))
		.entries(data)

	const missingRows = pipe(
		map(pick(stringFields)),
		uniq,
		difference(groups),
		map(mergeLeft(imputedValues))
	)

	grouped = grouped
		.map((d) => ({
			key: d.key,
			value: [...d.value, ...missingRows(d.value)]
		}))
		.sort((a, b) =>
			forward ? ascending(a.key, b.key) : descending(a.key, b.key)
		)

	return grouped
}

export class Data {
	#input
	#data = writable([])
	#options
	constructor(input, options) {
		this.#input = input
		this.#options = {
			time: undefined,
			group: undefined,
			orient: undefined,
			value: undefined,
			rank: undefined,
			defaults: { rank: 99 },
			...options
		}
	}

	get data() {
		return this.#data
	}

	get options() {
		return this.#options
	}

	apply() {
		let uniqueGroups = []
		let data = []
		if (this.#options.time && this.#options.group) {
			uniqueGroups = map(pick(this.#options.group), uniq)(this.#input)
			data = map(
				groupBy(this.#options.time),
				map(
					omit([this.#options.time]),
					groupBy(this.#options.group),
					map(omit[this.#options.group])
				)
			)(data)
		}
		this.#data.set(data)
	}
}
