import { typeOf } from '@rokkit/data'

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
	const schema = { type: typeOf(data) }
	if (schema.type === 'array') {
		schema.items = deriveSchemaFromValue(data.length > 0 ? data[0] : {})
	} else if (schema.type === 'object') {
		schema.properties = deriveObjectProperties(data)
	}
	return schema
}
