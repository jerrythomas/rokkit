import { deriveColumns } from './infer'
import { join } from './join'

const __data__ = Symbol('data')
const __opts__ = Symbol('opts')
const __cols__ = Symbol('cols')
// const __pkey__ = Symbol('pkey')
// const __keys__ = Symbol('keys')

const defaultOpts = {
	missingColumns: false
}

function addColumnNames(colnames, row) {
	return [...new Set([...colnames, ...Object.keys(row)])]
}

export class DataFrame {
	constructor(data, opts = defaultOpts) {
		this[__data__] = [...data]
		this[__opts__] = { ...opts }
		this[__cols__] =
			data.length === 0
				? []
				: opts.missingColumns
				? deriveColumns(data)
				: Object.keys(data[0])

		this[__opts__].missingColumns =
			opts.missingColumns || this[__cols__].length == 0
	}

	get data() {
		return this[__data__]
	}

	get columns() {
		return this[__cols__]
	}

	get opts() {
		return this[__opts__]
	}

	insert(row) {
		if (this[__opts__].missingColumns) {
			this[__cols__] = addColumnNames(this[__cols__], row)
		}
		this[__data__].push(row)
		// add row to indexes
	}

	delete(query) {
		this[__data__] = this[__data__].filter((d) => !query(d))
		// reindex all indexes
	}

	update(query, data) {
		if (data) {
			this[__data__] = this[__data__].map((d) =>
				query(d) ? { ...d, ...data } : d
			)
			this[__cols__] = addColumnNames(this[__cols__], data)
			// reindex keys included in data
		} else {
			this[__data__] = this[__data__].map((d) => ({ ...d, ...query(d) }))
			// reindex all because we have no idea what changed
			this[__cols__] = addColumnNames(this[__cols__], this[__data__][0])
		}
	}

	join(df) {
		if (df instanceof DataFrame) {
			return join(this[__data__], df.data)
		} else if (Array.isArray(df)) {
			return join(this[__data__], df)
		}
		throw new TypeError(`expected DataFrame or Array, got ${typeof df}`)
	}
}

export function dataframe(data, opts) {
	return new DataFrame(data, opts)
}
