import { pick, omit } from 'ramda'
import { v4 as uuid } from '@lukeed/uuid'
import { deriveSortableColumns, deriveAggregators } from './infer'

import { KEY, COLS, DATA, INDEX, IS_GROUPED } from './symbols'

export class Table {
	constructor(data, key = 'id', cols, table = 'df') {
		this[KEY] = key
		this[COLS] = cols || Object.keys(data[0])
		if (this.columns.includes(this.key)) {
			this[DATA] = data
		} else {
			this[DATA] = data.map((row) => ({ ...row, [this.key]: uuid() }))
			this[COLS] = [...this.columns, 'id']
		}

		this[IS_GROUPED] = this.columns.includes(table)

		if (this.isGrouped) {
			this[DATA] = this.data.map((row) => ({
				...row,
				[table]: new Table(row[table])
			}))
		}

		this[INDEX] = data.map((row, index) => ({ [row[key]]: index }))
	}

	get key() {
		return this[KEY]
	}
	get columns() {
		return this[COLS]
	}
	get data() {
		return this[DATA]
	}
	get isGrouped() {
		return this[IS_GROUPED]
	}

	select(...cols) {
		return this.data.map((row) => pick(cols, row))
	}
	where() {}
	mutate() {}

	groupBy(...cols) {
		const grouped = this.data.reduce((acc, cur) => {
			const group = pick(cols, cur)
			const value = omit(cols, cur)
			const key = JSON.stringify(group)

			if (key in acc) acc[key].df = [...acc[key].df, value]
			else acc[key] = { ...group, df: [value] }
			return acc
		}, {})
		return new Table(Object.values(grouped))
	}

	sortBy(...cols) {
		const opts = deriveSortableColumns(...cols)

		this[DATA] = this.data.sort((a, b) => {
			let result = 0
			for (let i = 0; i < opts.length && result === 0; i++) {
				result = opts[i].sorter(a[opts[i].column], b[opts[i].column])
			}
			return result
		})
		return this
	}

	aggregate(...cols) {
		if (this.isGrouped) {
			this.data.map((row) => ({ ...row, ...row.df.aggregate(cols) }))
		}
		const opts = deriveAggregators(...cols)
		const agg = opts
			.map((col) => {
				const values = this.data.map((row) => +row[col.column])
				let result = col.aggregator(values)
				if (typeof result === 'object') {
					result = Object.keys(result).reduce(
						(acc, suffix) => ({
							...acc,
							[`${col.column}_${suffix}`]: result[suffix]
						}),
						{}
					)
				} else {
					const name = [col.column, col.suffix].join('_')
					result = { [name]: result }
				}
				return result
			})
			.reduce((acc, curr) => ({ ...acc, ...curr }), {})
		return agg
	}
	// fillMissingGroups
	drop() {}
	rename() {}

	insert(row) {
		row = this.key in row ? row : { ...row, [this.key]: uuid() }
		this[DATA] = [...this[DATA], row]
	}

	update(row) {
		const pos = this[INDEX][row[this.key]]
		if (pos !== undefined) this[DATA][pos] = row
	}

	delete(row) {
		const pos = this[INDEX][row[this.key]]
		if (pos !== undefined)
			this[DATA] = [...this[DATA].slice(0, pos), ...this[DATA].slice(pos + 1)]
	}
}
