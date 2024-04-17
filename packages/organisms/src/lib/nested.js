import { omit, pick } from 'ramda'
import { isObject } from '@rokkit/core'
import { deriveSchemaFromValue, deriveTypeFromValue } from './schema'
import { deriveLayoutFromValue } from './layout'

/**
 * Derives a nested schema from an object
 *
 * @param {Object} input - The object to derive the schema from
 * @param {String} scope - The scope of the object
 * @returns {Object} The derived schema
 */
export function deriveNestedSchema(input, scope = '#') {
	const elements = flattenAttributes(input)
	const atoms = elements.filter(({ type }) => !['object', 'array'].includes(type))

	let schema = {
		type: 'object'
	}

	if (atoms.length > 0) {
		schema.properties = atoms.reduce(
			(acc, { key, type, value }) => ({
				...acc,
				[key]: {
					type,
					default: value
				}
			}),
			{}
		)
		schema.layout = {
			type: 'vertical',
			elements: atoms.map((el) => ({ label: el.key, scope: el.scope }))
		}
	}

	if (atoms.length < elements.length) {
		schema.children = deriveSchemaForChildren(elements, scope)
	}

	if (scope !== '#') return schema
	return schema.properties ? [schema] : schema.children
}

/**
 * Derives the children of an object
 *
 * @param {Array} elements - The elements to derive children from
 * @param {String} scope - The scope of the object
 * @returns {Array} The derived children
 */
function deriveSchemaForChildren(elements, scope) {
	return [
		...elements
			.filter(({ type }) => type === 'object')
			.map((item) => ({
				...omit(['value', 'scope'], item),
				scope: [scope, item.key].join('/'),
				...deriveNestedSchema(item.value, [scope, item.key].join('/'))
			})),
		...elements
			.filter(({ type }) => type === 'array')
			.map((item) => ({
				...omit(['value'], item),
				default: [],
				scope: [scope, item.key].join('/'),
				items: deriveSchemaFromValue(item.value.length ? item.value[0] : null),
				layout: deriveLayoutFromValue(item.value.length ? item.value[0] : null)
			}))
	]
}

/**
 * Flattens an object into an array of key-value pairs
 *
 * @param {Object} input - The object to flatten
 * @param {String} scope - The scope of the object
 */
export function flattenAttributes(input, scope = '#') {
	return Object.entries(input).map(([key, value]) => ({
		key,
		value,
		type: deriveTypeFromValue(value),
		scope: [scope, key].join('/')
	}))
}

/**
 * Flattens an object into a flat object
 *
 * @param {Object} input - The object to flatten
 * @param {String} scope - The scope of the object
 */
export function flattenObject(input, scope = '#') {
	return flattenAttributes(input, scope).reduce(
		(acc, item) => ({ ...acc, ...flattenElement(item) }),
		{
			[scope]: {
				type: 'object',
				value: input,
				scope,
				key: scope.split('/').slice(-1)[0]
			}
		}
	)
}

/**
 * Flattens an element into a flat object
 *
 * @param {Object} element - The element to flatten
 */
export function flattenElement(element) {
	if (element.type === 'object') {
		return flattenObject(element.value, element.scope)
	} else if (element.type === 'array') {
		return element.value
			.map((item, index) => ({
				value: item,
				scope: [element.scope, '[' + index + ']'].join('/'),
				key: '[' + index + ']',
				type: deriveTypeFromValue(item)
			}))
			.reduce((acc, item) => ({ ...acc, ...flattenElement(item) }), {
				[element.scope]: pick(['key', 'type', 'scope', 'value'], element)
			})
	}
	return { [element.scope]: element }
}

/**
 * Generates an index array referencing the input data
 *
 * @param {Object} data - The flat object to index
 * @param {String} key - The key to use as index
 */
export function generateIndex(data, key = 'scope') {
	const index = data
		.map((item) => ({
			...item,
			_path: item[key],
			_isParent: false,
			_isExpanded: true,
			_levels: []
		}))
		.sort((a, b) => a[key].localeCompare(b[key]))
		.filter((item) => item[key] !== '#')

	let levels = [0]
	let current = 0

	index.forEach((item, row) => {
		const path = item._path.split('/').slice(1)
		item._depth = path.length - 1
		if (row === 0) {
			item._levels = [0]
		} else if (path.length > levels.length) {
			index[row - 1]._isParent = true
			item._levels = [...levels, 0]
		} else {
			current = levels[path.length - 1] + 1
			item._levels = [...levels.slice(0, path.length - 1), current]
		}
		levels = item._levels
	})
	return index
}

/**
 * Generates a tree table from the input data
 *
 * @param {Object} data - The data to generate the tree table from
 * @param {String} key - The key to use as index
 * @param {Boolean} ellipsis - Whether to truncate the value
 */
export function generateTreeTable(data, key = 'scope', ellipsis = false) {
	let result = []
	if (Array.isArray(data)) result = generateIndex(data, key)
	if (isObject(data)) result = generateIndex(Object.values(flattenObject(data)), key)

	if (ellipsis) {
		result = result.map((item) => ({
			...omit(['value'], item),
			value: ['array', 'object'].includes(item.type) ? '...' : item.value
		}))
	}
	return result
}
