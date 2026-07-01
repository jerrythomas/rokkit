import { isObject } from '@rokkit/core'

/**
 * Derives a layout from a given object value.
 * @param {Object} val
 * @param {string} scope
 * @param {string} label
 * @returns {import('../types').DataLayout}
 */
function deriveElementLayout(val, scope, label) {
	const path = `${scope}/${label}`
	if (isObject(val)) {
		return {
			title: label,
			scope: path,

			...deriveLayoutFromValue(val, path)
		}
	}
	return { label, scope: path }
}

/**
 * Derives a layout from a given object value.
 * @param {Object} value
 * @param {string} scope
 * @returns {import('../types').DataLayout}
 */
function deriveObjectLayout(value, scope) {
	const elements = Object.entries(value).map(([label, val]) =>
		deriveElementLayout(val, scope, label)
	)
	return { type: 'vertical', elements }
}

/**
 * Derives a layout from a given array value.
 * @param {Array<any>} value
 * @param {string} scope
 * @returns {import('../types').DataLayout}
 */
function deriveArrayLayout(value, scope) {
	const schema = deriveLayoutFromValue(value[0], '#')
	return {
		scope,
		schema
	}
}
/**
 * Derives a layout from a given value.
 * @param {any} value
 * @param {string} scope
 * @returns {import('../types').DataLayout}
 */
export function deriveLayoutFromValue(value, scope = '#') {
	if (Array.isArray(value)) {
		return deriveArrayLayout(value, scope)
	} else if (typeof value === 'object' && value !== null) {
		return deriveObjectLayout(value, scope)
	}
	return { type: 'vertical', elements: [{ scope }] }
}

/**
 * Build an inner element from a JSON-Schema property. Objects recurse into a
 * nested {title, scope, type:'vertical', elements:[...]} group; primitives
 * yield a scoped leaf. Mirrors `deriveElementLayout` but reads the shape from
 * schema's `properties` rather than from the data value.
 *
 * @param {Object} propSchema
 * @param {string} scope
 * @param {string} label
 * @returns {import('../types').LayoutElement}
 */
function deriveElementFromSchema(propSchema, scope, label) {
	const path = `${scope}/${label}`
	if (propSchema && propSchema.type === 'object' && isObject(propSchema.properties)) {
		return {
			title: label,
			scope: path,
			...deriveLayoutFromSchema(propSchema, path)
		}
	}
	return { label, scope: path }
}

/**
 * Derive a layout directly from a JSON-Schema definition. Used when a schema
 * is supplied but no explicit layout is — one element per top-level property
 * in declaration order. This is the correct fallback when a schema is
 * present: the schema is the source of truth for which fields exist, not the
 * (possibly-empty) initial data.
 *
 * @param {Object} schema  JSON-Schema fragment (object type with `properties`)
 * @param {string} scope   Base scope pointer (defaults to root)
 * @returns {import('../types').DataLayout}
 */
export function deriveLayoutFromSchema(schema, scope = '#') {
	if (!isObject(schema) || !isObject(schema.properties)) {
		return { type: 'vertical', elements: [] }
	}
	const elements = Object.entries(schema.properties).map(([label, propSchema]) =>
		deriveElementFromSchema(propSchema, scope, label)
	)
	return { type: 'vertical', elements }
}
