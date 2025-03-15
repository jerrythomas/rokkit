import { equals, identity, pick, omit, clone } from 'ramda'
import { descending } from 'd3-array'
import { pickAllowedConfig, defaultConfig } from './constants'
import { deriveSortableColumn } from './infer'
import { groupDataByKeys, fillAlignedData, getAlignGenerator, aggregateData } from './rollup'
import {
	leftJoin,
	rightJoin,
	fullJoin,
	innerJoin,
	crossJoin,
	semiJoin,
	antiJoin,
	nestedJoin
} from './join'

/**
 * Adds a summary field to the dataset.
 *
 * @param {Object} config                        - The configuration object to be updated.
 * @param {string|Array<string>|Function}  from  - The field or function to fetch data for summary
 * @param {string|Object<string:Function>} using - The target field & formula to use for summarizing.
 * @returns {Object}                             - The updated configuration.
 */
function summarize(config, from, using) {
	const mapper = typeof from === 'function' ? from : Array.isArray(from) ? pick(from) : pick([from])
	const reducers = []

	if (typeof using === 'string') reducers.push({ field: using, formula: identity })
	if (typeof using === 'object')
		Object.entries(using).forEach(([field, formula]) => reducers.push({ field, formula }))

	config.summaries.push({ mapper, reducers })

	return config
}

/**
 * Updates rows in the data based on the condition
 *
 * @param {Array<Object>}   data      - The data to update rows in.
 * @param {Function}        filter    - The condition to update rows on.
 * @param {Object|Function} value     - The values to update the rows with.
 * @returns {Array<Object>}           - The updated data with rows updated based on the condition.
 */
function updateRows(data, filter, value) {
	if (typeof value !== 'function' && typeof value !== 'object') {
		throw new Error('Value must be an object or function')
	}
	return data.map((row) =>
		filter(row) ? (typeof value === 'function' ? value(row) : { ...row, ...value }) : row
	)
}

/**
 * Fills missing values in the data based on the provided value.
 *
 * @param {Array<Object>} data  - The data to fill missing values in.
 * @param {Object}        value - The value to fill missing values with.
 * @returns {Array<Object>}     - The updated data with missing values filled.
 */
function fillNA(data, value) {
	/**
	 * Fills missing values in a single row based on the provided value.
	 *
	 * @param {Object} row - The row to fill missing values in.
	 */
	const fill = (row) => {
		const filled = {}
		Object.entries(value).forEach(([k, v]) => {
			if (row[k] === undefined || row[k] === null) {
				filled[k] = v
			}
		})
		return { ...row, ...filled }
	}
	return data.map(fill)
}

/**
 * Returns a function that renames the keys of a single row based on the provided mapping.
 *
 * @param {Object} lookup - The mapping of old keys to new keys.
 * @returns {Function}    - The function that renames the keys of a single row.
 */
function renameKeysUsingMap(lookup) {
	return (row) =>
		Object.entries(row)
			.sort((a, b) => descending(a[0], b[0]))
			.reduce((acc, [k, v]) => ({ ...acc, [lookup[k] || k]: v }), {})
}

/**
 * Renames the keys of the data based on the provided mapping, or function
 * that returns the new key. If the new key already exists, the value is overwritten.
 *
 * @param {Array<Object>}   data - The data to rename the keys of.
 * @param {Object|Function} how  - The mapping of old keys to new keys, or a function that performs renaming.
 * returns Array<Object>         - The updated data with renamed keys.
 */
function renameKeys(data, how) {
	const rename = typeof how === 'function' ? how : renameKeysUsingMap(how)
	return data.map(rename)
}

/**
 * Sorts data by the specified columns.
 *
 * @param {Array<Object>}                    data   - The data to sort.
 * @param {import('./types').SortableColumn} fields - The columns to sort by.
 * @returns {Array<Object>}                           The sorted data
 */
function sortDataBy(data, ...fields) {
	const sorters = fields.map(deriveSortableColumn)

	data.sort((a, b) => {
		let result = 0
		for (let i = 0; i < sorters.length && result === 0; i++) {
			const { name, sorter } = sorters[i]
			result = sorter(a[name], b[name])
		}
		return result
	})
	return data
}

/**
 * Selects the specified columns from the dataset.
 *
 * @param {Array<Object>} data          - The data to select from.
 * @param {Object}        config        - The configuration object.
 * @param {Function}      config.filter - The filter function to apply to the data.
 * @param {Array<String>} cols          - The columns to select.
 * @returns {Array<Object>} The selected data.
 */
function selectKeys(data, config, ...cols) {
	const result = config.filter ? data.filter(config.filter) : data
	if (cols.length > 0) return result.map(pick(cols))
	return result
}

/**
 * Returns the default aggregator which rolls up the columns other than the group_by columns into a single object.
 *
 * @param {import('./types').Metadata} metadata - The metadata for the columns to be aggregated.
 * @param {Object} config                       - The configuration used to build the aggregator.
 *
 * @returns {Object} An object containing the default aggregator for the specified metadata and configuration.
 */
export function defaultAggregator(config) {
	return {
		mapper: omit(config.group_by),
		reducers: [{ field: config.children, formula: identity }]
	}
}

/**
 * Summarizes the dataset by the specified columns.
 * @param {import('./types').dataset} df - The dataset object to summarize.
 * @param {Array} summaries                  - The columns to summarize.
 *
 * @returns {import('./types').dataset}  The summarized dataset object.
 */
function rollup(data, config) {
	if (config.group_by.length === 0 && config.summaries.length === 0) {
		throw new Error(
			'Use groupBy to specify the columns to group by or use summarize to add aggregators.'
		)
	}

	const summaries = clone(config.summaries)
	const hasAlignBy = config.align_by.length > 0
	if (summaries.length === 0) summaries.push(defaultAggregator(config))

	let alignedData = groupDataByKeys(data, config.group_by, summaries)

	if (hasAlignBy) {
		const fillRows = getAlignGenerator(data, config)
		alignedData = fillAlignedData(alignedData, config, fillRows)
		alignedData.forEach((group) => {
			group[config.children] = sortDataBy(group[config.children], ...config.align_by)
		})
	}

	const aggregatedData = aggregateData(alignedData, summaries)
	// const newMetadata = buildMetadata(aggregatedData, df.metadata, df.config.group_by, summaries)

	return aggregatedData
}

export class DataSet {
	#config = clone(defaultConfig)
	#data = []

	constructor(data) {
		this.#data = data
	}
	get data() {
		return this.#data
	}

	set data(values) {
		this.#data = values
	}

	// configuration
	set config(props = {}) {
		this.#config = { ...this.#config, ...pickAllowedConfig(props) }
	}

	override(props) {
		this.#config = { ...this.#config, ...pickAllowedConfig(props) }
		return this
	}

	where(condition) {
		this.#config.filter = condition
		return this
	}
	groupBy(...fields) {
		this.#config.group_by = fields
		return this
	}
	alignBy(...fields) {
		this.#config.align_by = fields
		return this
	}
	usingTemplate(template) {
		this.#config.template = template
		return this
	}
	summarize(from, fields) {
		this.config = summarize(this.#config, from, fields)
		return this
	}

	rename(how) {
		this.data = renameKeys(this.data, how)
		return this
	}
	drop(...fields) {
		const newDataSet = new DataSet(this.data.map((row) => omit(fields, row)))
		newDataSet.config = this.config
		return newDataSet
	}
	// alter rows
	sortBy(...fields) {
		this.data = sortDataBy(this.data, ...fields)
		return this
	}
	remove() {
		if (this.#config.filter) {
			this.#data = this.data.filter((row) => !this.#config.filter(row))
		} else {
			this.#data = []
		}
		this.#config.filter = undefined
		// this.data = deleteRows(this.data, this.#config.filter || includeAll)
		return this
	}
	update(value) {
		this.data = updateRows(this.data, this.#config.filter || identity, value)
		this.#config.filter = undefined
		return this
	}
	fillNA(value) {
		this.data = fillNA(this.#data, value)
		return this
	}
	// transform data
	apply(callback) {
		this.data = this.data.map(callback)
		return this
	}
	rollup() {
		return new DataSet(rollup(this.data, this.#config))
	}
	select(...cols) {
		const result = this.#config.filter ? this.data.filter(this.#config.filter) : this.data
		if (cols.length > 0) return result.map(pick(cols))
		return result
	}
	// set operations
	union(other) {
		if (Array.isArray(other)) {
			return new DataSet(this.data.concat(other))
		}
		return new DataSet(this.data.concat(other.data))
	}
	minus(other) {
		return new DataSet(this.data.filter((d) => !other.find((x) => equals(x, d))))
	}
	intersect(other) {
		return new DataSet(this.data.filter((d) => other.find((x) => equals(x, d))))
	}
	// joins
	innerJoin(other, condition) {
		return new DataSet(innerJoin(this.data, other.data, condition))
	}
	leftJoin(other, condition) {
		return new DataSet(leftJoin(this.data, other.data, condition))
	}
	rightJoin(other, condition) {
		return new DataSet(rightJoin(this.data, other.data, condition))
	}
	fullJoin(other, condition) {
		return new DataSet(fullJoin(this.data, other.data, condition))
	}
	crossJoin(other) {
		return new DataSet(crossJoin(this.data, other.data))
	}
	semiJoin(other, condition) {
		return new DataSet(semiJoin(this.data, other.data, condition))
	}
	antiJoin(other, condition) {
		return new DataSet(antiJoin(this.data, other.data, condition))
	}
	nestedJoin(other, condition) {
		return new DataSet(nestedJoin(this.data, other.data, condition, this.#config.children))
	}
}

export function dataset(data, options = {}) {
	const ds = new DataSet(data)
	ds.config = options
	return ds
}
