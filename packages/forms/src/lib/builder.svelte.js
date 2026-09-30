import { SvelteSet } from 'svelte/reactivity'
import { buildElements } from './elements.js'
import { FormValues } from './state/FormValues.svelte.js'
import { FormDefinition } from './state/FormDefinition.svelte.js'
import { FormSteps } from './state/FormSteps.svelte.js'
import { FormValidation } from './state/FormValidation.svelte.js'
import { FormLookups } from './state/FormLookups.svelte.js'

/**
 * The state behind a schema-driven form — a COMPOSITION of job classes (`./state/`), each
 * owning one concern:
 *
 *   values → definition → steps → validation → lookups, and `elements` derived from them all
 *   by the pure `buildElements` (`./elements.js`).
 *
 * It holds almost no logic itself: `next()` (validate the step, then advance), `updateField()`
 * (write, drop hidden messages, re-fetch dependent lookups) and `getVisibleData()` are the only
 * methods that span two jobs. Everything else is the public API FormRenderer, MultiStep and
 * consumers use, kept as delegations so none of them changed when the class was taken apart.
 */
export class FormBuilder {
	/** The form's data and its dirty baseline. */
	values
	/** Schema and layout, and how each derives from the other. */
	definition
	/** Multi-step navigation. */
	steps
	/** Validation messages, and the ways of producing them. Suffixed: `validation` is the public map. */
	validationState
	/** Fields whose options come from elsewhere, and what they depend on. */
	lookups

	/** @type {import('./elements.js').FormElement[]} */
	elements = $derived(buildElements(this.steps.activeElements, this.#elementContext()))

	/**
	 * @param {Record<string, unknown>} [data={}] - Initial data object
	 * @param {Object|null} [schema=null] - Schema; derived from the data when omitted
	 * @param {Object|null} [layout=null] - Layout; derived from the schema, else the data, when omitted
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

	/** The field paths that currently render — a `showWhen`-hidden field has no element. */
	#visiblePaths() {
		return this.elements.filter((el) => el.scope).map((el) => el.scope.replace(/^#\//, ''))
	}

	/**
	 * What the element builder reads. Getters, so the `elements` derivation tracks exactly the
	 * state it touches.
	 * @returns {import('./elements.js').ElementContext}
	 */
	#elementContext() {
		const { definition, values, validationState, lookups } = this
		return {
			get schema() {
				return definition.schema
			},
			get layout() {
				return definition.layout
			},
			get data() {
				return values.data
			},
			value: (path) => values.get(path),
			message: (path) => validationState.message(path),
			dirty: (path) => values.isFieldDirty(path),
			applyLookup: (path, props) => lookups.applyTo(path, props)
		}
	}

	// ─── values ────────────────────────────────────────────────────────────────
	get data() {
		return this.values.data
	}
	set data(value) {
		this.values.data = value
	}
	/** A field's value by slash path (`'settings/distance'`). */
	getValue(path) {
		return this.values.get(path)
	}
	/**
	 * Write a field, then drop messages of fields a `showWhen` just hid, then clear and re-fetch
	 * the lookups that depend on it.
	 * @param {string} path
	 * @param {any} value
	 * @param {boolean} [triggerLookups=true]
	 */
	updateField(path, value, triggerLookups = true) {
		this.values.set(path, value)
		this.validationState.clearHidden()
		if (triggerLookups) this.lookups.fieldChanged(path)
	}
	/** The data without hidden fields' values. Does not mutate the data. */
	getVisibleData() {
		const visible = new SvelteSet(this.#visiblePaths())
		return Object.fromEntries(Object.entries(this.values.data).filter(([key]) => visible.has(key)))
	}
	get isDirty() {
		return this.values.isDirty
	}
	/** Top-level fields that differ from the initial snapshot. */
	get dirtyFields() {
		return this.values.dirtyFields
	}
	isFieldDirty(fieldPath) {
		return this.values.isFieldDirty(fieldPath)
	}
	/** Make the current data the baseline — after a successful save. */
	snapshot() {
		this.values.snapshot()
	}
	/** Restore the baseline and clear every message. */
	reset() {
		this.values.reset()
		this.validationState.clear()
	}

	// ─── definition ────────────────────────────────────────────────────────────
	/** Setting it may re-derive the layout — see FormDefinition. */
	get schema() {
		return this.definition.schema
	}
	set schema(value) {
		this.definition.schema = value
	}
	/** A null layout derives from the schema, else the data. */
	get layout() {
		return this.definition.layout
	}
	set layout(value) {
		this.definition.layout = value
	}
	/** Schema merged with the scoped layout elements. */
	get combined() {
		return this.definition.combined
	}

	// ─── validation ────────────────────────────────────────────────────────────
	/** The validation messages, by field path. */
	get validation() {
		return this.validationState.map
	}
	set validation(value) {
		this.validationState.map = value
	}
	/** @param {string} fieldPath @param {Object|null} message - null clears it */
	setFieldValidation(fieldPath, message) {
		this.validationState.set(fieldPath, message)
	}
	clearValidation() {
		this.validationState.clear()
	}
	/** @returns {import('./validation.js').ValidationMessage|null} */
	validateField(fieldPath) {
		return this.validationState.validateField(fieldPath)
	}
	/** Validate the whole form (every step of a wizard; the visible fields of a flat form). */
	validate() {
		return this.validationState.validateAll()
	}
	/** Validate one step's fields. */
	validateStep(index) {
		return this.validationState.validateStep(index)
	}
	isStepValid(index = this.steps.current) {
		return this.validateStep(index)
	}
	get isValid() {
		return this.validationState.isValid
	}
	/** @returns {Array<{path: string, state: string, text: string}>} */
	get errors() {
		return this.validationState.errors
	}
	/** @returns {Array<{path: string, state: string, text: string}>} most severe first */
	get messages() {
		return this.validationState.sorted
	}

	// ─── steps ─────────────────────────────────────────────────────────────────
	get isMultiStep() {
		return this.steps.isMultiStep
	}
	get totalSteps() {
		return this.steps.total
	}
	get currentStep() {
		return this.steps.current
	}
	get canAdvance() {
		return this.steps.canAdvance
	}
	/** Validate the current step, and advance only if it passes. */
	next() {
		if (!this.validateStep(this.steps.current)) return false
		return this.steps.advance()
	}
	/** Back one step, without validating. */
	prev() {
		return this.steps.back()
	}
	/** Return to a visited step. */
	goToStep(index) {
		this.steps.goTo(index)
	}

	// ─── lookups ───────────────────────────────────────────────────────────────
	/** The underlying lookup manager, or null for a form without lookups. */
	get lookupManager() {
		return this.lookups.manager
	}
	/** @param {Object<string, import('./lookup.svelte.js').LookupConfig>} lookups */
	setLookups(lookups) {
		this.lookups.configure(lookups)
	}
	/** @returns {{ options: any[], loading: boolean, error: string|null, fields: Object, disabled: boolean }|null} */
	getLookupState(fieldPath) {
		return this.lookups.state(fieldPath)
	}
	/** Disabled because a field its lookup depends on is not set yet. */
	isFieldDisabled(path) {
		return this.lookups.isDisabled(path)
	}
	async refreshLookup(path) {
		await this.lookups.refresh(path)
	}
	hasLookup(fieldPath) {
		return this.lookups.has(fieldPath)
	}
	async initializeLookups() {
		await this.lookups.initialize()
	}
}
