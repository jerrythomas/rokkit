import { SvelteMap, SvelteSet } from 'svelte/reactivity'
import { deriveSchemaFromValue } from './schema.js'
import { deriveLayoutFromValue } from './layout.js'
import { getSchemaWithLayout } from './fields.js'
import { createLookupManager } from './lookup.svelte.js'
import { evaluateCondition } from './conditions.js'
import {
	validateField as validateFieldValue,
	validateAll as validateAllFields
} from './validation.js'

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

/** @private */
function deepEqualArrays(a, b) {
	if (a.length !== b.length) return false
	return a.every((val, i) => deepEqual(val, b[i]))
}

/** @private */
function deepEqualObjects(a, b) {
	const keysA = Object.keys(a)
	const keysB = Object.keys(b)
	if (keysA.length !== keysB.length) return false
	return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]))
}

/** @private — true when either value is nullish */
function isNullish(v) {
	return v === null || v === undefined
}

/** @private — true when both are same-type objects (not mixed array/object) */
function areSameObjectType(a, b) {
	return typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)
}

/** @private — dispatch object comparison to array or plain-object helper */
function deepEqualObjects2(a, b) {
	return Array.isArray(a) ? deepEqualArrays(a, b) : deepEqualObjects(a, b)
}

/**
 * Deep equality check for plain values (primitives, plain objects, arrays).
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
function deepEqual(a, b) {
	if (a === b) return true
	if (isNullish(a) || isNullish(b)) return false
	return areSameObjectType(a, b) && deepEqualObjects2(a, b)
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

/** Maps simple schema types to their input type string */
const SCHEMA_TYPE_MAP = { boolean: 'checkbox', array: 'array' }

/**
 * Update a nested data path and return the updated root object
 * @private
 * @param {Object} data - Current data
 * @param {string[]} keys - Path segments
 * @param {any} value - New value
 * @returns {Object}
 */
function setNestedValue(data, keys, value) {
	const updated = { ...data }
	let current = updated
	for (let i = 0; i < keys.length - 1; i++) {
		current[keys[i]] = { ...current[keys[i]] }
		current = current[keys[i]]
	}
	current[keys[keys.length - 1]] = value
	return updated
}

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
	 * Initialise the lookup manager if any lookups are provided
	 * @private
	 */
	#initLookups(lookups) {
		this.#lookupConfigs = lookups
		if (Object.keys(lookups).length > 0) {
			this.#lookupManager = createLookupManager(lookups)
		}
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
		this.#initLookups(lookups)
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
	 * @returns {{ options: any[], loading: boolean, error: string|null, fields: Object, disabled: boolean }|null}
	 */
	getLookupState(fieldPath) {
		if (!this.#lookupManager) return null
		const lookup = this.#lookupManager.getLookup(fieldPath)
		if (!lookup) return null
		return {
			options: lookup.options,
			loading: lookup.loading,
			error: lookup.error,
			fields: lookup.fields,
			disabled: lookup.disabled
		}
	}

	/**
	 * Check if a field is disabled due to unmet lookup dependencies
	 * @param {string} path - Field path
	 * @returns {boolean}
	 */
	isFieldDisabled(path) {
		return this.#lookupManager?.getLookup(path)?.disabled ?? false
	}

	/**
	 * Manually refresh a field's lookup with the current form data
	 * @param {string} path - Field path
	 * @returns {Promise<void>}
	 */
	async refreshLookup(path) {
		const lookup = this.#lookupManager?.getLookup(path)
		if (lookup) await lookup.fetch(this.#data)
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
	 * Clear dependent field values for a changed path
	 * @private
	 */
	#clearDependentFields(path) {
		for (const [depPath, lookup] of this.#lookupManager.lookups) {
			if (!lookup.dependsOn.includes(path)) continue
			const depKeys = depPath.split('/')
			if (depKeys.length === 1) {
				this.#data = { ...this.#data, [depKeys[0]]: null }
			}
		}
	}

	/**
	 * Update a specific field value
	 * @param {string} path - Field path (e.g., 'count', 'settings/distance')
	 * @param {any} value - New value
	 * @param {boolean} [triggerLookups=true] - Whether to trigger dependent lookups
	 */
	updateField(path, value, triggerLookups = true) {
		const keys = path.split('/')
		if (keys.length === 1) {
			this.#data = { ...this.#data, [keys[0]]: value }
		} else {
			this.#data = setNestedValue(this.#data, keys, value)
		}

		// Clear stale validation errors for fields that are now hidden
		this.#clearHiddenValidation()

		// Trigger dependent lookups if configured
		if (triggerLookups && this.#lookupManager) {
			this.#clearDependentFields(path)
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
	 * Clear validation errors for fields that are no longer visible
	 * @private
	 */
	#clearHiddenValidation() {
		const visiblePaths = new SvelteSet(
			this.elements.filter((el) => el.scope).map((el) => el.scope.replace(/^#\//, ''))
		)
		const cleaned = Object.fromEntries(
			Object.entries(this.#validation).filter(([path]) => visiblePaths.has(path))
		)
		if (Object.keys(cleaned).length !== Object.keys(this.#validation).length) {
			this.#validation = cleaned
		}
	}

	/**
	 * Build a display element from the layout entry
	 * @private
	 */
	#buildDisplayElement(layoutEl) {
		const scope = layoutEl.scope ?? null
		const fieldPath = scope?.replace(/^#\//, '')
		const value = fieldPath ? this.getValue(fieldPath) : null
		const { type: displayType, scope: _s, ...displayProps } = layoutEl
		return { type: displayType, scope, value, override: false, props: displayProps }
	}

	/**
	 * Build a non-scoped separator/spacer element from the layout entry
	 * @private
	 */
	#buildSeparatorElement(layoutEl) {
		const { type: separatorType, ...separatorProps } = layoutEl
		return {
			type: separatorType ?? 'separator',
			scope: null,
			value: null,
			override: false,
			props: separatorProps
		}
	}

	/**
	 * Process one scoped layout element — returns FormElement or null
	 * @private
	 */
	#processScopedElement(layoutEl, combinedMap) {
		if (layoutEl.showWhen && !evaluateCondition(layoutEl.showWhen, this.#data)) return null
		const key = layoutEl.scope.replace(/^#\//, '').split('/').pop()
		const combinedEl = combinedMap.get(key)
		return combinedEl ? this.#convertToFormElement(combinedEl) : null
	}

	/**
	 * Build the combined element map from schema+layout
	 * @private
	 */
	#buildCombinedMap(layoutElements) {
		const scopedElements = layoutElements.filter(
			(el) => el.scope && !el.type?.startsWith('display-')
		)
		const scopedLayout = { ...this.#layout, elements: scopedElements }
		const combined = getSchemaWithLayout(this.#schema, scopedLayout)

		const combinedMap = new SvelteMap()
		for (const el of combined.elements ?? []) {
			if (el.key) combinedMap.set(el.key, el)
		}
		return combinedMap
	}

	/**
	 * Convert one layout element to a form element (or null)
	 * @private
	 */
	#buildOneElement(layoutEl, combinedMap) {
		if (layoutEl.type?.startsWith('display-')) return this.#buildDisplayElement(layoutEl)
		if (!layoutEl.scope) return this.#buildSeparatorElement(layoutEl)
		return this.#processScopedElement(layoutEl, combinedMap)
	}

	/**
	 * Collect form elements from layout into result array
	 * @private
	 */
	#collectElements(layoutElements, combinedMap) {
		const result = []
		for (const layoutEl of layoutElements) {
			const formEl = this.#buildOneElement(layoutEl, combinedMap)
			if (formEl) result.push(formEl)
		}
		return result
	}

	/**
	 * Build form elements from schema and layout using getSchemaWithLayout
	 * @private
	 * @returns {FormElement[]} Array of form elements
	 */
	#buildElements() {
		try {
			const layoutElements = this.#layout?.elements ?? []
			const combinedMap = this.#buildCombinedMap(layoutElements)
			return this.#collectElements(layoutElements, combinedMap)
		} catch (error) {
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
	 * Convert a nested (group) element to FormElement format
	 * @private
	 */
	#convertNestedElement(element, fieldPath, scope, value) {
		const nestedElements = element.elements.map((child) =>
			this.#convertToFormElement(child, fieldPath)
		)
		const { key: _k, elements: _e, override: _o, props: groupProps, ...topLevelProps } = element
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

	/**
	 * Convert a readonly element to FormElement format
	 * @private
	 */
	#convertReadonlyElement(element, fieldPath, scope, value) {
		const validationMessage = this.#validation[fieldPath] || null
		return {
			scope,
			type: 'info',
			value,
			override: element.override || false,
			props: { ...element.props, type: 'info', message: validationMessage }
		}
	}

	/**
	 * Resolve number input type (range when both min and max are set, otherwise number)
	 * @private
	 */
	#resolveNumberType(props) {
		return props.min !== undefined && props.max !== undefined ? 'range' : 'number'
	}

	/**
	 * Resolve input type for string schema type
	 * @private
	 */
	#resolveStringType(props) {
		if (props.enum || props.options) {
			// Map enum values to options format expected by select inputs
			if (Array.isArray(props.enum) && !props.options) {
				props.options = props.enum
			}
			return 'select'
		}
		return 'text'
	}

	/**
	 * Resolve input type from schema type field
	 * @private
	 */
	#resolveTypeFromSchema(props) {
		if (props.type === 'number' || props.type === 'integer') return this.#resolveNumberType(props)
		if (props.type === 'string') return this.#resolveStringType(props)
		return SCHEMA_TYPE_MAP[props.type] ?? 'text'
	}

	/**
	 * Resolve the input type from element props
	 * @private
	 * @param {Object} props - Element props
	 * @returns {string}
	 */
	#resolveInputType(props) {
		if (props.renderer) return props.renderer
		if (props.format && !['text', 'number'].includes(props.format)) return props.format
		return this.#resolveTypeFromSchema(props)
	}

	/**
	 * Apply lookup state into finalProps (mutates finalProps)
	 * @private
	 */
	#applyLookupState(fieldPath, finalProps) {
		const lookupState = this.getLookupState(fieldPath)
		if (!lookupState) return
		applyLookupProps(lookupState, finalProps)
	}

	/**
	 * Build a standard (non-nested, non-readonly) form element
	 * @private
	 */
	#buildStandardElement(element, fieldPath, scope, value) {
		const { props } = element
		const type = this.#resolveInputType(props)
		const finalProps = {
			...props,
			type,
			message: this.#validation[fieldPath] || null,
			dirty: this.isFieldDirty(fieldPath)
		}
		this.#applyLookupState(fieldPath, finalProps)
		return { scope, type, value, override: element.override || false, props: finalProps }
	}

	/**
	 * Resolve the field path for an element
	 * @private
	 */
	#resolveFieldPath(key, parentPath) {
		return parentPath ? `${parentPath}/${key}` : key
	}

	/**
	 * Convert a combined schema/layout element to FormElement format
	 * @private
	 * @param {Object} element - Combined element from getSchemaWithLayout
	 * @param {string} parentPath - Parent path for nested elements
	 * @returns {FormElement} Form element
	 */
	#convertToFormElement(element, parentPath = '') {
		const { key } = element
		if (!key) return null

		const fieldPath = this.#resolveFieldPath(key, parentPath)
		const scope = `#/${fieldPath}`
		const value = this.getValue(fieldPath)

		if (element.elements) return this.#convertNestedElement(element, fieldPath, scope, value)
		if (element.props.readonly)
			return this.#convertReadonlyElement(element, fieldPath, scope, value)
		return this.#buildStandardElement(element, fieldPath, scope, value)
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
		const visiblePaths = new SvelteSet(
			this.elements.filter((el) => el.scope).map((el) => el.scope.replace(/^#\//, ''))
		)
		const filtered = Object.fromEntries(
			Object.entries(results).filter(([path]) => visiblePaths.has(path))
		)
		this.#validation = filtered
		return filtered
	}

	/**
	 * Get form data with hidden field values stripped out
	 * Hidden fields are those absent from this.elements (the derived list)
	 * Does not mutate this.#data
	 * @returns {Object} Filtered data containing only visible field keys
	 */
	getVisibleData() {
		const visiblePaths = new SvelteSet(
			this.elements.filter((el) => el.scope).map((el) => el.scope.replace(/^#\//, ''))
		)
		return Object.fromEntries(Object.entries(this.#data).filter(([key]) => visiblePaths.has(key)))
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
		const allKeys = new SvelteSet([...Object.keys(current ?? {}), ...Object.keys(initial ?? {})])
		for (const key of allKeys) {
			collectIfDirty({ current, initial, prefix, key, dirty })
		}
	}

	/**
	 * Walk schema properties following the key path
	 * @private
	 */
	#walkSchemaPath(keys) {
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
	 * Get schema definition for a field path
	 * @private
	 * @param {string} fieldPath - Field path
	 * @returns {Object|null} Field schema
	 */
	#getFieldSchema(fieldPath) {
		if (!this.#schema?.properties) return null
		return this.#walkSchemaPath(fieldPath.split('/'))
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
		return layoutElLabel(layoutEl, fieldPath)
	}

	/**
	 * Reset form data to initial snapshot and clear validation
	 */
	reset() {
		this.#data = deepClone(this.#initialData)
		this.#validation = {}
	}
}

// ── Module-level helpers (no `this`) ──────────────────────────────────────────

/**
 * Return the display label for a layout element, falling back to fieldPath
 * @private
 */
function layoutElLabel(layoutEl, fieldPath) {
	if (layoutEl?.label) return layoutEl.label
	return layoutEl?.title ?? fieldPath
}

/**
 * Apply options/loading state from lookup to finalProps
 * @private
 */
function applyLookupData(lookupState, finalProps) {
	if (lookupState.options?.length > 0) finalProps.options = lookupState.options
	if (lookupState.loading) finalProps.loading = true
}

/**
 * Apply disabled/fields state from lookup to finalProps
 * @private
 */
function applyLookupMeta(lookupState, finalProps) {
	if (lookupState.disabled) finalProps.disabled = true
	if (lookupState.fields && !finalProps.fields) finalProps.fields = lookupState.fields
}

/**
 * Merge all lookup properties into finalProps
 * @private
 */
function applyLookupProps(lookupState, finalProps) {
	applyLookupData(lookupState, finalProps)
	applyLookupMeta(lookupState, finalProps)
}

/**
 * Add path to dirty set if current and initial values differ
 * @private
 * @param {{ current: any, initial: any, prefix: string, key: string, dirty: Set<string> }} ctx
 */
function collectIfDirty({ current, initial, prefix, key, dirty }) {
	const path = prefix ? `${prefix}/${key}` : key
	if (!deepEqual(current?.[key], initial?.[key])) dirty.add(path)
}
