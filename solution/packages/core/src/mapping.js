import { DEFAULT_FIELDS } from './constants.js'

/**
 * Gets the attribute from the node
 * @param {*}      node
 * @param {string} attr
 * @returns {*}
 */
export function getAttribute(node, attr) {
	return typeof node === 'object' && node !== null && attr !== null ? node[attr] : null
}

/**
 * Fetches the fieldmapping for a child node
 *
 * @param {import('./types').FieldMapping} fields
 * @returns {import('./types').FieldMapping}
 */
export function getNestedFields(fields) {
	return { ...DEFAULT_FIELDS, ...(fields.fields ?? fields) }
}
