import { createFormatter } from './formatter'

export function tabular(data, columns, options) {
	const { path, separator = '/', actions } = options ?? {}

	let metadata = columns
	if (!Array.isArray(columns) || columns.length === 0) metadata = deriveColumnMetadata(data)

	return {
		data,
		columns: metadata,
		filter: () => {},
		sort: () => {}
	}
}

/**
 * Derives column metadata from the data to be used in a tabular component.
 *
 * @param {Array} data - The data to derive column metadata from.
 * @returns {Array<import('./types').ColumnMetadata>} - The derived column metadata.
 */
export function deriveColumnMetadata(dataArray) {
	if (dataArray.length === 0) {
		return []
	}

	const firstRow = dataArray[0]
	const language = navigator.language || 'en-US' // Get the browser's language or default to 'en-US'

	const columns = []

	for (const key in firstRow) {
		const dataType = typeof firstRow[key]
		const formatter = createFormatter(dataType, language)
		const fields = { text: key }

		if (key.endsWith('_currency')) {
			addCurrencyAttribute(key, columns, language)
		} else {
			columns.push({
				name: key,
				dataType: dataType,
				fields,
				formatter
			})
		}
	}

	return columns
}

function addCurrencyAttribute(key, columns, language) {
	const currencyColumn = key
	const baseColumn = key.replace(/_currency$/, '')

	// Find the existing column and update its currency attribute
	const existingColumn = columns.find((column) => column.name === baseColumn)
	existingColumn.dataType = 'currency'
	existingColumn.formatter = createFormatter('currency', language, 2)
	if (existingColumn) {
		existingColumn.fields = {
			...existingColumn.fields,
			currency: currencyColumn
		}
	}
	return columns
}
