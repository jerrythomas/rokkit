/**
 * Derives a type from a given value.
 *
 * @param {*} data
 * @returns
 */
export function deriveTypeFromValue(data) {
	if (data === null || data === undefined) {
		return 'string'
	} else if (Array.isArray(data)) {
		return 'array'
	} else if (data instanceof Date) {
		return 'date'
	} else if (typeof data === 'object' && data !== null) {
		return 'object'
	}
	return typeof data
}

/**
 * Derives a schema for properties of an object.
 *
 * @param {Object} data
 * @returns
 */
function deriveObjectProperties(data) {
	const properties = {}
	for (const [key, value] of Object.entries(data)) {
		properties[key] = deriveSchemaFromValue(value)
	}
	return properties
}

/**
 * Derives a schema from a given value.
 *
 * @param {any} data
 * @returns {import('../types').DataSchema}
 */
export function deriveSchemaFromValue(data) {
	const schema = { type: deriveTypeFromValue(data) }
	if (schema.type === 'array') {
		schema.items = deriveSchemaFromValue(data.length > 0 ? data[0] : {})
	} else if (schema.type === 'object') {
		schema.properties = deriveObjectProperties(data)
	}
	return schema
}
