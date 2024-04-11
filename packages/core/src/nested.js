import { omit } from 'ramda'
import { defaultFields } from './constants'

export function flattenNestedList(items, fields = defaultFields, level = 0) {
	fields = { ...defaultFields, ...fields }
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

/**
 * Converts a path slug to a value in the menu
 *
 * @param {string} slug
 * @returns {any}
 */
export function findValueFromPath(slug, data, fields) {
	fields = { ...defaultFields, ...fields }
	const keys = slug.split('/')
	let items = data
	let value = null

	keys.forEach((key, index) => {
		const match = items.find((item) => item[fields.key] === key)
		if (match) {
			if (index < keys.length - 1) {
				match[fields.isOpen] = true
				items = match[fields.children]
			} else {
				value = match
			}
		}
	})
	return value
}
