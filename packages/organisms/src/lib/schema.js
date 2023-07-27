function deriveBasicSchema(data) {
	return { type: typeof data }
}
function deriveStringSchema() {
	return { type: 'string' }
}
function deriveDateSchema() {
	return { type: 'date' }
}
function deriveObjectSchema(data) {
	const properties = {}
	for (const [key, value] of Object.entries(data)) {
		properties[key] = deriveSchemaFromValue(value)
	}
	return {
		type: 'object',
		properties: properties
	}
}

function deriveArraySchema(data) {
	return {
		type: 'array',
		items: deriveSchemaFromValue(data.length > 0 ? data[0] : {})
	}
}
/**
 * Derives a schema from a given value.
 *
 * @param {any} data
 * @returns {import('../types').DataSchema}
 */
export function deriveSchemaFromValue(data) {
	if (data === null || data === undefined) {
		return deriveStringSchema()
	} else if (Array.isArray(data)) {
		return deriveArraySchema(data)
	} else if (data instanceof Date) {
		return deriveDateSchema()
	} else if (typeof data === 'object' && data !== null) {
		return deriveObjectSchema(data)
	} else {
		return deriveBasicSchema(data)
	}
}
