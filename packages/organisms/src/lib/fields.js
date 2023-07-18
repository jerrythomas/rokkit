import { omit } from 'ramda'

/**
 * Derives a schema from a given value.
 *
 * @param {any} data
 * @returns {import('../types').DataSchema}
 */
export function deriveSchemaFromValue(data) {
	const schema = {}

	if (Array.isArray(data)) {
		schema['type'] = 'array'
		schema['items'] = deriveSchemaFromValue(data.length > 0 ? data[0] : {})
	} else if (data instanceof Date) {
		schema['type'] = 'date'
	} else if (typeof data === 'object' && data !== null) {
		schema['type'] = 'object'
		schema['properties'] = {}

		for (const [key, value] of Object.entries(data)) {
			schema['properties'][key] = deriveSchemaFromValue(value)
		}
	} else {
		schema['type'] = data ? typeof data : 'undefined'
	}

	return schema
}

/**
 * Derives a layout from a given value.
 * @param {any} value
 * @param {string} scope
 * @returns {import('../types').DataLayout}
 */
export function deriveLayoutFromValue(value, scope = '#') {
	let elements = []
	if (typeof value === 'object' && value !== null) {
		for (const [label, val] of Object.entries(value)) {
			let element = { label, scope: `${scope}/${label}` }

			if (
				typeof val === 'object' &&
				val !== null &&
				!Array.isArray(val) &&
				!(val instanceof Date)
			) {
				element = {
					...element,
					...deriveLayoutFromValue(val, `${scope}/${label}`)
				}
			}
			elements.push(element)
		}
	}
	return { type: 'vertical', elements }
}

/**
 * Get combined schema and layout
 * @param {*} data
 * @param {import('../types').DataSchema} schema
 * @param {import('../types').LayoutSchema} layout
 * @returns {import('../types').LayoutSchema}
 */
export function getSchemaWithLayout(schema, layout) {
	// if (!schema) schema = deriveSchemaFromValue(data)
	// if (!layout) layout = deriveLayoutFromValue(data)

	let combined = omit(['elements'], layout)
	combined.elements = combineElementsWithSchema(layout.elements, schema)

	return combined
}

/**
 * Combine elements from layout with schema
 *
 * @param {*} elements
 * @param {*} schema
 * @returns
 */
export function combineElementsWithSchema(elements, schema) {
	let combined = []
	elements.forEach((element) => {
		const { scope } = element
		let attribute = findAttributeByPath(scope, schema)

		if (Array.isArray(element.elements)) {
			const temp = combineElementsWithSchema(element.elements, schema)
			attribute = {
				...omit(['component', 'props'], attribute),
				...omit(['scope', 'elements'], element),
				elements: temp
			}
		} else {
			attribute.component = element.component ?? 'input'
			attribute.props = {
				...omit(['scope', 'props', 'component', 'key'], element),
				...attribute.props,
				...element.props
			}
		}

		combined.push(attribute)
	})

	return combined
}

/**
 * Find an attribute in a schema by path
 * @param {string} scope
 * @param {import('../types').DataSchema} schema
 * @returns {import('../types').LayoutSchema}
 * @throws {Error} Invalid path
 */
export function findAttributeByPath(scope, schema) {
	const pathArray = scope.split('/').slice(1)
	let schemaPointer = schema
	let currentKey = ''

	pathArray.forEach((key) => {
		schemaPointer = schemaPointer.properties[key]
		currentKey = key
	})

	if (!schemaPointer) throw new Error('Invalid scope: ' + scope)

	return {
		key: currentKey,
		props: { ...schemaPointer }
	}
}
