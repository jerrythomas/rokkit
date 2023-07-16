export function deriveRulesFromSchema(entity) {
	const rules = []
	for (const [key, value] of Object.entries(entity)) {
		rules.push({
			text: 'Required',
			value,
			key
		})
	}
}

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

export function deriveLayoutFromValue(value, scope = '#') {
	// let layout = { type: 'vertical' }
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
