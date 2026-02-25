import { deriveSchemaFromValue } from './schema.js'
import { deriveLayoutFromValue } from './layout.js'
import { getSchemaWithLayout } from './fields.js'
import { createLookupManager } from './lookup.svelte.js'
import { validateField as validateFieldValue, validateAll as validateAllFields } from './validation.js'

/**
 * Deep-clone a plain value (primitives, plain objects, arrays).
 * Uses JSON round-trip which handles $state proxies safely.
 * @param {any} value
 * @returns {any}
 */
function deepClone(value) {
	if (value === null || value === undefined || typeof value !== 'object') return value
	return JSON.parse(JSON.stringify(value))
}

/**
 * Deep equality check for plain values (primitives, plain objects, arrays).
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
function deepEqual(a, b) {
	if (a === b) return true
	if (a === null || a === undefined || b === null || b === undefined) return a === b
	if (typeof a !== typeof b) return false
	if (typeof a !== 'object') return false
	if (Array.isArray(a) !== Array.isArray(b)) return false

	if (Array.isArray(a)) {
		if (a.length !== b.length) return false
		return a.every((val, i) => deepEqual(val, b[i]))
	}

	const keysA = Object.keys(a)
	const keysB = Object.keys(b)
	if (keysA.length !== keysB.length) return false
	return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]))
}

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
 * @property {boolean} [props.dirty] - Whether field value differs from initial
 */

/**
 * FormBuilder class for dynamically generating forms from data structures
 */
export class FormBuilder {
	/** @type {Object} */
	#data = $state({})

	/** @type {Object} - Snapshot of data at construction (or last snapshot()) */
	#initialData = {}

	/** @type {Object} */
	#schema = $state({})

	/** @type {Object} */
	#layout = $state({})

	/** @type {Object} */
	#validation = $state({})

	/** @type {Object<string, import('./lookup.svelte.js').LookupConfig>} */
	#lookupConfigs = $state({})

	/** @type {ReturnType<typeof createLookupManager>|null} */
	#lookupManager = $state(null)

	/** @type {FormElement[]} */
	elements = $derived(this.#buildElements())

	/** Combined schema+layout (scoped elements only) */
	get combined() {
		const scopedElements = (this.#layout?.elements ?? []).filter((el) => el.scope)
		const scopedLayout = { ...this.#layout, elements: scopedElements }
		return getSchemaWithLayout(this.#schema, scopedLayout)
	}
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
	 * @param {Object<string, import('./lookup.svelte.js').LookupConfig>} [lookups={}] - Lookup configurations
	 */
	constructor(data = {}, schema = null, layout = null, lookups = {}) {
		this.#data = data
		this.#initialData = deepClone(data)
		this.schema = schema
		this.layout = layout
		this.#lookupConfigs = lookups
		if (Object.keys(lookups).length > 0) {
			this.#lookupManager = createLookupManager(lookups)
		}
	}

	/**
	 * Get the lookup manager
	 * @returns {ReturnType<typeof createLookupManager>|null}
	 */
	get lookupManager() {
		return this.#lookupManager
	}

	/**
	 * Configure lookups for the form
	 * @param {Object<string, import('./lookup.svelte.js').LookupConfig>} lookups - Lookup configurations
	 */
	setLookups(lookups) {
		this.#lookupConfigs = lookups
		this.#lookupManager = createLookupManager(lookups)
	}

	/**
	 * Get lookup state for a field
	 * @param {string} fieldPath - Field path
	 * @returns {{ options: any[], loading: boolean, error: string|null, fields: Object }|null}
	 */
	getLookupState(fieldPath) {
		if (!this.#lookupManager) return null
		const lookup = this.#lookupManager.getLookup(fieldPath)
		if (!lookup) return null
		return {
			options: lookup.options,
			loading: lookup.loading,
			error: lookup.error,
			fields: lookup.fields
		}
	}

	/**
	 * Check if a field has a lookup configured
	 * @param {string} fieldPath - Field path
	 * @returns {boolean}
	 */
	hasLookup(fieldPath) {
		return this.#lookupManager?.hasLookup(fieldPath) ?? false
	}

	/**
	 * Initialize all lookups
	 * @returns {Promise<void>}
	 */
	async initializeLookups() {
		if (this.#lookupManager) {
			await this.#lookupManager.initialize(this.#data)
		}
	}

	/**
	 * Update a specific field value
	 * @param {string} path - Field path (e.g., 'count', 'settings/distance')
	 * @param {any} value - New value
	 * @param {boolean} [triggerLookups=true] - Whether to trigger dependent lookups
	 */
	updateField(path, value, triggerLookups = true) {
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

		// Trigger dependent lookups if configured
		if (triggerLookups && this.#lookupManager) {
			this.#lookupManager.handleFieldChange(path, this.#data)
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
		try {
			const result = []
			const layoutElements = this.#layout?.elements ?? []
			// Track which layout elements have scopes (for schema merge)
			// Exclude display-* elements — they are handled separately
			const scopedElements = layoutElements.filter(
				(el) => el.scope && !el.type?.startsWith('display-')
			)
			const scopedLayout = { ...this.#layout, elements: scopedElements }
			const combined = getSchemaWithLayout(this.#schema, scopedLayout)

			// Build a map of combined elements by key for lookup
			const combinedMap = new Map()
			for (const el of combined.elements ?? []) {
				if (el.key) combinedMap.set(el.key, el)
			}

			// Iterate original layout order to preserve separators and other non-scoped elements
			for (const layoutEl of layoutElements) {
				if (layoutEl.type?.startsWith('display-')) {
					// Display element — resolve data from scope if present
					const scope = layoutEl.scope ?? null
					const fieldPath = scope?.replace(/^#\//, '')
					const value = fieldPath ? this.getValue(fieldPath) : null
					const { type: displayType, scope: _s, ...displayProps } = layoutEl
					result.push({
						type: displayType,
						scope,
						value,
						override: false,
						props: displayProps
					})
				} else if (!layoutEl.scope) {
					// Non-scoped element (separator, etc.)
					const { type: separatorType, ...separatorProps } = layoutEl
					result.push({
						type: separatorType ?? 'separator',
						scope: null,
						value: null,
						override: false,
						props: separatorProps
					})
				} else {
					// Extract key from scope
					const key = layoutEl.scope.replace(/^#\//, '').split('/').pop()
					const combinedEl = combinedMap.get(key)
					if (combinedEl) {
						const formEl = this.#convertToFormElement(combinedEl)
						if (formEl) result.push(formEl)
					}
				}
			}
			return result
		} catch (error) {
			// If getSchemaWithLayout fails, fall back to basic element creation
			console.warn('Failed to build elements:', error) // eslint-disable-line no-console
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
		const type = 'text'

		// Basic props
		const props = {
			label: label || fieldPath,
			...layoutProps,
			message: this.#validation[fieldPath] || null,
			dirty: this.isFieldDirty(fieldPath),
			type
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
			const nestedElements = element.elements.map((child) =>
				this.#convertToFormElement(child, fieldPath)
			)

			// Group elements have top-level properties (label, etc.) from combineNestedElementsWithSchema
			const { key: _k, elements: _e, override: _o, props: groupProps, ...topLevelProps } =
				element

			return {
				scope,
				type: 'group',
				value,
				override: element.override || false,
				props: {
					...topLevelProps,
					...groupProps,
					elements: nestedElements,
					message: this.#validation[fieldPath] || null
				}
			}
		}

		// Readonly fields render as info display
		if (props.readonly) {
			const validationMessage = this.#validation[fieldPath] || null
			return {
				scope,
				type: 'info',
				value,
				override: element.override || false,
				props: { ...props, type: 'info', message: validationMessage }
			}
		}

		// Determine input type — renderer hint takes priority
		let type = 'text'
		if (props.renderer) {
			// Explicit renderer override — use as-is, resolveRenderer handles lookup
			type = props.renderer
		} else if (props.format && !['text', 'number'].includes(props.format)) {
			// Format hint maps to input type (email, url, tel, color, date, etc.)
			type = props.format
		} else if (props.type) {
			switch (props.type) {
				case 'number':
				case 'integer':
					type = props.min !== undefined && props.max !== undefined ? 'range' : 'number'
					break
				case 'boolean':
					type = 'checkbox'
					break
				case 'string':
					if (props.enum || props.options) {
						type = 'select'
						// Map enum values to options format expected by select inputs
						if (Array.isArray(props.enum) && !props.options) {
							props.options = props.enum
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

		// Add validation message and dirty state
		const validationMessage = this.#validation[fieldPath] || null

		// Compose final props
		const finalProps = {
			...props,
			type,
			message: validationMessage,
			dirty: this.isFieldDirty(fieldPath)
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
			const { [fieldPath]: _, ...rest } = this.#validation
			this.#validation = rest
		}
	}

	/**
	 * Clear all validation messages
	 */
	clearValidation() {
		this.#validation = {}
	}

	/**
	 * Validate a single field by path
	 * @param {string} fieldPath - Field path (without '#/' prefix)
	 * @returns {import('./validation.js').ValidationMessage|null} Validation result
	 */
	validateField(fieldPath) {
		const fieldSchema = this.#getFieldSchema(fieldPath)
		if (!fieldSchema) return null

		const value = this.getValue(fieldPath)
		const label = this.#getFieldLabel(fieldPath)
		const result = validateFieldValue(value, fieldSchema, label)

		this.setFieldValidation(fieldPath, result)
		return result
	}

	/**
	 * Validate all fields, populate validation state
	 * @returns {Object} Validation results keyed by field path
	 */
	validate() {
		const results = validateAllFields(this.#data, this.#schema, this.#layout)
		this.#validation = results
		return results
	}

	/**
	 * Whether all fields pass validation (no error-state messages)
	 * @returns {boolean}
	 */
	get isValid() {
		return Object.values(this.#validation).every((msg) => msg.state !== 'error')
	}

	/**
	 * Array of current error messages with paths
	 * @returns {Array<{path: string, state: string, text: string}>}
	 */
	get errors() {
		return Object.entries(this.#validation)
			.filter(([, msg]) => msg.state === 'error')
			.map(([path, msg]) => ({ path, ...msg }))
	}

	/**
	 * Array of all validation messages with paths, ordered by severity
	 * @returns {Array<{path: string, state: string, text: string}>}
	 */
	get messages() {
		const order = { error: 0, warning: 1, info: 2, success: 3 }
		return Object.entries(this.#validation)
			.filter(([, msg]) => msg !== null && msg !== undefined)
			.map(([path, msg]) => ({ path, ...msg }))
			.sort((a, b) => (order[a.state] ?? 4) - (order[b.state] ?? 4))
	}

	// ── Dirty Tracking ────────────────────────────────────────

	/**
	 * Whether any field has been modified from its initial value
	 * @returns {boolean}
	 */
	get isDirty() {
		return !deepEqual(this.#data, this.#initialData)
	}

	/**
	 * Set of field paths that differ from their initial values
	 * @returns {Set<string>}
	 */
	get dirtyFields() {
		const dirty = new Set()
		this.#collectDirtyFields(this.#data, this.#initialData, '', dirty)
		return dirty
	}

	/**
	 * Check if a single field has been modified from its initial value
	 * @param {string} fieldPath - Field path (without '#/' prefix)
	 * @returns {boolean}
	 */
	isFieldDirty(fieldPath) {
		const current = this.getValue(fieldPath)
		const initial = this.#getInitialValue(fieldPath)
		return !deepEqual(current, initial)
	}

	/**
	 * Update the initial data snapshot to the current data.
	 * Call after a successful save to clear dirty state.
	 */
	snapshot() {
		this.#initialData = deepClone(this.#data)
	}

	/**
	 * Get a field's initial value by path
	 * @private
	 * @param {string} path - Field path
	 * @returns {any} Initial field value
	 */
	#getInitialValue(path) {
		if (!path) return undefined

		const keys = path.split('/')
		let current = this.#initialData
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
	 * Recursively collect dirty field paths by comparing current vs initial
	 * @private
	 * @param {any} current - Current data (sub)tree
	 * @param {any} initial - Initial data (sub)tree
	 * @param {string} prefix - Path prefix
	 * @param {Set<string>} dirty - Accumulator set
	 */
	#collectDirtyFields(current, initial, prefix, dirty) {
		const allKeys = new Set([
			...Object.keys(current ?? {}),
			...Object.keys(initial ?? {})
		])

		for (const key of allKeys) {
			const path = prefix ? `${prefix}/${key}` : key
			const curVal = current?.[key]
			const initVal = initial?.[key]

			if (!deepEqual(curVal, initVal)) {
				dirty.add(path)
			}
		}
	}

	/**
	 * Get schema definition for a field path
	 * @private
	 * @param {string} fieldPath - Field path
	 * @returns {Object|null} Field schema
	 */
	#getFieldSchema(fieldPath) {
		if (!this.#schema?.properties) return null
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
	 * Get label for a field from layout
	 * @private
	 * @param {string} fieldPath - Field path
	 * @returns {string} Field label
	 */
	#getFieldLabel(fieldPath) {
		const scope = `#/${fieldPath}`
		const layoutEl = this.#layout?.elements?.find((el) => el.scope === scope)
		return layoutEl?.label || layoutEl?.title || fieldPath
	}

	/**
	 * Reset form data to initial snapshot and clear validation
	 */
	reset() {
		this.#data = deepClone(this.#initialData)
		this.#validation = {}
	}
}
