import { pick } from 'ramda'
import { _DATA, _COLUMNS } from './symbols'

export class TableIndex {
	constructor(table, ...cols) {
		this[_COLUMNS] = cols
		this.reindex(table)
	}

	get columns() {
		return this[_COLUMNS]
	}

	reindex(table) {
		this[_DATA] = table.data.map((d, index) => ({
			...pick(this.columns, d),
			index
		}))
	}
}
