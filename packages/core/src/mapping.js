import { defaultFields } from './constants'

/**
 * Get the component to be used to render the item.
 * If the component is null or undefined, it will return the default component.
 *
 * @param {object|string} value
 * @param {import('./types.js').FieldMapping} fields
 * @param {import('./types.js').ComponentMap} using
 */
export function getComponent(value, fields, using) {
	return fields.component && typeof value == 'object'
		? using[value[fields.component]] ?? using.default
		: using.default
}

/**
 * Get the icon for the item. If the icon is an object, it will use the state to determine which icon to use.
 *
 * @param {object|string} value
 * @param {import('./types.js').FieldMapping} fields
 */
export function getIcon(value, fields = defaultFields) {
	if (fields.icon === undefined || typeof (value ?? '') !== 'object')
		return null

	return typeof value[fields.icon] == 'object'
		? value[fields.icon][value[fields.state]]
		: value[fields.icon]
}

export function getValue(node, fields = defaultFields) {
	return typeof node === 'object' && node !== null
		? node[fields.value] ?? node[fields.text]
		: node
}

export function getText(node, fields = defaultFields) {
	return typeof node === 'object' && node !== null ? node[fields.text] : node
}
