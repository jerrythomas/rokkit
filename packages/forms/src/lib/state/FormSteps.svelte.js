/**
 * Every scoped field path in a list of layout elements, nested groups included.
 * @param {Object[] | undefined} elements
 * @returns {string[]}
 */
export function stepPaths(elements) {
	const paths = []
	for (const el of elements ?? []) {
		if (el.scope) paths.push(el.scope.replace(/^#\//, ''))
		if (el.elements) paths.push(...stepPaths(el.elements))
	}
	return paths
}

/**
 * A multi-step (wizard) form: a layout whose top-level elements are `{ type: 'step' }`. Only the
 * active step's elements render. A flat layout has no steps, and all of it is active.
 *
 * Moving forward is `advance()` here; VALIDATING before moving is the form's job, which is why
 * `FormBuilder.next()` checks the step and then calls this.
 */
export class FormSteps {
	#definition
	#current = $state(0)

	/** @param {import('./FormDefinition.svelte.js').FormDefinition} definition */
	constructor(definition) {
		this.#definition = definition
	}

	get #elements() {
		return this.#definition.layout?.elements ?? []
	}

	get isMultiStep() {
		return this.#elements.some((el) => el.type === 'step')
	}
	get total() {
		return this.#elements.filter((el) => el.type === 'step').length
	}
	get current() {
		return this.#current
	}
	canAdvance = $derived(this.#current < this.total - 1)

	/** The step element at an index, or null when there is none. */
	step(index) {
		const el = this.#elements[index]
		return el?.type === 'step' ? el : null
	}

	/** The layout elements that render now: the active step's, or all of a flat layout's. */
	get activeElements() {
		if (!this.isMultiStep) return this.#elements
		return this.#elements[this.#current]?.elements ?? []
	}

	/** Every step's elements, flattened — the whole form, for validating all of it at once. */
	get allStepElements() {
		return this.#elements.filter((el) => el.type === 'step').flatMap((step) => step.elements ?? [])
	}

	advance() {
		if (this.#current >= this.total - 1) return false
		this.#current++
		return true
	}

	back() {
		if (this.#current === 0) return false
		this.#current--
		return true
	}

	/** Return to a step already visited. Forward is only reachable through `next()`. */
	goTo(index) {
		if (index >= this.#current) throw new Error('Cannot navigate forward to an unvisited step')
		this.#current = index
	}
}
