import { SvelteSet } from 'svelte/reactivity'
import { validateField as validateOne, validateAll } from '../validation.js'
import { stepPaths } from './FormSteps.svelte.js'

/** Severity order for `sorted`; anything unlisted sorts last. */
const SEVERITY = { error: 0, warning: 1, info: 2, success: 3 }

/**
 * The form's validation messages, keyed by field path, and the ways of producing them.
 *
 * Which fields are VISIBLE is the element builder's knowledge (a hidden `showWhen` field has
 * no element), so it arrives as a function rather than a dependency on the elements — which in
 * turn read these messages.
 */
export class FormValidation {
	#values
	#definition
	#steps
	#visiblePaths
	#map = $state({})

	/**
	 * @param {{
	 *   values: import('./FormValues.svelte.js').FormValues,
	 *   definition: import('./FormDefinition.svelte.js').FormDefinition,
	 *   steps: import('./FormSteps.svelte.js').FormSteps,
	 *   visiblePaths: () => string[]
	 * }} parts
	 */
	constructor({ values, definition, steps, visiblePaths }) {
		this.#values = values
		this.#definition = definition
		this.#steps = steps
		this.#visiblePaths = visiblePaths
	}

	/** Every message, by field path. */
	get map() {
		return this.#map
	}
	set map(value) {
		this.#map = value
	}

	/** One field's message, or null. */
	message(path) {
		return this.#map[path] || null
	}

	/** Set a field's message; a null message removes it. */
	set(path, message) {
		if (message) {
			this.#map = { ...this.#map, [path]: message }
			return
		}
		const { [path]: _removed, ...rest } = this.#map
		this.#map = rest
	}

	clear() {
		this.#map = {}
	}

	/** No message is an error. */
	get isValid() {
		return Object.values(this.#map).every((msg) => msg.state !== 'error')
	}

	/** Error messages, with their paths. */
	get errors() {
		return Object.entries(this.#map)
			.filter(([, msg]) => msg.state === 'error')
			.map(([path, msg]) => ({ path, ...msg }))
	}

	/** Every message with its path, most severe first. */
	get sorted() {
		return Object.entries(this.#map)
			.filter(([, msg]) => msg !== null && msg !== undefined)
			.map(([path, msg]) => ({ path, ...msg }))
			.sort((a, b) => (SEVERITY[a.state] ?? 4) - (SEVERITY[b.state] ?? 4))
	}

	/** Validate one field against its schema, and record the result. Null without a schema. */
	validateField(path) {
		const schema = this.#definition.fieldSchema(path)
		if (!schema) return null
		const result = validateOne(this.#values.get(path), schema, this.#definition.fieldLabel(path))
		this.set(path, result)
		return result
	}

	/**
	 * Validate the whole form. A multi-step form validates every step at once; a flat one keeps
	 * only the results for fields currently visible.
	 */
	validateAll() {
		const { schema, layout } = this.#definition
		if (this.#steps.isMultiStep) {
			const results = validateAll(this.#values.data, schema, {
				...layout,
				elements: this.#steps.allStepElements
			})
			this.#map = results
			return results
		}
		const visible = new SvelteSet(this.#visiblePaths())
		const results = Object.fromEntries(
			Object.entries(validateAll(this.#values.data, schema, layout)).filter(([path]) =>
				visible.has(path)
			)
		)
		this.#map = results
		return results
	}

	/**
	 * Validate one step's fields, replacing their messages and leaving every other field's alone.
	 * A non-step index is trivially valid.
	 */
	validateStep(index) {
		const step = this.#steps.step(index)
		if (!step) return true
		const { schema, layout } = this.#definition
		const results = validateAll(this.#values.data, schema, {
			...layout,
			elements: step.elements ?? []
		})
		for (const path of new SvelteSet(stepPaths(step.elements)))
			this.set(path, results[path] ?? null)
		return Object.values(results).every((msg) => msg?.state !== 'error')
	}

	/** Drop the messages of fields that are no longer visible (a `showWhen` just hid them). */
	clearHidden() {
		const visible = new SvelteSet(this.#visiblePaths())
		const kept = Object.fromEntries(Object.entries(this.#map).filter(([path]) => visible.has(path)))
		if (Object.keys(kept).length !== Object.keys(this.#map).length) this.#map = kept
	}
}
