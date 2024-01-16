import { omit, pick } from 'ramda'
import { isObject } from '@rokkit/core'
import { deriveSchemaFromValue, deriveTypeFromValue } from './schema'
import { deriveLayoutFromValue } from './layout'

export function deriveNestedSchema(input, scope = '#') {
	// const type = deriveTypeFromValue(input)

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
			elements: atoms.map(({ key, scope }) => ({
				label: key,
				scope: scope
			}))
		}
	}

	if (atoms.length < elements.length) {
		schema.children = [
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

	if (scope !== '#') return schema
	return schema.properties ? [schema] : schema.children
}

export function flattenAttributes(input, scope = '#') {
	return Object.entries(input).map(([key, value]) => ({
		key,
		value,
		type: deriveTypeFromValue(value),
		scope: [scope, key].join('/')
	}))
}

export function flattenObject(input, scope = '#') {
	return flattenAttributes(input, scope).reduce(
		(acc, item) => ({ ...acc, ...flattenElement(item) }),
		{ [scope]: { type: 'object', value: null, scope, key: scope.split('/').slice(-1)[0] } }
	)
}

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
				[element.scope]: pick(['key', 'type', 'scope'], element)
			})
	}
	return { [element.scope]: element }
}

export function generateIndex(data, key = 'scope') {
	const index = data
		.map((item) => ({
			...item,
			_path: item[key],
			_isParent: false,
			_isExpanded: true,
			_isVisible: true,
			_levels: []
		}))
		.sort((a, b) => a[key].localeCompare(b[key]))
		.filter((item) => item[key] !== '#')

	let levels = [0]
	let current = 0

	index.forEach((item, row) => {
		const path = item._path.split('/').slice(1)
		item._depth = path.length - 1
		if (row == 0) {
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

export function generateTreeTable(data, key = 'scope') {
	if (Array.isArray(data)) return generateIndex(data, key)
	if (isObject(data)) return generateIndex(Object.values(flattenObject(data)), key)
	return []
}
