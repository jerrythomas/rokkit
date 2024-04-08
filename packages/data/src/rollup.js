import { omit, pick, mergeLeft, map, difference, uniq, pipe } from 'ramda'

/**
 * Groups data by specified keys.
 *
 * @param {Array} data - An array of data points.
 * @param {Array} groupByKeys - Keys to group the data by.
 * @param {Array} summaries - An array of summary objects to define aggregation operations.
 * @returns {Object} Grouped data object with aggregation placeholders.
 */
export function groupDataByKeys(data, groupByKeys, summaries) {
	const keysExtractor = pick(groupByKeys)
	const groupedData = data.reduce((grouped, row) => {
		const key = JSON.stringify(keysExtractor(row))
		if (!grouped[key]) {
			grouped[key] = { ...keysExtractor(row), ...initialValues(summaries) }
		}
		addToSummaries(grouped[key], row, summaries)
		return grouped
	}, {})

	return Object.values(groupedData)
}

/**
 * Sets initial values for summaries.
 *
 * @param {Array} summaries - An array of summary objects.
 * @returns {Object} An object with keys for each summary initialized to empty arrays.
 */
export function initialValues(summaries) {
	const fields = summaries.map(({ reducers }) => reducers.map((r) => r.field)).flat()
	return fields.reduce((acc, name) => ({ ...acc, [name]: [] }), {})
}

/**
 * Adds data to summary aggregation arrays.
 *
 * @param {Object} group - The group object to add data to.
 * @param {Object} row - The data row being processed.
 * @param {Array} summaries - An array of summary objects.
 */
export function addToSummaries(group, row, summaries) {
	summaries.forEach(({ mapper, reducers }) => {
		const value = mapper(row)
		reducers.forEach((r) => {
			group[r.field].push(value)
		})
	})
}

/**
 * Fills grouped data with aligned data if specified in configuration.
 *
 * @param {Object} groupedData - The grouped data object.
 * @param {Object} config - Configuration object containing alignment settings.
 * @returns {Array} Aligned data array.
 */
export function fillAlignedData(groupedData, config, fillRowsFunc) {
	// const fillRowsFunc = getAlignGenerator(df.data, config)
	const { actual_flag, children } = config
	return Object.values(groupedData).map((row) => ({
		...row,
		[children]: [
			...row[children].map((value) => ({ ...value, [actual_flag]: 1 })),
			...fillRowsFunc(row[children])
		]
	}))
}

/**
 * Performs aggregation operations on grouped data.
 *
 * @param {Array} dataArray - An array of grouped data with aggregation arrays.
 * @param {Array} summaries - An array of summary objects with reducer functions.
 * @returns {Array} Aggregated data array with computed summary values.
 */
export function aggregateData(dataArray, summaries) {
	const fields = summaries.map(({ name, reducers }) => reducers.map((r) => ({ name, ...r }))).flat()
	return dataArray.map((row) => ({
		...row,
		...fields.reduce(
			(acc, { field, formula }) => ({
				...acc,
				[field]: formula(row[field])
			}),
			{}
		)
	}))
}

/**
 * Creates a generator that produces missing rows in a dataset based on specified columns.
 * The function determines all unique combinations of the specified columns in config.align_by
 * and returns a generator function to create the missing combinations, potentially with default
 * values for other columns.
 * @param {Array<Object>} data - The array of objects representing the dataset.
 * @param {Object} config - The configuration object.
 *
 * @returns {Function} A generator function that when called, produces the missing rows.
 */
export function getAlignGenerator(data, config) {
	const { align_by, group_by, actual_flag } = config
	const template = { ...omit([...align_by, ...group_by], config.template), [actual_flag]: 0 }
	const subset = pipe(map(pick(align_by)), uniq)(data)

	return pipe(map(pick(align_by)), uniq, difference(subset), map(mergeLeft(template)))
}

/**
 * Returns an aggregator object with a mapper and reducer function.
 *
 * @param {Array<string>} from  - The key or keys to aggregate.
 * @param {Function}      using - The aggregation function.
 * @returns {import('./types').SummaryConfig}  - An object with a mapper and reducer function.
 */
// export function getAggregator(from, into, using = identity) {
// 	// const mapper = pick(Array.isArray ? from : [from])
// 	return {
// 		mapper: pick(from),
// 		reducers: [{ field: into, formula: using }]
// 	}
// }

/**
 * Returns the default aggregator which rolls up the columns other than the group_by columns into a single object.
 *
 * @param {import('./types').Metadata} metadata - The metadata for the columns to be aggregated.
 * @param {Object} config                       - The configuration used to build the aggregator.
 *
 * @returns {Object} An object containing the default aggregator for the specified metadata and configuration.
 */
// export function defaultAggregator(metadata, config) {
// 	const child = metadata.filter((col) => !config.group_by.includes(col.name))
// 	const keys = child.map((col) => col.name)

// 	return { ...getAggregator(keys, config.children), metadata: child }
// }
