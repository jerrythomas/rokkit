/**
 * Schema and Layout Utils
 *
 * Utilities for working with form schemas, layouts, and their combinations.
 */

/**
 * Derives a schema from a given value.
 *
 * @param {any} value - The value to derive schema from
 * @returns {Object} The derived schema
 */
export function deriveSchemaFromValue(value) {
	if (value === null || value === undefined) {
		return { type: 'string' }
	}

	const type = getValueType(value)
	const schema = { type }

	if (type === 'object') {
		schema.properties = {}
		for (const [key, val] of Object.entries(value)) {
			schema.properties[key] = deriveSchemaFromValue(val)
		}
	} else if (type === 'array' && value.length > 0) {
		schema.items = deriveSchemaFromValue(value[0])
	}

	return schema
}

/**
 * Derives a layout from a given value.
 *
 * @param {any} value - The value to derive layout from
 * @param {string} [scope='#'] - The current path scope
 * @returns {Object} The derived layout
 */
export function deriveLayoutFromValue(value, scope = '#') {
	if (value === null || value === undefined) {
		return { type: 'vertical', elements: [] }
	}

	const type = getValueType(value)

	if (type === 'object') {
		return {
			type: 'vertical',
			elements: Object.keys(value).map((key) => {
				const nested = typeof value[key] === 'object' && value[key] !== null
				const path = `${scope}/${key}`

				if (nested) {
					return {
						key,
						title: key,
						...deriveLayoutFromValue(value[key], path)
					}
				} else {
					return {
						key,
						label: key,
						scope: path,
						props: {}
					}
				}
			})
		}
	} else if (type === 'array' && value.length > 0) {
		// For arrays, we'll derive layout from the first item and make it a template
		const itemLayout = deriveLayoutFromValue(value[0], '#')
		return {
			scope,
			schema: itemLayout
		}
	} else {
		return { type: 'vertical', elements: [{ scope }] }
	}
}

/**
 * Combines schema and layout information for rendering.
 *
 * @param {Object} schema - The schema object
 * @param {Object} layout - The layout object
 * @returns {Object} - The combined schema with layout
 */
export function getSchemaWithLayout(schema, layout) {
	if (!schema || !layout) {
		return schema || layout || {}
	}

	// Start with the layout and add schema properties
	const result = { ...layout }

	if (!result.elements || !Array.isArray(result.elements)) {
		return result
	}

	// Process layout elements and enhance with schema properties
	result.elements = result.elements.map((element) => {
		// Handle nested elements recursively
		if (element.elements && Array.isArray(element.elements)) {
			const nestedSchema = element.key ? schema.properties?.[element.key] : schema
			return {
				...element,
				...getSchemaWithLayout(nestedSchema, element)
			}
		}

		// Get schema for this element
		const elementSchema = element.key ? schema.properties?.[element.key] : null
		if (!elementSchema) {
			return element
		}

		// Merge schema and layout properties
		const props = {
			...(elementSchema || {}),
			...(element.props || {})
		}

		// Add type from schema if not specified in layout
		if (!element.type && elementSchema.type) {
			props.type = elementSchema.type
		}

		// Add validation properties from schema
		if (elementSchema.minLength) props.minLength = elementSchema.minLength
		if (elementSchema.maxLength) props.maxLength = elementSchema.maxLength
		if (elementSchema.min) props.min = elementSchema.min
		if (elementSchema.max) props.max = elementSchema.max
		if (elementSchema.pattern) props.pattern = elementSchema.pattern
		if (elementSchema.format) props.format = elementSchema.format
		if (elementSchema.enum) {
			props.options = elementSchema.enum.map((value) => ({
				value,
				label: value
			}))
		}

		// Handle required field
		if (schema.required && schema.required.includes(element.key)) {
			props.required = true
		}

		return {
			...element,
			props
		}
	})

	return result
}

/**
 * Gets the type of a value.
 *
 * @param {any} value - The value to check
 * @returns {string} - The type name
 */
function getValueType(value) {
	if (Array.isArray(value)) {
		return 'array'
	}

	if (value instanceof Date) {
		return 'date'
	}

	if (value !== null && typeof value === 'object') {
		return 'object'
	}

	if (typeof value === 'number') {
		return Number.isInteger(value) ? 'integer' : 'number'
	}

	return typeof value
}

/**
 * Extracts properties from schema and layout for a specific field
 *
 * @param {Object} schema - The schema definition
 * @param {Object} layout - The layout definition
 * @param {Array} path - Path to the field
 * @returns {Object} - Combined properties for the field
 */
export function getFieldProperties(schema, layout, path) {
	const fieldSchema = getSchemaForPath(schema, path)
	const fieldLayout = getLayoutForPath(layout, path)

	return {
		...fieldSchema,
		...fieldLayout,
		...(fieldLayout?.props || {})
	}
}

/**
 * Gets schema for a specific path
 *
 * @param {Object} schema - The schema object
 * @param {Array} path - The path to the field
 * @returns {Object|null} - The schema at the path
 */
function getSchemaForPath(schema, path) {
	if (!schema || !path || path.length === 0) {
		return schema || null
	}

	let current = schema

	for (const segment of path) {
		if (!current || !current.properties) {
			return null
		}

		current = current.properties[segment]

		if (!current) {
			return null
		}
	}

	return current
}

/**
 * Gets layout for a specific path
 *
 * @param {Object} layout - The layout object
 * @param {Array} path - The path to the field
 * @returns {Object|null} - The layout at the path
 */
function getLayoutForPath(layout, path) {
	if (!layout || !path || path.length === 0 || !layout.elements) {
		return layout || null
	}

	const [first, ...rest] = path

	for (const element of layout.elements) {
		if (element.key === first) {
			if (rest.length === 0) {
				return element
			}

			return getLayoutForPath({ elements: element.elements }, rest)
		}
	}

	return null
}
