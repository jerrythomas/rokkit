/**
 * Pick only the listed keys from an object (native replacement for ramda.pick).
 * @param {string[]} keys
 * @param {Object} obj
 * @returns {Object}
 */
function pick(keys, obj) {
	const result = {}
	for (const key of keys) {
		if (key in obj) result[key] = obj[key]
	}
	return result
}

/**
 * Return a shallow copy with the listed keys removed (native replacement for ramda.omit).
 * @param {string[]} keys
 * @param {Object} obj
 * @returns {Object}
 */
function omit(keys, obj) {
	const keySet = new Set(keys)
	const result = {}
	for (const key of Object.keys(obj)) {
		if (!keySet.has(key)) result[key] = obj[key]
	}
	return result
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
	let parent = null
	let currentKey = ''

	pathArray.forEach((key) => {
		parent = schemaPointer
		schemaPointer = schemaPointer.properties[key]
		currentKey = key
	})

	if (!schemaPointer) throw new Error(`Invalid scope: ${scope}`)

	return {
		key: currentKey,
		props: requiredProps(schemaPointer, parent, currentKey)
	}
}

/**
 * A field's props with `required` as the input reads it: true when the field says so or its
 * parent's JSON Schema `required` list names it. An object's own list is its children's rule —
 * dropped here so it never reaches an input as a truthy `required`.
 */
function requiredProps(fieldSchema, parent, key) {
	const { required, ...props } = fieldSchema
	const listed = Array.isArray(parent?.required) && parent.required.includes(key)
	return required === true || listed ? { ...props, required: true } : props
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
	const temp = element.elements.map((el) => combineElementWithSchema(el, schema))
	return {
		...omit(['component', 'props'], attribute),
		...omit(['scope', 'elements'], element),
		elements: temp
	}
}

/**
 * Get combined schema and layout
 * @param {*} data
 * @param {import('../types').DataSchema} schema
 * @param {import('../types').LayoutSchema} layout
 * @returns {import('../types').LayoutSchema}
 */
export function getSchemaWithLayout(schema, layout) {
	if (!layout) return { elements: [] }
	const combined = omit(['elements'], layout)
	combined.elements =
		layout.elements?.map((element) => combineElementWithSchema(element, schema)) ?? []

	return combined
}
