import { filterOperations } from './filter'

const typeConverters = {
	string: (value) => String(value),
	number: (value) => Number(value),
	boolean: (value) => Boolean(value),
	date: (value) => Date(value),
	mixed: (value) => value
}

export function sortDataStore(dataStore, sortColumns) {
	const indices = [...Array(dataStore.data[0].length).keys()]

	indices.sort((i, j) => {
		let comparison = 0
		for (const { column, order } of sortColumns) {
			if (dataStore.data[column][j] < dataStore.data[column][i]) {
				comparison = order === 'asc' ? 1 : -1
				break
			} else if (dataStore.data[column][j] > dataStore.data[column][i]) {
				comparison = order === 'asc' ? -1 : 1
				break
			}
		}
		return comparison
	})

	const sortedData = {}
	dataStore.columns.forEach((key) => {
		sortedData[key] = indices.map((i) => dataStore.data[key][i])
	})

	return { data: sortedData, columns: dataStore.columns }
}

export function filterColumnarStore(store, filter) {
	const { data, columns, types } = store
	const { column, value, operator } = filter
	let indices = []

	if (column) {
		if (!columns.includes(column)) {
			throw new Error(`Column '${column}' not found in store`)
		}

		indices = data[column].reduce((acc, val, index) => {
			const filterType = types[column]
			const rowType = types[column]
			const typedValue = typeConverters[rowType](val)
			const typedFilter = typeConverters[filterType](value)
			if (filterOperations[operator](typedValue, typedFilter)) {
				acc.push(index)
			}
			return acc
		}, [])
	} else {
		columns.forEach((key) => {
			data[key].forEach((val, index) => {
				const filterType = types[key]
				const rowType = types[key]
				const typedValue = typeConverters[rowType](val)
				const typedFilter = typeConverters[filterType](value)
				if (filterOperations[operator](typedValue, typedFilter)) {
					if (!indices.includes(index)) {
						indices.push(index)
					}
				}
			})
		})
	}

	if (operator.startsWith('!')) {
		const allIndices = [...Array(data[columns[0]].length).keys()]
		indices = allIndices.filter((i) => !indices.includes(i))
	}

	const filteredData = {}
	columns.forEach((key) => {
		filteredData[key] = data[key].filter((rowValue, index) =>
			indices.includes(index)
		)
	})

	return filteredData
}
