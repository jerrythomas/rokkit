import { createLookupManager } from '../lookup.svelte.js'

/**
 * Fields whose options come from elsewhere — a URL, an async hook, or a filtered source — and
 * the fields they depend on.
 *
 * A form with no lookups has no manager at all, and every question here answers safely.
 */
export class FormLookups {
	#values
	/** @type {ReturnType<typeof createLookupManager> | null} */
	#manager = $state(null)

	/**
	 * @param {import('./FormValues.svelte.js').FormValues} values
	 * @param {Object<string, import('../lookup.svelte.js').LookupConfig>} lookups
	 */
	constructor(values, lookups = {}) {
		this.#values = values
		if (Object.keys(lookups).length > 0) this.#manager = createLookupManager(lookups)
	}

	get manager() {
		return this.#manager
	}

	/** Replace the lookups. Always builds a manager, even for none — as `setLookups` always has. */
	configure(lookups) {
		this.#manager = createLookupManager(lookups)
	}

	/** @param {string} path */
	#lookup(path) {
		return this.#manager?.getLookup(path)
	}

	/** A field's options, loading, error, fields and disabled — or null when it has no lookup. */
	state(path) {
		const lookup = this.#lookup(path)
		if (!lookup) return null
		const { options, loading, error, fields, disabled } = lookup
		return { options, loading, error, fields, disabled }
	}

	/** Disabled because a field it depends on is not set yet. */
	isDisabled(path) {
		return this.#lookup(path)?.disabled ?? false
	}

	has(path) {
		return this.#manager?.hasLookup(path) ?? false
	}

	async refresh(path) {
		await this.#lookup(path)?.fetch(this.#values.data)
	}

	async initialize() {
		await this.#manager?.initialize(this.#values.data)
	}

	/**
	 * A field changed: clear the (top-level) values of lookups that depend on it — their options
	 * are about to change under them — then re-fetch those lookups.
	 */
	fieldChanged(path) {
		if (!this.#manager) return
		for (const [depPath, lookup] of this.#manager.lookups) {
			if (lookup.dependsOn.includes(path) && !depPath.includes('/')) this.#values.set(depPath, null)
		}
		this.#manager.handleFieldChange(path, this.#values.data)
	}

	/** Fold a field's lookup state into an element's props (mutates them). */
	applyTo(path, props) {
		const state = this.state(path)
		if (!state) return
		applyOptions(state, props)
		applyAvailability(state, props)
	}
}

/** Options and loading. */
function applyOptions(state, props) {
	if (state.options?.length > 0) props.options = state.options
	if (state.loading) props.loading = true
}

/** Disabled, and the option field mapping unless the element sets its own. */
function applyAvailability(state, props) {
	if (state.disabled) props.disabled = true
	if (state.fields && !props.fields) props.fields = state.fields
}
