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

const isSchemaObject = (value) => Boolean(value) && typeof value === 'object'

/** One step down: the JSON Schema child, else the flat one. */
function childSchema(parent, key) {
	if (!isSchemaObject(parent)) return undefined
	return parent.properties?.[key] ?? parent[key]
}

/**
 * A field's schema by slash path (`'addr/city'`), or null.
 *
 * Each step looks in the current schema's `properties` first — how JSON Schema nests an object's
 * fields — and falls back to the key directly on it, the flat form some schemas here use
 * (`properties.a.b`). `properties` first, so a nested field named like a schema keyword (`type`)
 * resolves to the field, not to its parent's keyword.
 *
 * @param {Object | null | undefined} schema
 * @param {string} path
 * @returns {Object | null}
 */
export function schemaAt(schema, path) {
	// The root's own keys are the schema's keywords, never fields: only its `properties` count.
	let current = schema?.properties?.[path.split('/')[0]]
	for (const key of path.split('/').slice(1)) current = childSchema(current, key)
	return isSchemaObject(current) ? current : null
}

/**
 * Whether the field at a slash path must have a value.
 *
 * JSON Schema states it on the PARENT object — `{ type: 'object', required: ['city'], … }` — at
 * any depth. The field-level `required: true` form is also honoured. An object's own `required`
 * array is its children's rule, never a claim that the object itself is required.
 *
 * @param {Object | null | undefined} schema
 * @param {string} path
 * @returns {boolean}
 */
export function requiredAt(schema, path) {
	if (schemaAt(schema, path)?.required === true) return true
	const keys = path.split('/')
	const key = keys.pop()
	const parent = keys.length > 0 ? schemaAt(schema, keys.join('/')) : schema
	return Array.isArray(parent?.required) && parent.required.includes(key)
}
