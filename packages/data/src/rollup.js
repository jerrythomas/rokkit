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
 * Groups data by specified keys using a composite string key (Phase 3: replaces JSON.stringify).
 *
 * @param {Array} data - An array of data points.
 * @param {Array} groupByKeys - Keys to group the data by.
 * @param {Array} summaries - An array of summary objects to define aggregation operations.
 * @returns {Object} Grouped data object with aggregation placeholders.
 */
export function groupDataByKeys(data, groupByKeys, summaries) {
	const groupedData = new Map()

	for (const row of data) {
		// Composite key: avoids JSON.stringify overhead
		const key = groupByKeys.map((k) => row[k]).join('\x00')

		if (!groupedData.has(key)) {
			const group = {}
			for (const k of groupByKeys) group[k] = row[k]
			Object.assign(group, initialValues(summaries))
			groupedData.set(key, group)
		}
		addToSummaries(groupedData.get(key), row, summaries)
	}

	return [...groupedData.values()]
}

/**
 * Fills grouped data with aligned data if specified in configuration.
 *
 * @param {Object} groupedData - The grouped data object.
 * @param {Object} config - Configuration object containing alignment settings.
 * @returns {Array} Aligned data array.
 */
export function fillAlignedData(groupedData, config, fillRowsFunc) {
	const { actual_flag, children } = config
	return groupedData.map((row) => ({
		...row,
		[children]: [
			...row[children].map((value) => ({ ...value, [actual_flag]: 1 })),
			...fillRowsFunc(row[children])
		]
	}))
}

/**
 * Creates a generator that produces missing rows in a dataset based on specified columns.
 *
 * @param {Array<Object>} data - The array of objects representing the dataset.
 * @param {Object} config - The configuration object.
 * @returns {Function} A generator function that when called, produces the missing rows.
 */
export function getAlignGenerator(data, config) {
	const { align_by, group_by, actual_flag } = config

	// Build template: omit align_by and group_by keys, add actual_flag=0
	const omitKeys = new Set([...align_by, ...group_by])
	const template = { [actual_flag]: 0 }
	for (const [k, v] of Object.entries(config.template)) {
		if (!omitKeys.has(k)) template[k] = v
	}

	// Collect all unique combinations of align_by fields from full dataset
	const seen = new Map()
	for (const row of data) {
		const key = align_by.map((k) => row[k]).join('\x00')
		if (!seen.has(key)) {
			const combo = {}
			for (const k of align_by) combo[k] = row[k]
			seen.set(key, combo)
		}
	}
	const allCombos = [...seen.values()]

	// Return a function that, given a group's children, yields the missing combos
	return (children) => {
		const childKeys = new Set(children.map((c) => align_by.map((k) => c[k]).join('\x00')))
		const missing = []
		for (const combo of allCombos) {
			const key = align_by.map((k) => combo[k]).join('\x00')
			if (!childKeys.has(key)) {
				missing.push({ ...combo, ...template })
			}
		}
		return missing
	}
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
