import { descending } from 'd3-array'
import { pickAllowedConfig, defaultConfig } from './constants'
import { deriveColumnDefs } from './infer'
import { executeFused, sortDataByFields } from './pipeline.js'
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

// ── Native helpers (replace Ramda) ─────────────────────────────────────────

function pickKeys(keys) {
	return (row) => {
		const out = {}
		for (const k of keys) if (k in row) out[k] = row[k]
		return out
	}
}

function omitKeys(keys) {
	const skip = new Set(keys)
	return (row) => {
		const out = {}
		for (const k of Object.keys(row)) if (!skip.has(k)) out[k] = row[k]
		return out
	}
}

function deepEqual(a, b) {
	return JSON.stringify(a) === JSON.stringify(b)
}

function cloneConfig(config) {
	return {
		...config,
		group_by: [...config.group_by],
		align_by: [...config.align_by],
		summaries: [...config.summaries],
		template: { ...config.template }
	}
}

// ───────────────────────────────────────────────────────────────────────────

/**
 * Adds a summary field to the dataset.
 */
function summarize(config, from, using) {
	const mapper =
		typeof from === 'function'
			? from
			: Array.isArray(from)
				? pickKeys(from)
				: pickKeys([from])
	const reducers = []

	if (typeof using === 'string') reducers.push({ field: using, formula: (x) => x })
	if (typeof using === 'object')
		Object.entries(using).forEach(([field, formula]) => reducers.push({ field, formula }))

	config.summaries.push({ mapper, reducers })

	return config
}

/**
 * Updates rows in the data based on the condition
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
 */
function fillNA(data, value) {
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
 */
function renameKeysUsingMap(lookup) {
	return (row) =>
		Object.entries(row)
			.sort((a, b) => descending(a[0], b[0]))
			.reduce((acc, [k, v]) => ({ ...acc, [lookup[k] || k]: v }), {})
}

/**
 * Renames the keys of the data based on the provided mapping, or function.
 */
function renameKeys(data, how) {
	const rename = typeof how === 'function' ? how : renameKeysUsingMap(how)
	return data.map(rename)
}

/**
 * Returns the default aggregator which rolls up non-group_by columns into a children array.
 */
export function defaultAggregator(config) {
	return {
		mapper: omitKeys(config.group_by),
		reducers: [{ field: config.children, formula: (x) => x }]
	}
}

/**
 * Summarizes the dataset by the specified columns.
 */
function rollup(data, config) {
	if (config.group_by.length === 0 && config.summaries.length === 0) {
		throw new Error(
			'Use groupBy to specify the columns to group by or use summarize to add aggregators.'
		)
	}

	const summaries = [...config.summaries]
	const hasAlignBy = config.align_by.length > 0
	if (summaries.length === 0) summaries.push(defaultAggregator(config))

	let alignedData = groupDataByKeys(data, config.group_by, summaries)

	if (hasAlignBy) {
		const fillRows = getAlignGenerator(data, config)
		alignedData = fillAlignedData(alignedData, config, fillRows)
		alignedData.forEach((group) => {
			group[config.children] = sortDataByFields(group[config.children], ...config.align_by)
		})
	}

	return aggregateData(alignedData, summaries)
}

export class DataSet {
	#config = cloneConfig(defaultConfig)
	#data = []
	/** @type {Array<{type:string, fn?:Function, fields?:string[]}>} */
	#ops = []

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

	// ── Lazy linear ops (fused in select) ──────────────────────────────────

	where(condition) {
		this.#ops.push({ type: 'filter', fn: condition })
		return this
	}
	apply(callback) {
		this.#ops.push({ type: 'map', fn: callback })
		return this
	}
	sortBy(...fields) {
		this.#ops.push({ type: 'sort', fields })
		return this
	}

	// ── Eager ops (commit to this.#data immediately) ────────────────────────

	rename(how) {
		this.#data = renameKeys(this.#data, how)
		return this
	}
	drop(...fields) {
		const omit = omitKeys(fields)
		const newDataSet = new DataSet(this.#data.map(omit))
		newDataSet.config = this.#config
		return newDataSet
	}
	fillNA(value) {
		this.#data = fillNA(this.#data, value)
		return this
	}

	// ── Mutation ops (flush lazy ops first, then mutate) ───────────────────

	remove() {
		// Flush pending ops so the filter context is respected
		const pending = this.#ops.splice(0)
		if (pending.length > 0) {
			// The last filter op is the one to use for removal
			const filterOp = [...pending].reverse().find((o) => o.type === 'filter')
			if (filterOp) {
				this.#data = this.#data.filter((row) => !filterOp.fn(row))
			} else {
				this.#data = []
			}
		} else {
			this.#data = []
		}
		return this
	}
	update(value) {
		// Flush pending ops to get the filter
		const pending = this.#ops.splice(0)
		const filterOp = [...pending].reverse().find((o) => o.type === 'filter')
		const filter = filterOp ? filterOp.fn : () => true
		this.#data = updateRows(this.#data, filter, value)
		return this
	}

	// ── Aggregation ─────────────────────────────────────────────────────────

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
	rollup() {
		const data = executeFused(this.#data, this.#ops)
		this.#ops = []
		return new DataSet(rollup(data, this.#config))
	}

	// ── Terminal ────────────────────────────────────────────────────────────

	select(...cols) {
		const result = executeFused(this.#data, this.#ops)
		this.#ops = []
		if (cols.length > 0) {
			const pick = pickKeys(cols)
			return result.map(pick)
		}
		return result
	}

	/**
	 * Derive column definitions from the current data.
	 *
	 * Returns `{ name, type, scale, sortable, filterable, fields, formatter }` for each
	 * column, plus any user-supplied properties from `options.enhancements`.
	 *
	 * @param {Object} [options]
	 * @param {Array<Object>} [options.enhancements=[]] - Per-column overrides keyed by name.
	 * @param {string} [options.language='en-US'] - Locale for formatters.
	 * @param {string} [options.scanMode='fast'] - 'fast' or 'deep'.
	 * @returns {Array<Object>}
	 */
	columnDefs(options = {}) {
		return deriveColumnDefs(this.#data, options)
	}

	// ── Set operations ──────────────────────────────────────────────────────

	union(other) {
		if (Array.isArray(other)) {
			return new DataSet(this.#data.concat(other))
		}
		return new DataSet(this.#data.concat(other.data))
	}
	minus(other) {
		return new DataSet(this.#data.filter((d) => !other.find((x) => deepEqual(x, d))))
	}
	intersect(other) {
		return new DataSet(this.#data.filter((d) => other.find((x) => deepEqual(x, d))))
	}

	// ── Joins ───────────────────────────────────────────────────────────────

	innerJoin(other, condition) {
		return new DataSet(innerJoin(this.#data, other.data, condition))
	}
	leftJoin(other, condition) {
		return new DataSet(leftJoin(this.#data, other.data, condition))
	}
	rightJoin(other, condition) {
		return new DataSet(rightJoin(this.#data, other.data, condition))
	}
	fullJoin(other, condition) {
		return new DataSet(fullJoin(this.#data, other.data, condition))
	}
	crossJoin(other) {
		return new DataSet(crossJoin(this.#data, other.data))
	}
	semiJoin(other, condition) {
		return new DataSet(semiJoin(this.#data, other.data, condition))
	}
	antiJoin(other, condition) {
		return new DataSet(antiJoin(this.#data, other.data, condition))
	}
	nestedJoin(other, condition) {
		return new DataSet(nestedJoin(this.#data, other.data, condition, this.#config.children))
	}
}

export function dataset(data, options = {}) {
	const ds = new DataSet(data)
	ds.config = options
	return ds
}
