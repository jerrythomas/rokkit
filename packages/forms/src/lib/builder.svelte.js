import { deriveSchemaFromValue } from './schema.js'
import { deriveLayoutFromValue } from './layout.js'
import { omit } from 'ramda'

/**
 * @typedef {Object} FormElement
 * @property {string} scope - JSON Pointer path (e.g., '#/email', '#/user/name')
 * @property {string} type - Input type (text, number, range, checkbox, select, etc.)
 * @property {any} value - Current value from data
 * @property {boolean} override - Whether to use custom child snippet (from layout)
 * @property {Object} props - Merged properties from schema + layout + validation
 * @property {string} [props.label] - Display label (from layout)
 * @property {string} [props.description] - Help text (from layout)
 * @property {string} [props.placeholder] - Placeholder text (from layout)
 * @property {boolean} [props.required] - Required flag (from schema)
 * @property {number} [props.min] - Minimum value (from schema)
 * @property {number} [props.max] - Maximum value (from schema)
 * @property {Object} [props.message] - Validation message object
 * @property {string} [props.message.state] - Message state: 'error', 'warning', 'info', 'success'
 * @property {string} [props.message.text] - Message text content
 */

/**
 * FormBuilder class for dynamically generating forms from data structures
 */
export class FormBuilder {
	/** @type {Object} */
	#data = $state({})

	/** @type {Object} */
	#schema = $state({})

	/** @type {Object} */
	#layout = $state({})

	/** @type {Object} */
	#validation = $state({})

	/** @type {FormElement[]} */
	elements = $derived(this.#buildElements())

	/**
	 * Get the current data
	 * @returns {Object} Current data object
	 */
	get data() {
		return this.#data
	}

	/**
	 * Set the data
	 * @param {Object} value - New data object
	 */
	set data(value) {
		this.#data = value
	}

	/**
	 * Get the current schema
	 * @returns {Object} Current schema object
	 */
	get schema() {
		return this.#schema
	}

	/**
	 * Set the schema
	 * @param {Object} value - New schema object
	 */
	set schema(value) {
		this.#schema = value
	}

	/**
	 * Get the current layout
	 * @returns {Object} Current layout object
	 */
	get layout() {
		return this.#layout
	}

	/**
	 * Set the layout
	 * @param {Object} value - New layout object
	 */
	set layout(value) {
		this.#layout = value
	}

	/**
	 * Get the current validation state
	 * @returns {Object} Current validation object
	 */
	get validation() {
		return this.#validation
	}

	/**
	 * Set validation messages for fields
	 * @param {Object} value - Validation object with field paths as keys
	 */
	set validation(value) {
		this.#validation = value
	}

	/**
	 * Create a new FormBuilder instance
	 * @param {Object} [data={}] - Initial data object
	 * @param {Object|null} [schema=null] - Optional schema override
	 * @param {Object|null} [layout=null] - Optional layout override
	 */
	constructor(data = {}, schema = null, layout = null) {
		this.#data = data
		this.#schema = schema || deriveSchemaFromValue(data)
		this.#layout = layout || deriveLayoutFromValue(data)
	}

	/**
	 * Update a specific field value
	 * @param {string} path - Field path (e.g., 'count', 'settings/distance')
	 * @param {any} value - New value
	 */
	updateField(path, value) {
		// Simple path handling for now - can be enhanced for nested objects
		const keys = path.split('/')
		if (keys.length === 1) {
			this.#data = { ...this.#data, [keys[0]]: value }
		} else {
			// Handle nested paths if needed
			const updatedData = { ...this.#data }
			let current = updatedData
			for (let i = 0; i < keys.length - 1; i++) {
				current[keys[i]] = { ...current[keys[i]] }
				current = current[keys[i]]
			}
			current[keys[keys.length - 1]] = value
			this.#data = updatedData
		}
	}

	/**
	 * Get a field value by path
	 * @param {string} path - Field path
	 * @returns {any} Field value
	 */
	getValue(path) {
		const keys = path.split('/')
		let current = this.#data
		for (const key of keys) {
			if (current && typeof current === 'object') {
				current = current[key]
			} else {
				return undefined
			}
		}
		return current
	}

	/**
	 * Build form elements from schema and layout
	 * @private
	 * @returns {FormElement[]} Array of form elements
	 */
	#buildElements() {
		const elements = []

		if (this.#layout.elements) {
			for (const element of this.#layout.elements) {
				const formElement = this.#buildElement(element)
				if (formElement) {
					elements.push(formElement)
				}
			}
		}

		return elements
	}

	/**
	 * Build a single form element
	 * @private
	 * @param {Object} layoutElement - Layout element definition
	 * @returns {FormElement|null} Form element or null
	 */
	#buildElement(layoutElement) {
		const { scope, override = false } = layoutElement

		if (!scope) return null

		// Extract field name from scope (remove leading '#/')
		const fieldPath = scope.replace(/^#\//, '')
		const value = this.getValue(fieldPath)
		const fieldSchema = this.#getFieldSchema(fieldPath)

		// Determine input type based on schema
		let type = 'text'

		if (fieldSchema) {
			switch (fieldSchema.type) {
				case 'number':
				case 'integer':
					type = fieldSchema.min !== undefined && fieldSchema.max !== undefined ? 'range' : 'number'
					break
				case 'boolean':
					type = 'checkbox'
					break
				case 'string':
					if (fieldSchema.enum) {
						type = 'select'
					} else {
						type = 'text'
					}
					break
			}
		}

		// Compose props from schema, layout, and validation
		const props = this.#composeProps(layoutElement, fieldSchema, fieldPath)

		return {
			scope, // Keep original JSON Pointer format
			type,
			value,
			override,
			props
		}
	}

	/**
	 * Get schema for a specific field path
	 * @private
	 * @param {string} fieldPath - Field path
	 * @returns {Object|null} Field schema
	 */
	#getFieldSchema(fieldPath) {
		if (!this.#schema.properties) return null

		const keys = fieldPath.split('/')
		let current = this.#schema.properties

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
	 * Compose properties from schema, layout, and validation
	 * @private
	 * @param {Object} layoutElement - Layout element
	 * @param {Object} fieldSchema - Field schema
	 * @param {string} fieldPath - Field path for validation lookup
	 * @returns {Object} Composed props object
	 */
	#composeProps(layoutElement, fieldSchema, fieldPath) {
		const { label, title, description, placeholder, ...layoutProps } = layoutElement

		const props = {
			// Layout properties (allow arbitrary custom properties)
			label: label || title || fieldPath,
			description,
			placeholder,
			...layoutProps,

			// Schema properties
			...(fieldSchema && this.#extractSchemaProps(fieldSchema)),

			// Validation properties
			message: this.#validation[fieldPath] || null
		}

		return props
	}

	/**
	 * Extract relevant properties from field schema
	 * @private
	 * @param {Object} fieldSchema - Field schema
	 * @returns {Object} Schema properties for input
	 */
	#extractSchemaProps(fieldSchema) {
		const props = {}

		// Validation properties
		if (fieldSchema.required) props.required = true
		if (fieldSchema.pattern) props.pattern = fieldSchema.pattern

		// Constraints (support both JSON Schema and simplified formats)
		if (fieldSchema.min !== undefined) props.min = fieldSchema.min
		if (fieldSchema.max !== undefined) props.max = fieldSchema.max
		if (fieldSchema.minimum !== undefined) props.min = fieldSchema.minimum
		if (fieldSchema.maximum !== undefined) props.max = fieldSchema.maximum
		if (fieldSchema.minLength !== undefined) props.minLength = fieldSchema.minLength
		if (fieldSchema.maxLength !== undefined) props.maxLength = fieldSchema.maxLength
		if (fieldSchema.step !== undefined) props.step = fieldSchema.step

		// Type-specific properties
		if (fieldSchema.enum) props.options = fieldSchema.enum
		if (fieldSchema.type === 'integer') props.step = props.step || 1
		if (fieldSchema.type === 'number' && !props.step) props.step = 0.1

		return props
	}

	/**
	 * Set validation message for a specific field
	 * @param {string} fieldPath - Field path (without '#/' prefix)
	 * @param {Object|null} message - Validation message object or null to clear
	 * @param {string} message.state - Message state: 'error', 'warning', 'info', 'success'
	 * @param {string} message.text - Message text content
	 */
	setFieldValidation(fieldPath, message) {
		if (message) {
			this.#validation = { ...this.#validation, [fieldPath]: message }
		} else {
			this.#validation = omit([fieldPath], this.#validation)
		}
	}

	/**
	 * Clear all validation messages
	 */
	clearValidation() {
		this.#validation = {}
	}

	/**
	 * Reset form to initial state
	 */
	reset() {
		this.#data = {}
		this.#schema = {}
		this.#layout = {}
		this.#validation = {}
	}
}
