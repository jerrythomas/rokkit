/**
 * Validation utility for FormBuilder
 * Provides field validation functions that return message objects
 */

/**
 * @typedef {Object} ValidationMessage
 * @property {string} state - Message state: 'error', 'warning', 'info', 'success'
 * @property {string} text - Message text content
 */

/**
 * Validate a single field value against its schema
 * @param {any} value - Field value to validate
 * @param {Object} fieldSchema - Field schema definition
 * @param {string} [fieldLabel] - Field label for error messages
 * @returns {ValidationMessage|null} Validation message or null if valid
 */
export function validateField(value, fieldSchema, fieldLabel = 'Field') {
	if (!fieldSchema) return null

	// Required field validation
	if (fieldSchema.required && isEmpty(value)) {
		return {
			state: 'error',
			text: `${fieldLabel} is required`
		}
	}

	// Skip other validations if field is empty and not required
	if (isEmpty(value)) return null

	// Type-specific validations
	switch (fieldSchema.type) {
		case 'string':
			return validateString(value, fieldSchema, fieldLabel)
		case 'number':
		case 'integer':
			return validateNumber(value, fieldSchema, fieldLabel)
		case 'boolean':
			return validateBoolean(value, fieldSchema, fieldLabel)
		default:
			return null
	}
}

/**
 * Validate string field
 * @private
 * @param {string} value - String value
 * @param {Object} schema - Field schema
 * @param {string} label - Field label
 * @returns {ValidationMessage|null}
 */
function validateString(value, schema, label) {
	// Convert to string if not already
	const stringValue = String(value)

	// Pattern validation
	if (schema.pattern) {
		const regex = new RegExp(schema.pattern)
		if (!regex.test(stringValue)) {
			return {
				state: 'error',
				text: `${label} format is invalid`
			}
		}
	}

	// Length validations
	if (schema.minLength !== undefined && stringValue.length < schema.minLength) {
		return {
			state: 'error',
			text: `${label} must be at least ${schema.minLength} characters`
		}
	}

	if (schema.maxLength !== undefined && stringValue.length > schema.maxLength) {
		return {
			state: 'error',
			text: `${label} must be no more than ${schema.maxLength} characters`
		}
	}

	// Enum validation
	if (schema.enum && !schema.enum.includes(stringValue)) {
		return {
			state: 'error',
			text: `${label} must be one of: ${schema.enum.join(', ')}`
		}
	}

	return null
}

/**
 * Validate number field
 * @private
 * @param {number} value - Number value
 * @param {Object} schema - Field schema
 * @param {string} label - Field label
 * @returns {ValidationMessage|null}
 */
function validateNumber(value, schema, label) {
	const numValue = Number(value)

	// Check if it's a valid number
	if (isNaN(numValue)) {
		return {
			state: 'error',
			text: `${label} must be a valid number`
		}
	}

	// Integer validation
	if (schema.type === 'integer' && !Number.isInteger(numValue)) {
		return {
			state: 'error',
			text: `${label} must be a whole number`
		}
	}

	// Minimum validation (support both min and minimum)
	const minimum = schema.min !== undefined ? schema.min : schema.minimum
	if (minimum !== undefined && numValue < minimum) {
		return {
			state: 'error',
			text: `${label} must be at least ${minimum}`
		}
	}

	// Maximum validation (support both max and maximum)
	const maximum = schema.max !== undefined ? schema.max : schema.maximum
	if (maximum !== undefined && numValue > maximum) {
		return {
			state: 'error',
			text: `${label} must be no more than ${maximum}`
		}
	}

	return null
}

/**
 * Validate boolean field
 * @private
 * @param {boolean} value - Boolean value
 * @param {Object} schema - Field schema
 * @param {string} label - Field label
 * @returns {ValidationMessage|null}
 */
function validateBoolean(value, schema, label) {
	// Convert to boolean if not already
	const boolValue = Boolean(value)

	// For required boolean fields, we might want to ensure it's explicitly true
	if (schema.required && schema.mustBeTrue && !boolValue) {
		return {
			state: 'error',
			text: `${label} must be accepted`
		}
	}

	return null
}

/**
 * Validate all fields in a data object
 * @param {Object} data - Data object to validate
 * @param {Object} schema - Schema object with properties
 * @param {Object} layout - Layout object with element definitions
 * @returns {Object} Validation results keyed by field path
 */
export function validateAll(data, schema, layout) {
	const validationResults = {}

	if (!layout.elements || !schema.properties) return validationResults

	for (const element of layout.elements) {
		if (!element.scope) continue

		const fieldPath = element.scope.replace(/^#\//, '')
		const fieldSchema = getFieldSchema(fieldPath, schema)
		const fieldLabel = element.label || element.title || fieldPath
		const value = getValueByPath(data, fieldPath)

		const result = validateField(value, fieldSchema, fieldLabel)
		if (result) {
			validationResults[fieldPath] = result
		}
	}

	return validationResults
}

/**
 * Create validation messages for informational purposes
 * @param {string} fieldPath - Field path
 * @param {string} state - Message state ('info', 'warning', 'success')
 * @param {string} text - Message text
 * @returns {Object} Field path to message mapping
 */
export function createMessage(fieldPath, state, text) {
	return {
		[fieldPath]: { state, text }
	}
}

/**
 * Common validation patterns
 */
export const patterns = {
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	phone: /^\+?[\d\s\-\(\)]{10,}$/,
	url: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
	zipCode: /^\d{5}(-\d{4})?$/,
	creditCard: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/
}

/**
 * Helper function to check if a value is empty
 * @private
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
	return value === undefined || value === null || value === ''
}

/**
 * Get field schema by path
 * @private
 * @param {string} fieldPath - Field path
 * @param {Object} schema - Schema object
 * @returns {Object|null} Field schema
 */
function getFieldSchema(fieldPath, schema) {
	if (!schema.properties) return null

	const keys = fieldPath.split('/')
	let current = schema.properties

	for (const key of keys) {
		if (current && current[key]) {
			current = current[key]
		} else {
			return null
		}
	}

	return current
}

/**
 * Get value by path from data object
 * @private
 * @param {Object} data - Data object
 * @param {string} path - Field path
 * @returns {any} Field value
 */
function getValueByPath(data, path) {
	const keys = path.split('/')
	let current = data

	for (const key of keys) {
		if (current && typeof current === 'object') {
			current = current[key]
		} else {
			return undefined
		}
	}

	return current
}
