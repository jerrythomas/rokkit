import {
	object as objectSchema,
	string,
	number,
	boolean,
	array,
	minLength,
	maxLength,
	minValue,
	maxValue,
	integer,
	email,
	url,
	regex,
	pipe
} from 'valibot'

// Import validation helpers from existing validator
import { getPatternValidator, getRangeValidator, getTypeValidator } from '../../lib/validator'

/**
 * Validates a form value against a schema
 *
 * @param {Object} schema - The schema definition
 * @param {Object} value - The value to validate
 * @param {Object} layout - Optional layout with additional validations
 * @returns {Object} - Validation result with valid flag and errors
 */
export function validate(schema, value, layout = null) {
	// Track all validation errors
	const errors = {}
	let valid = true

	// Run HTML validations first
	const htmlValidationResult = validateHtmlRules(schema, value, layout)
	if (!htmlValidationResult.valid) {
		valid = false
		Object.assign(errors, htmlValidationResult.errors)
	}

	// Extract rule-based validations from schema and layout
	const validationRules = extractValidationRules(schema, layout)

	// Run rule-based validations if defined
	if (validationRules && Object.keys(validationRules).length > 0) {
		const rulesValidationResult = validateWithRules(value, validationRules)
		if (!rulesValidationResult.valid) {
			valid = false
			Object.assign(errors, rulesValidationResult.errors)
		}
	}

	// Run custom validations if defined
	if (schema.validations || (layout && layout.validations)) {
		const customValidationResult = validateCustomRules(schema, value, layout)
		if (!customValidationResult.valid) {
			valid = false
			Object.assign(errors, customValidationResult.errors)
		}
	}

	// Run schema-based validations using valibot as a fallback
	try {
		// Convert schema format to valibot format
		const valibotSchema = convertToValibotSchema(schema)

		// Run validation
		valibotSchema.parse(value)
	} catch (error) {
		valid = false

		// Format validation errors
		if (error.issues && Array.isArray(error.issues)) {
			error.issues.forEach((issue) => {
				const path = issue.path.map((p) => p.key).join('.')
				// Only add if not already added by custom validation
				if (!errors[path]) {
					errors[path] = issue.message
				}
			})
		}
	}

	return {
		valid,
		errors
	}
}

/**
 * Converts our schema format to Valibot schema
 *
 * @param {Object} schema - Our custom schema
 * @returns {Object} - Valibot schema
 */
function convertToValibotSchema(schema) {
	if (!schema) return objectSchema({})

	// Handle root schema
	if (schema.type === 'object' && schema.properties) {
		const properties = {}

		// Convert each property
		for (const [key, prop] of Object.entries(schema.properties)) {
			properties[key] = convertPropertyToValibotSchema(prop)
		}

		return objectSchema(properties)
	}

	// Fallback
	return objectSchema({})
}

/**
 * Validates against HTML standard validation rules
 *
 * @param {Object} schema - The schema definition
 * @param {Object} value - The value to validate
 * @param {Object} layout - Optional layout with additional validations
 * @returns {Object} - Validation result
 */
function validateHtmlRules(schema, value, layout = null) {
	const errors = {}

	function processProperties(schema, value, path = []) {
		if (!schema || !schema.properties || !value) return

		for (const [key, propSchema] of Object.entries(schema.properties)) {
			const currentPath = [...path, key]
			const currentValue = value[key]
			const currentPathStr = currentPath.join('.')

			// Skip validation for undefined values unless required
			if (currentValue === undefined || currentValue === null) {
				if (schema.required && schema.required.includes(key)) {
					errors[currentPathStr] = `${key} is required`
				}
				continue
			}

			// Get layout properties if available
			const layoutProps = layout ? findLayoutElement(layout, currentPath) : {}

			// Validate based on type
			switch (propSchema.type) {
				case 'string':
					validateString(currentValue, propSchema, layoutProps, currentPathStr, errors)
					break
				case 'number':
				case 'integer':
					validateNumber(currentValue, propSchema, layoutProps, currentPathStr, errors)
					break
				case 'boolean':
					// No standard HTML validations for boolean
					break
				case 'object':
					processProperties(propSchema, currentValue, currentPath)
					break
				case 'array':
					if (Array.isArray(currentValue)) {
						validateArray(currentValue, propSchema, layoutProps, currentPathStr, errors)
						currentValue.forEach((item, index) => {
							if (propSchema.items && typeof item === 'object') {
								processProperties(propSchema.items, item, [...currentPath, index])
							}
						})
					}
					break
			}
		}
	}

	// Start validation from root
	processProperties(schema, value)

	return {
		valid: Object.keys(errors).length === 0,
		errors
	}
}

/**
 * Validates using extracted rules from schema and layout
 *
 * @param {Object} value - The value to validate
 * @param {Object} rules - Rules grouped by path
 * @returns {Object} - Validation result
 */
function validateWithRules(value, rules) {
	const errors = {}

	// For each path with rules
	Object.entries(rules).forEach(([path, pathRules]) => {
		// Get the value at this path
		const pathValue = getValueAtPath(value, path)

		// Validate against all rules for this path
		pathRules.forEach((rule) => {
			const validator =
				typeof rule.validator === 'function' ? rule.validator : createValidatorFromRule(rule)

			if (!validator(pathValue)) {
				errors[path] = rule.message || `Validation failed for ${path}`
			}
		})
	})

	return {
		valid: Object.keys(errors).length === 0,
		errors
	}
}

/**
 * Creates a validator function from a rule definition
 *
 * @param {Object} rule - The validation rule
 * @returns {Function} - Validator function
 */
function createValidatorFromRule(rule) {
	if (rule.pattern) {
		return getPatternValidator(rule.pattern)
	} else if (rule.min !== undefined || rule.max !== undefined) {
		return getRangeValidator(rule.min, rule.max)
	} else if (rule.type) {
		return getTypeValidator(rule.type)
	} else if (rule.required) {
		return (value) => value !== undefined && value !== null && value !== ''
	}

	// Default pass-through validator
	return () => true
}

/**
 * Gets a value at a path within an object
 *
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-notation path
 * @returns {any} - The value at the path
 */
function getValueAtPath(obj, path) {
	if (!obj || !path) return obj

	const pathArr = path.split('.')
	let current = obj

	for (const key of pathArr) {
		if (current === null || current === undefined) return undefined
		current = current[key]
	}

	return current
}

/**
 * Extracts validation rules from schema and layout
 *
 * @param {Object} schema - The schema definition
 * @param {Object} layout - The layout definition
 * @returns {Object} - Rules grouped by path
 */
function extractValidationRules(schema, layout) {
	const rules = {}

	// Extract rules from schema
	extractRulesFromSchema(schema, '', rules)

	// Extract rules from layout
	if (layout && layout.elements) {
		extractRulesFromLayout(layout.elements, '', rules)
	}

	return rules
}

/**
 * Recursively extracts validation rules from a schema
 *
 * @param {Object} schema - Schema object
 * @param {string} path - Current path
 * @param {Object} rules - Rules accumulator
 */
function extractRulesFromSchema(schema, path, rules) {
	if (!schema || !schema.properties) return

	// Process each property in the schema
	Object.entries(schema.properties).forEach(([key, prop]) => {
		const propPath = path ? `${path}.${key}` : key
		const propRules = []

		// Create rules based on property definition
		if (prop.required || (schema.required && schema.required.includes(key))) {
			propRules.push({ required: true, message: `${key} is required` })
		}

		if (prop.type) {
			propRules.push({ type: prop.type, message: `${key} must be a ${prop.type}` })
		}

		if (prop.min !== undefined) {
			propRules.push({ min: prop.min, message: `${key} must be at least ${prop.min}` })
		}

		if (prop.max !== undefined) {
			propRules.push({ max: prop.max, message: `${key} must be at most ${prop.max}` })
		}

		if (prop.minLength !== undefined) {
			propRules.push({
				validator: (v) => v === null || v === undefined || v.length >= prop.minLength,
				message: `${key} must be at least ${prop.minLength} characters`
			})
		}

		if (prop.maxLength !== undefined) {
			propRules.push({
				validator: (v) => v === null || v === undefined || v.length <= prop.maxLength,
				message: `${key} must be at most ${prop.maxLength} characters`
			})
		}

		if (prop.pattern) {
			propRules.push({
				pattern: prop.pattern,
				message: `${key} does not match the required pattern`
			})
		}

		// Add rules to the accumulator
		if (propRules.length > 0) {
			rules[propPath] = rules[propPath] || []
			rules[propPath].push(...propRules)
		}

		// Recurse for nested objects
		if (prop.type === 'object' && prop.properties) {
			extractRulesFromSchema(prop, propPath, rules)
		}
	})
}

/**
 * Recursively extracts validation rules from a layout
 *
 * @param {Array} elements - Layout elements
 * @param {string} path - Current path
 * @param {Object} rules - Rules accumulator
 */
function extractRulesFromLayout(elements, path, rules) {
	if (!elements || !Array.isArray(elements)) return

	elements.forEach((element) => {
		const elemPath = element.key ? (path ? `${path}.${element.key}` : element.key) : path

		// Extract validations from layout element
		if (element.validations && Array.isArray(element.validations)) {
			rules[elemPath] = rules[elemPath] || []
			rules[elemPath].push(...element.validations)
		}

		// Add required rule if specified in layout
		if (element.required) {
			rules[elemPath] = rules[elemPath] || []
			rules[elemPath].push({
				required: true,
				message: `${element.label || element.key} is required`
			})
		}

		// Recurse for nested elements
		if (element.elements && Array.isArray(element.elements)) {
			extractRulesFromLayout(element.elements, elemPath, rules)
		}
	})
}

/**
 * Validates custom rules defined in schema or layout
 */
function validateCustomRules(schema, value, layout = null) {
	const errors = {}

	// Run schema-level validations
	if (schema.validations && typeof schema.validations === 'function') {
		try {
			const result = schema.validations(value)
			if (result !== true && result !== undefined) {
				if (typeof result === 'string') {
					errors[''] = result
				} else if (typeof result === 'object') {
					Object.assign(errors, result)
				}
			}
		} catch (e) {
			console.error('Error in custom validation:', e)
			errors[''] = 'Validation error occurred'
		}
	}

	// Run layout-level validations
	if (layout && layout.validations && typeof layout.validations === 'function') {
		try {
			const result = layout.validations(value)
			if (result !== true && result !== undefined) {
				if (typeof result === 'string') {
					errors[''] = result
				} else if (typeof result === 'object') {
					Object.assign(errors, result)
				}
			}
		} catch (e) {
			console.error('Error in custom validation:', e)
			errors[''] = 'Validation error occurred'
		}
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors
	}
}

/**
 * Converts a property schema to Valibot schema
 *
 * @param {Object} prop - Property schema
 * @returns {Object} - Valibot property schema
 */
function convertPropertyToValibotSchema(prop) {
	if (!prop || !prop.type) return string()

	switch (prop.type) {
		case 'string':
			return createStringSchema(prop)
		case 'number':
		case 'integer':
			return createNumberSchema(prop)
		case 'boolean':
			return boolean()
		case 'object':
			if (prop.properties) {
				const properties = {}
				for (const [key, subProp] of Object.entries(prop.properties)) {
					properties[key] = convertPropertyToValibotSchema(subProp)
				}
				return objectSchema(properties)
			}
			return objectSchema({})
		case 'array':
			if (prop.items) {
				// Create array schema with item validation
				return array(convertPropertyToValibotSchema(prop.items))
			}
			return array(string())
		default:
			return string()
	}
}

/**
 * Creates a Valibot string schema with validations
 *
 * @param {Object} prop - Property schema
 * @returns {Object} - Valibot string schema
 */
function createStringSchema(prop) {
	let schema = string()

	// Add validations
	const validations = []

	// Minimum length
	if (prop.minLength !== undefined) {
		validations.push(minLength(prop.minLength, `Must be at least ${prop.minLength} characters`))
	}

	// Maximum length
	if (prop.maxLength !== undefined) {
		validations.push(maxLength(prop.maxLength, `Cannot exceed ${prop.maxLength} characters`))
	}

	// Pattern validation
	if (prop.pattern) {
		validations.push(regex(new RegExp(prop.pattern), 'Invalid format'))
	}

	// Format validations
	if (prop.format) {
		switch (prop.format) {
			case 'email':
				validations.push(email('Invalid email address'))
				break
			case 'url':
				validations.push(url('Invalid URL'))
				break
			// Add other formats as needed
		}
	}

	// Apply validations
	if (validations.length > 0) {
		schema = pipe(schema, ...validations)
	}

	return schema
}

/**
 * Creates a Valibot number schema with validations
 *
 * @param {Object} prop - Property schema
 * @returns {Object} - Valibot number schema
 */
function createNumberSchema(prop) {
	let schema = number()

	// Add validations
	const validations = []

	// Minimum value
	if (prop.min !== undefined) {
		validations.push(minValue(prop.min, `Must be at least ${prop.min}`))
	}

	// Maximum value
	if (prop.max !== undefined) {
		validations.push(maxValue(prop.max, `Cannot exceed ${prop.max}`))
	}

	// Integer validation
	if (prop.type === 'integer') {
		validations.push(integer('Must be an integer'))
	}

	// Apply validations
	if (validations.length > 0) {
		schema = pipe(schema, ...validations)
	}

	return schema
}

/**
 * Validates a string value against schema rules
 */
function validateString(value, schema, layoutProps, path, errors) {
	if (typeof value !== 'string') {
		errors[path] = 'Must be a string'
		return
	}

	// Check minLength
	if (schema.minLength !== undefined && value.length < schema.minLength) {
		errors[path] = `Must be at least ${schema.minLength} characters`
	}

	// Check maxLength
	if (schema.maxLength !== undefined && value.length > schema.maxLength) {
		errors[path] = `Cannot exceed ${schema.maxLength} characters`
	}

	// Check pattern
	if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
		errors[path] = 'Invalid format'
	}

	// Check format
	if (schema.format) {
		switch (schema.format) {
			case 'email':
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
					errors[path] = 'Invalid email address'
				}
				break
			case 'url':
				try {
					new URL(value)
				} catch (e) {
					errors[path] = 'Invalid URL'
				}
				break
			// Add more formats as needed
		}
	}
}

/**
 * Validates a number value against schema rules
 */
function validateNumber(value, schema, layoutProps, path, errors) {
	const num = Number(value)

	if (isNaN(num)) {
		errors[path] = 'Must be a number'
		return
	}

	// Check if integer
	if (schema.type === 'integer' && !Number.isInteger(num)) {
		errors[path] = 'Must be an integer'
	}

	// Check min
	if (schema.min !== undefined && num < schema.min) {
		errors[path] = `Must be at least ${schema.min}`
	}

	// Check max
	if (schema.max !== undefined && num > schema.max) {
		errors[path] = `Cannot exceed ${schema.max}`
	}
}

/**
 * Validates an array value against schema rules
 */
function validateArray(value, schema, layoutProps, path, errors) {
	if (!Array.isArray(value)) {
		errors[path] = 'Must be an array'
		return
	}

	// Check minItems
	if (schema.minItems !== undefined && value.length < schema.minItems) {
		errors[path] = `Must have at least ${schema.minItems} items`
	}

	// Check maxItems
	if (schema.maxItems !== undefined && value.length > schema.maxItems) {
		errors[path] = `Cannot have more than ${schema.maxItems} items`
	}

	// Check uniqueItems
	if (schema.uniqueItems) {
		const uniqueValues = new Set(value.map((v) => JSON.stringify(v)))
		if (uniqueValues.size !== value.length) {
			errors[path] = 'All items must be unique'
		}
	}
}

/**
 * Finds a layout element that matches a path
 */
function findLayoutElement(layout, path) {
	if (!layout || !layout.elements || !Array.isArray(layout.elements)) {
		return null
	}

	const [firstKey, ...restKeys] = path

	for (const element of layout.elements) {
		if (element.key === firstKey) {
			if (restKeys.length === 0) {
				return element
			} else if (element.elements) {
				return findLayoutElement({ elements: element.elements }, restKeys)
			}
		}
	}

	return null
}
