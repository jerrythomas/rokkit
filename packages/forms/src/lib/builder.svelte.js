import { deriveSchemaFromValue } from './schema.js'
import { deriveLayoutFromValue } from './layout.js'
import { getSchemaWithLayout } from './fields.js'
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
		this.#schema = value ?? deriveSchemaFromValue(this.#data)
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
		this.#layout = value ?? deriveLayoutFromValue(this.#data)
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
		this.schema = schema
		this.layout = layout
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
		if (!path) return undefined
		
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
	 * Build form elements from schema and layout using getSchemaWithLayout
	 * @private
	 * @returns {FormElement[]} Array of form elements
	 */
	#buildElements() {
		if (!this.#schema || !this.#layout || !this.#layout.elements) {
			return []
		}

		try {
			// Use getSchemaWithLayout to combine schema and layout
			const combined = getSchemaWithLayout(this.#schema, this.#layout)
			
			// Convert combined elements to FormElement format
			return combined.elements
				.map(element => this.#convertToFormElement(element))
				.filter(element => element !== null)
		} catch (error) {
			// If getSchemaWithLayout fails, fall back to basic element creation
			console.warn('Failed to build elements:', error)
			return this.#buildBasicElements()
		}
	}

	/**
	 * Build basic form elements when getSchemaWithLayout fails
	 * @private
	 * @returns {FormElement[]} Array of form elements
	 */
	#buildBasicElements() {
		const elements = []

		if (this.#layout.elements) {
			for (const layoutElement of this.#layout.elements) {
				const formElement = this.#buildBasicElement(layoutElement)
				if (formElement) {
					elements.push(formElement)
				}
			}
		}

		return elements
	}

	/**
	 * Build a basic form element from layout only
	 * @private
	 * @param {Object} layoutElement - Layout element definition
	 * @returns {FormElement|null} Form element or null
	 */
	#buildBasicElement(layoutElement) {
		const { scope, label, override = false, ...layoutProps } = layoutElement

		if (!scope) return null

		// Extract field name from scope (remove leading '#/')
		const fieldPath = scope.replace(/^#\//, '')
		const value = this.getValue(fieldPath)

		// Default type is text when no schema is available
		let type = 'text'

		// Basic props
		const props = {
			label: label || fieldPath,
			...layoutProps,
			message: this.#validation[fieldPath] || null
		}

		return {
			scope,
			type,
			value,
			override,
			props
		}
	}

	/**
	 * Convert a combined schema/layout element to FormElement format
	 * @private
	 * @param {Object} element - Combined element from getSchemaWithLayout
	 * @param {string} parentPath - Parent path for nested elements
	 * @returns {FormElement} Form element
	 */
	#convertToFormElement(element, parentPath = '') {
		const { key, props } = element
		
		// Skip elements without a key
		if (!key) {
			return null
		}
		
		// Create scope in JSON Pointer format
		const fieldPath = parentPath ? `${parentPath}/${key}` : key
		const scope = `#/${fieldPath}`
		const value = this.getValue(fieldPath)

		// Handle nested elements (arrays and objects)
		if (element.elements) {
			// This is a nested structure, process children
			const nestedElements = element.elements.map(child => 
				this.#convertToFormElement(child, fieldPath)
			)
			
			return {
				scope,
				type: 'group',
				value,
				override: element.override || false,
				props: {
					...props,
					elements: nestedElements,
					message: this.#validation[fieldPath] || null
				}
			}
		}

		// Determine input type based on schema type
		let type = 'text'
		if (props.type) {
			switch (props.type) {
				case 'number':
				case 'integer':
					type = props.min !== undefined && props.max !== undefined ? 'range' : 'number'
					break
				case 'boolean':
					type = 'checkbox'
					break
				case 'string':
					if (props.enum) {
						type = 'select'
						// Map enum values to options format expected by select inputs
						if (Array.isArray(props.enum)) {
							props.options = props.enum.map(val => ({ value: val, label: val }))
						}
					} else {
						type = 'text'
					}
					break
				case 'array':
					type = 'array'
					break
			}
		}

		// Add validation message if exists
		const validationMessage = this.#validation[fieldPath] || null

		// Compose final props
		const finalProps = {
			...props,
			message: validationMessage
		}

		return {
			scope,
			type,
			value,
			override: element.override || false,
			props: finalProps
		}
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
