import { pick } from 'ramda'

/**
 * Checks if the provided value is a DataSet or an array of objects and
 * returns the array of objects.
 * @param {DataSet|Array<Object>} input
 * @returns {Array<Object>} - The array of objects.
 */
export function getDataArray(input) {
	if (typeof input === 'DataSet') {
		return input.data
	} else if (Array.isArray(input)) {
		return input
	} else {
		throw new Error('Invalid dataset')
	}
}
export class DataSet {
	#data = $state([])
	#config = {}

	constructor(data) {
		this.#data = data
	}

	get data() {
		return this.#data
	}

	/**
	 * Adds a filter to the dataset using the provided condition. This filter is applied
	 * in subsequent operations like select, delete, and update.
	 *
	 * @param {Function} condition - The condition function to apply.
	 * @returns {DataSet}          - The insteance with updated configuration.
	 */
	where(condition) {
		this.#config.filter = condition
		return this
	}
	/**
	 * Groups the dataset by the specified columns.
	 * @param {...string} fields   - The columns to group by.
	 * @returns {DataSet}          - The insteance with updated configuration.
	 */
	groupBy(...fields) {
		this.#config.group_by = fields
		return this
	}

	/**
	 * Aligns the columns of the dataset using the provided fields.
	 *
	 * @param {...string} fields   - The fields to align.
	 * @returns {DataSet}          - The insteance with updated configuration.
	 */
	alignBy(...fields) {
		this.#config.align_by = fields
		return this
	}
	/**
	 * Sets the template for adding empty rows in the dataset.
	 * @param {Object} template    - The template to use for adding empty rows.
	 * @returns {Object}           - The updated configuration.
	 */
	withDefaultRow(template) {
		this.#config.template = template
		return this
	}

	leftJoin(dataset, on) {
		const result = leftJoin(this.data, getDataArray(dataset), on)
		return new DataSet(result)
	}

	/**
	 * Adds a summary field to the dataset.
	 *
	 * @param {string|Array<string>|Function}  from  - The field or function to fetch data for summary
	 * @param {string|Object<string:Function>} aggregators - The target field & formula to use for summarizing.
	 * @returns {Object}                             - The updated configuration.
	 */
	summarize(from, aggregators) {
		const mapper =
			typeof from === 'function' ? from : Array.isArray(from) ? pick(from) : pick([from])
		const reducers = []

		if (typeof aggregators === 'string') reducers.push({ field: aggregators, formula: identity })
		if (typeof aggregators === 'object')
			Object.entries(aggregators).forEach(([field, formula]) => reducers.push({ field, formula }))

		this.#config.summaries.push({ mapper, reducers })

		return this
	}
}
