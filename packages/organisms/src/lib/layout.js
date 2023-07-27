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

function deriveArrayLayout(value, scope) {
	return {
		scope,
		schema: deriveLayoutFromValue(value[0], '#')
	}
}

function deriveObjectLayout(value, scope) {
	const elements = Object.entries(value).map(([label, val]) =>
		deriveElementLayout(val, scope, label)
	)
	return { type: 'vertical', elements }
}

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

function isObject(val) {
	return typeof val === 'object' && val !== null && !(val instanceof Date)
}
