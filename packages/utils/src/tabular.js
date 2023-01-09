import { filterOperations } from './filter'

export function filterObjectArray(data, options) {
	const { column, value, operator } = options
	let filtered = data
	if (!operator || !value) return filtered
	if (column) {
		filtered = data.filter((row) =>
			filterOperations[operator](row[column], value)
		)
	} else {
		const op = operator.startsWith('!') ? operator.slice(1) : operator

		filtered = data.filter((row) =>
			Object.keys(row).find((key) => filterOperations[op](row[key], value))
		)
		if (op != operator) {
			filtered = data.filter((row) => !filtered.includes(row))
		}
	}

	return filtered
}

export function filterData(data, filters) {
	let filteredData = data
	filters.forEach((filter) => {
		filteredData = filterObjectArray(filteredData, filter)
	})
	return filteredData
}
