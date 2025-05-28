import { deriveSchemaFromValue } from './schema.js'
import { deriveLayoutFromValue } from './layout.js'

/**
 * @typedef {Object} FormElement
 * @property {string} label - Display label for the element
 * @property {string} scope - Data path/scope for the element
 * @property {string} type - Input type (text, number, range, etc.)
 * @property {any} value - Current value
 * @property {Object} [constraints] - Min/max values, options, etc.
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
		const { label, scope, title } = layoutElement

		if (!scope) return null

		// Extract field name from scope (remove leading '#/')
		const fieldPath = scope.replace(/^#\//, '')
		const value = this.getValue(fieldPath)
		const fieldSchema = this.#getFieldSchema(fieldPath)

		// Determine input type based on schema and constraints
		let type = 'text'
		let constraints = {}

		if (fieldSchema) {
			switch (fieldSchema.type) {
				case 'number':
				case 'integer':
					type = fieldSchema.min !== undefined && fieldSchema.max !== undefined ? 'range' : 'number'
					constraints = {
						min: fieldSchema.min || fieldSchema.minimum,
						max: fieldSchema.max || fieldSchema.maximum,
						step: fieldSchema.type === 'integer' ? 1 : 0.1
					}
					break
				case 'boolean':
					type = 'checkbox'
					break
				case 'string':
					if (fieldSchema.enum) {
						type = 'select'
						constraints.options = fieldSchema.enum
					} else {
						type = 'text'
					}
					break
			}
		}

		return {
			label: label || title || fieldPath,
			scope: fieldPath,
			type,
			value,
			constraints
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
	 * Reset form to initial state
	 */
	reset() {
		this.#data = {}
		this.#schema = {}
		this.#layout = {}
	}
}
