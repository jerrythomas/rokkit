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
	combined.elements = layout.elements.map((element) =>
		combineElementWithSchema(element, schema)
	)

	return combined
}

/**
 * Combines an element from layout with schema
 *
 * @param {import('../types').LayoutElement} element
 * @param {import('../types').DataSchema} schema
 * @returns
 */
function combineElementWithSchema(element, schema) {
	const { scope } = element
	let attribute = findAttributeByPath(scope, schema)

	if (Array.isArray(element.elements)) {
		attribute = combineNestedElementsWithSchema(element, attribute, schema)
	} else if (element.schema || attribute.props?.type === 'array') {
		attribute = combineArrayElementsWithSchema(element, attribute)
	} else {
		attribute = combineBasicElementsWithSchema(element, attribute)
	}

	return attribute
}

/**
 * Combines nested elements with schema
 *
 * @param {import('../types').LayoutElement} element
 * @param {import('../types').LayoutSchema} attribute
 * @param {import('../types').DataSchema} schema
 * @returns
 */
function combineNestedElementsWithSchema(element, attribute, schema) {
	const temp = element.elements.map((element) =>
		combineElementWithSchema(element, schema)
	)
	return {
		...omit(['component', 'props'], attribute),
		...omit(['scope', 'elements'], element),
		elements: temp
	}
}

/**
 * Combines array elements with schema
 *
 * @param {import('../types').LayoutElement} element
 * @param {import('../types').LayoutSchema} attribute
 */
function combineArrayElementsWithSchema(element, attribute) {
	const schema = getSchemaWithLayout(attribute.props.items, element.schema)
	return {
		...attribute,
		...pick(['component'], element),
		props: {
			...omit(['items'], attribute.props),
			schema
		}
	}
}

/**
 * Combines basic elements with schema
 * @param {import('../types').LayoutElement} element
 * @param {import('../types').LayoutSchema} attribute
 * @returns
 */
function combineBasicElementsWithSchema(element, attribute) {
	return {
		...attribute,
		...pick(['component'], element),
		props: {
			...omit(['scope', 'props', 'component', 'key'], element),
			...attribute.props,
			...element.props
		}
	}
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
