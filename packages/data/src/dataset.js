import { equals, identity, pick, omit, clone } from 'ramda'
import { descending } from 'd3-array'
import { pickAllowedConfig, defaultConfig, includeAll } from './constants'
import { deriveSortableColumn } from './infer'
import { groupDataByKeys, fillAlignedData, getAlignGenerator, aggregateData } from './rollup'
/**
 * Dataset is a collection of data with a set of operations that can be performed on it.
 * @param {Array} data - The data to be stored in the dataset.
 * @param {Object} options - The configuration options for the dataset.
 * @returns {Object} - An object with a set of operations that can be performed on the dataset.
 */
// eslint-disable-next-line max-lines-per-function
export function dataset(data, options = {}) {
	const config = { ...clone(defaultConfig), ...options }

	const actions = {
		// configuration
		override: (props) => dataset(data, { ...config, ...pickAllowedConfig(props) }),
		where: (condition) => dataset(data, where(config, condition)),
		groupBy: (...fields) => dataset(data, groupBy(config, ...fields)),
		alignBy: (...fields) => dataset(data, alignBy(config, ...fields)),
		using: (template) => dataset(data, usingTemplate(config, template)),
		summarize: (from, fields) => dataset(data, summarize(config, from, fields)),
		// alter keys
		rename: (how) => dataset(renameKeys(data, how)),
		drop: (...fields) => dataset(dropKeys(data, ...fields)),
		// alter rows
		sortBy: (...fields) => dataset(sortDataBy(data, ...fields)),
		delete: () => dataset(deleteRows(data, config.filter || includeAll)),
		update: (value) => dataset(updateRows(data, config.filter || identity, value)),
		fillNA: (value) => dataset(fillNA(data, value)),
		// transform data
		apply: (callback) => dataset(data.map(callback)),
		rollup: () => dataset(rollup(data, config)),
		select: (...cols) => selectKeys(data, config, ...cols),
		// set operations
		union: (other) => dataset(data.concat(other)),
		minus: (other) => dataset(data.filter((d) => !other.find((x) => equals(x, d)))),
		intersect: (other) => dataset(data.filter((d) => other.find((x) => equals(x, d)))),
		// joins
		innerJoin: (other, condition) => dataset(innerJoin(data, other.select(), condition)),
		leftJoin: (other, condition) => dataset(leftJoin(data, other.select(), condition)),
		rightJoin: (other, condition) => dataset(rightJoin(data, other.select(), condition)),
		fullJoin: (other, condition) => dataset(fullJoin(data, other.select(), condition)),
		crossJoin: (other) => dataset(crossJoin(data, other.select())),
		semiJoin: (other, condition) => dataset(semiJoin(data, other.select(), condition)),
		antiJoin: (other, condition) => dataset(antiJoin(data, other.select(), condition)),
		nestedJoin: (other, condition) =>
			dataset(nestedJoin(data, other.select(), condition, config.children))
	}

	return actions
}

/**
 * Adds a filter to the dataset using the provided condition. This filter is applied
 * in subsequent operations like select, delete, and update.
 *
 * @param {Object} config      - The configuration object to be updated.
 * @param {Function} condition - The condition function to apply.
 * @returns {Object}           - The updated configuration
 */
function where(config, condition) {
	config.filter = condition
	return config
}
/**
 * Groups the dataset by the specified columns.
 * @param {Object} config      - The configuration object to be updated.
 * @param {Object} actions     - The actions object for method chaining.
 * @param {...string} fields   - The columns to group by.
 * @returns {Object}           - The updated configurations.
 */
function groupBy(config, ...fields) {
	config.group_by = fields
	return config
}

/**
 * Aligns the columns of the dataset using the provided fields.
 *
 * @param {Object} config      - The configuration object to be updated.
 * @param {...string} fields   - The fields to align.
 * @returns {Object}           - The updated configuration.
 */
function alignBy(config, ...fields) {
	config.align_by = fields
	return config
}
/**
 * Sets the template for adding empty rows in the dataset.
 * @param {Object} config      - The configuration object to be updated.
 * @param {Object} template    - The template to use for adding empty rows.
 * @returns {Object}           - The updated configuration.
 */
function usingTemplate(config, template) {
	config.template = template
	return config
}

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
 * Joins two datasets together based on a condition. Result includes all rows from the first
 * dataset and matching rows from the second dataset. In case of multiple matches, all
 * combinations are returned. When combining the rows, the columns from the first dataset take
 * precedence.
 *
 * inner: only the rows that have a match in both datasets.
 * outer: all rows from the first dataset and matching rows from the second dataset.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Object}           - An object with the inner and outer join result.
 */
function joinData(first, second, condition) {
	let inner = []
	const outer = []

	first.forEach((f) => {
		const matches = second.filter((s) => condition(f, s)).map((m) => ({ ...m, ...f }))
		inner = inner.concat(matches)
		if (matches.length === 0) outer.push(f)
	})
	return { inner, outer }
}

/**
 * Filters the results of the first dataset based on the condition using the second dataset.
 *
 * @param {Array}    first     - The first dataset to filter.
 * @param {Array}    second    - The second dataset to filter by.
 * @param {Function} condition - The condition to filter the first dataset by.
 * @returns {Array}            - The filtered dataset.
 */
function antiJoin(first, second, condition) {
	return first.filter((f) => !second.find((s) => condition(f, s)))
}

/**
 * Joins two datasets together based on a condition. Result includes all rows from the first
 * dataset and matching rows from the second dataset. In case of multiple matches, all
 * combinations are returned. When combining the rows, the columns from the first dataset take
 * precedence.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
function innerJoin(first, second, condition) {
	const { inner } = joinData(first, second, condition)
	return inner
}

/**
 * Performs a left join on two datasets based on a condition. Result includes all rows from the first
 * dataset and matching rows from the second dataset. In case of multiple matches, all combinations
 * are returned. When combining the rows, the columns from the first dataset take precedence.
 * If there is no match in the second dataset, only the row from the first dataset is returned.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
function leftJoin(first, second, condition) {
	const { inner, outer } = joinData(first, second, condition)
	return inner.concat(outer)
}

/**
 * Performs a right join on two datasets based on a condition. Result includes all rows from the second
 * dataset and matching rows from the first dataset. In case of multiple matches, all combinations
 * are returned. When combining the rows, the columns from the second dataset take precedence.
 * If there is no match in the first dataset, only the row from the second dataset is returned.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
function rightJoin(first, second, condition) {
	const { inner, outer } = joinData(second, first, condition)
	return inner.concat(outer)
}

/**
 * Performs a full join on two datasets based on a condition. Result includes all rows from both
 * datasets. In case of multiple matches, all combinations are returned. When combining the rows,
 * the columns from the first dataset take precedence. If there is no match in the second dataset,
 * only the row from the first dataset is returned. If there is no match in the first dataset, only
 * the row from the second dataset is returned.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
function fullJoin(first, second, condition) {
	const { inner, outer } = joinData(first, second, condition)
	const rightOuter = antiJoin(second, first, condition)
	return inner.concat(outer).concat(rightOuter)
}

/**
 * Performs a cross join on two datasets. Result includes all combinations of rows from both datasets.
 *
 * @param {Array} first  - The first dataset to join.
 * @param {Array} second - The second dataset to join.
 * @returns {Array}      - The joined dataset.
 */
function crossJoin(first, second) {
	return first.map((f) => second.map((s) => ({ ...f, ...s }))).flat()
}

/**
 * Performs a semi join on two datasets based on a condition. Result includes all rows from the first
 * dataset that have a match in the second dataset.
 *
 * @param {Array}    first     - The first dataset to join.
 * @param {Array}    second    - The second dataset to join.
 * @param {Function} condition - The condition to join the datasets on.
 * @returns {Array}            - The joined dataset.
 */
function semiJoin(first, second, condition) {
	return first.filter((f) => second.find((s) => condition(f, s)))
}

/**
 * Performs a nested join on two datasets based on a condition. Result includes all rows from the first
 * dataset that have a match in the second dataset. The result is nested with the matching rows from the
 * second dataset.
 *
 * @param {Array}    first            - The first dataset to join.
 * @param {Array}    second           - The second dataset to join.
 * @param {Function} condition        - The condition to join the datasets on.
 * @param {String}   [key='children'] - The key to nest the matching rows under.
 * @returns {Array}            - The joined dataset.
 */
function nestedJoin(first, second, condition, key = 'children') {
	const result = first.map((f) => ({
		...f,
		[key]: second.filter((s) => condition(f, s))
	}))
	return result
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
 * Drops the specified keys from the data.
 *
 * @param {Array<Object>} data - The data to drop keys from.
 * @param {Array<String>} keys - The keys to drop.
 * @returns {Array<Object>}    - The updated data with the specified keys dropped.
 */
function dropKeys(data, ...keys) {
	return data.map((row) => omit(keys, row))
}

/**
 * Deletes rows from the data based on the condition
 *
 * @param {Array<Object>} data      - The data to delete rows from.
 * @param {Function}      condition - The condition to delete rows on.
 * @returns {Array<Object>}         - The updated data with rows deleted based on the condition.
 */
function deleteRows(data, condition) {
	return data.filter((row) => !condition(row))
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
