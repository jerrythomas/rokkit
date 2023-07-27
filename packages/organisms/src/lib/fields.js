import { omit, pick } from 'ramda'

/**
 * Get combined schema and layout
 * @param {*} data
 * @param {import('../types').DataSchema} schema
 * @param {import('../types').LayoutSchema} layout
 * @returns {import('../types').LayoutSchema}
 */
export function getSchemaWithLayout(schema, layout) {
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
			attribute = { ...attribute, ...pick(['component'], element) }
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
	if (!scope) return { props: { ...schema } }

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
