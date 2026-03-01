import { omit } from 'ramda'
import { DEFAULT_FIELDS } from './constants.js'

/**
 * Flattens a nested list of items
 *
 * @param {Array}                         items
 * @param {import('./types).FieldMapping} fields
 * @param {number}                        level
 * @returns {Array}
 */
export function flattenNestedList(items, fields = DEFAULT_FIELDS, level = 0) {
	fields = { ...DEFAULT_FIELDS, ...fields }
	let data = []
	items.forEach((item) => {
		const children = item[fields.children] ?? []
		data = [
			...data,
			{
				...omit([fields.children], item),
				[fields.level]: level,
				[fields.parent]: children.length > 0
			},
			...flattenNestedList(children, fields, level + 1)
		]
	})
	return data
}
