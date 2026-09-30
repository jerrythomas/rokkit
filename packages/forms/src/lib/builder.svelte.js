import { SvelteMap, SvelteSet } from 'svelte/reactivity'
import { getSchemaWithLayout } from './fields.js'
import { evaluateCondition } from './conditions.js'
import { FormValues } from './state/FormValues.svelte.js'
import { FormDefinition } from './state/FormDefinition.svelte.js'
import { FormLookups } from './state/FormLookups.svelte.js'
import { FormSteps } from './state/FormSteps.svelte.js'
import { FormValidation } from './state/FormValidation.svelte.js'

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
 * FormBuilder class for dynamically generating forms from data structures
 */
export class FormBuilder {
	/** The form's data and its dirty baseline. */
	values

	/** Schema and layout, and how each derives from the other. */
	definition

	/** Validation messages, and the ways of producing them. Suffixed: `validation` is the public message map. */
	validationState

	/** Fields whose options come from elsewhere, and what they depend on. */
	lookups

	/** Multi-step navigation. */
	steps

	/** @type {FormElement[]} */
	elements = $derived(this.#buildElements())

	/** True when currentStep can advance to the next step */
	get canAdvance() {
		return this.steps.canAdvance
	}

	/** Combined schema+layout (scoped elements only) */
	get combined() {
		return this.definition.combined
	}
	/**
	 * Get the current data
	 * @returns {Record<string, unknown>} Current data object
	 */
	get data() {
		return this.values.data
	}

	/**
	 * Set the data
	 * @param {Record<string, unknown>} value - New data object
	 */
	set data(value) {
		this.values.data = value
	}

	/** The form's schema. Setting it may re-derive the layout — see FormDefinition. */
	get schema() {
		return this.definition.schema
	}
	set schema(value) {
		this.definition.schema = value
	}

	/** The form's layout. A null layout derives from the schema, else the data. */
	get layout() {
		return this.definition.layout
	}
	set layout(value) {
		this.definition.layout = value
	}

	/** The validation messages, by field path. */
	get validation() {
		return this.validationState.map
	}
	set validation(value) {
		this.validationState.map = value
	}

	/**
	 * Create a new FormBuilder instance
	 * @param {Record<string, unknown>} [data={}] - Initial data object
	 * @param {Object|null} [schema=null] - Optional schema override
	 * @param {Object|null} [layout=null] - Optional layout override
	 * @param {Object<string, import('./lookup.svelte.js').LookupConfig>} [lookups={}] - Lookup configurations
	 */
	constructor(data = {}, schema = null, layout = null, lookups = {}) {
		this.values = new FormValues(data)
		this.definition = new FormDefinition(this.values, schema, layout)
		this.steps = new FormSteps(this.definition)
		this.validationState = new FormValidation({
			values: this.values,
			definition: this.definition,
			steps: this.steps,
			visiblePaths: () => this.#visiblePaths()
		})
		this.lookups = new FormLookups(this.values, lookups)
	}

	/** The underlying lookup manager, or null for a form without lookups. */
	get lookupManager() {
		return this.lookups.manager
	}

	/**
	 * Configure lookups for the form
	 * @param {Object<string, import('./lookup.svelte.js').LookupConfig>} lookups - Lookup configurations
	 */
	setLookups(lookups) {
		this.lookups.configure(lookups)
	}

	/**
	 * Get lookup state for a field
	 * @param {string} fieldPath - Field path
	 * @returns {{ options: any[], loading: boolean, error: string|null, fields: Object, disabled: boolean }|null}
	 */
	getLookupState(fieldPath) {
		return this.lookups.state(fieldPath)
	}

	/** Disabled because a field its lookup depends on is not set yet. */
	isFieldDisabled(path) {
		return this.lookups.isDisabled(path)
	}

	/** Re-fetch one field's lookup with the current data. */
	async refreshLookup(path) {
		await this.lookups.refresh(path)
	}

	hasLookup(fieldPath) {
		return this.lookups.has(fieldPath)
	}

	async initializeLookups() {
		await this.lookups.initialize()
	}

	/**
	 * Update a specific field value
	 * @param {string} path - Field path (e.g., 'count', 'settings/distance')
	 * @param {any} value - New value
	 * @param {boolean} [triggerLookups=true] - Whether to trigger dependent lookups
	 */
	updateField(path, value, triggerLookups = true) {
		this.values.set(path, value)

		// Clear stale validation errors for fields that are now hidden
		this.validationState.clearHidden()

		// Clear and re-fetch the lookups that depend on this field
		if (triggerLookups) this.lookups.fieldChanged(path)
	}

	/**
	 * Get a field value by path
	 * @param {string} path - Field path
	 * @returns {any} Field value
	 */
	getValue(path) {
		return this.values.get(path)
	}

	/** The field paths that currently render — a `showWhen`-hidden field has no element. */
	#visiblePaths() {
		return this.elements.filter((el) => el.scope).map((el) => el.scope.replace(/^#\//, ''))
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
		if (layoutEl.showWhen && !evaluateCondition(layoutEl.showWhen, this.values.data)) return null
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
		const scopedLayout = { ...this.definition.layout, elements: scopedElements }
		const combined = getSchemaWithLayout(this.definition.schema, scopedLayout)

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
			const layoutElements = this.steps.activeElements
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

		if (this.definition.layout.elements) {
			for (const layoutElement of this.definition.layout.elements) {
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
			message: this.validationState.message(fieldPath),
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
				message: this.validationState.message(fieldPath)
			}
		}
	}

	/**
	 * Convert a readonly element to FormElement format
	 * @private
	 */
	#convertReadonlyElement(element, fieldPath, scope, value) {
		const validationMessage = this.validationState.message(fieldPath)
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
	 * Build a standard (non-nested, non-readonly) form element
	 * @private
	 */
	#buildStandardElement(element, fieldPath, scope, value) {
		// `override` is authored on the LAYOUT element (documented in the README and
		// docs/llms as the way to opt a field into the consumer's `child` snippet).
		// getSchemaWithLayout folds unrecognised layout keys into `props`, so reading
		// only `element.override` left it permanently false and the child snippet
		// never rendered. Take it from either position, and keep it out of the props
		// handed to the input component.
		const { override: propsOverride, ...props } = element.props ?? {}
		const type = this.#resolveInputType(props)
		const finalProps = {
			...props,
			type,
			message: this.validationState.message(fieldPath),
			dirty: this.isFieldDirty(fieldPath)
		}
		this.lookups.applyTo(fieldPath, finalProps)
		return {
			scope,
			type,
			value,
			override: element.override || propsOverride || false,
			props: finalProps
		}
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
		/* v8 ignore start -- unreachable: both call sites source elements from the
		   combined map, which #buildCombinedMap populates under `if (el.key)`, so a
		   keyless element never arrives here. `ignore next` does not fire on a
		   single-line `if (...) return`. */
		if (!key) return null
		/* v8 ignore stop */

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
	 * @param {Object|null} message - Validation message object, or null to clear
	 */
	setFieldValidation(fieldPath, message) {
		this.validationState.set(fieldPath, message)
	}

	/** Clear all validation messages */
	clearValidation() {
		this.validationState.clear()
	}

	/**
	 * Validate a single field by path
	 * @param {string} fieldPath - Field path (without '#/' prefix)
	 * @returns {import('./validation.js').ValidationMessage|null} Validation result
	 */
	validateField(fieldPath) {
		return this.validationState.validateField(fieldPath)
	}

	/**
	 * Validate all fields, populate validation state
	 * @returns {Object} Validation results keyed by field path
	 */
	validate() {
		return this.validationState.validateAll()
	}

	/**
	 * Form data with hidden fields' values stripped out. Does not mutate the data.
	 * @returns {Record<string, unknown>}
	 */
	getVisibleData() {
		const visible = new SvelteSet(this.#visiblePaths())
		return Object.fromEntries(Object.entries(this.values.data).filter(([key]) => visible.has(key)))
	}

	/** Whether all fields pass validation (no error-state messages) */
	get isValid() {
		return this.validationState.isValid
	}

	/** @returns {Array<{path: string, state: string, text: string}>} current error messages */
	get errors() {
		return this.validationState.errors
	}

	/** @returns {Array<{path: string, state: string, text: string}>} every message, most severe first */
	get messages() {
		return this.validationState.sorted
	}

	// ── Dirty Tracking ────────────────────────────────────────

	/**
	 * Whether any field has been modified from its initial value
	 * @returns {boolean}
	 */
	get isDirty() {
		return this.values.isDirty
	}

	/**
	 * Set of field paths that differ from their initial values
	 * @returns {Set<string>}
	 */
	get dirtyFields() {
		return this.values.dirtyFields
	}

	/**
	 * Check if a single field has been modified from its initial value
	 * @param {string} fieldPath - Field path (without '#/' prefix)
	 * @returns {boolean}
	 */
	isFieldDirty(fieldPath) {
		return this.values.isFieldDirty(fieldPath)
	}

	/**
	 * Update the initial data snapshot to the current data.
	 * Call after a successful save to clear dirty state.
	 */
	snapshot() {
		this.values.snapshot()
	}

	/**
	 * Reset form data to initial snapshot and clear validation
	 */
	reset() {
		this.values.reset()
		this.validationState.clear()
	}

	// ── Multi-Step ────────────────────────────────────────────

	/** True when the layout contains step elements */
	get isMultiStep() {
		return this.steps.isMultiStep
	}

	/** Number of step elements in the layout */
	get totalSteps() {
		return this.steps.total
	}

	/** Zero-based index of the active step */
	get currentStep() {
		return this.steps.current
	}

	/**
	 * Validate the current step and advance if valid.
	 * @returns {boolean} true if advanced, false if validation failed
	 */
	next() {
		if (!this.validateStep(this.steps.current)) return false
		return this.steps.advance()
	}

	/**
	 * Move to the previous step without validation.
	 * @returns {boolean} true if moved, false if already on first step
	 */
	prev() {
		return this.steps.back()
	}

	/**
	 * Navigate to a previously visited step (index < currentStep).
	 * @param {number} index - Target step index
	 */
	goToStep(index) {
		this.steps.goTo(index)
	}

	/**
	 * Validate all fields in a given step. Defaults to currentStep.
	 * @param {number} [index] - Step index (defaults to currentStep)
	 * @returns {boolean} true if no errors
	 */
	isStepValid(index = this.steps.current) {
		return this.validateStep(index)
	}

	/**
	 * Validate all fields belonging to a step by index.
	 * @param {number} index - Step index
	 * @returns {boolean} true if no errors
	 */
	validateStep(index) {
		return this.validationState.validateStep(index)
	}
}
