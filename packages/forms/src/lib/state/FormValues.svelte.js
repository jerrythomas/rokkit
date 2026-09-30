import { SvelteSet } from 'svelte/reactivity'
import { deepClone, deepEqual, getPath, setPath } from '../values.js'

/**
 * A form's data, and how it differs from where it started.
 *
 * The initial snapshot is deliberately NOT reactive: it is a baseline, read by the dirty
 * getters, and taking a new one (after a save) must not by itself re-render anything.
 */
export class FormValues {
	#data = $state({})
	#initial = {}

	/** @param {Record<string, unknown>} data */
	constructor(data = {}) {
		this.#data = data
		this.#initial = deepClone(data)
	}

	get data() {
		return this.#data
	}
	set data(value) {
		this.#data = value
	}

	/** @param {string} path */
	get(path) {
		return getPath(this.#data, path)
	}

	/** Write one value; the data gets a new root, so readers of `data` re-run. */
	set(path, value) {
		this.#data = path.includes('/')
			? setPath(this.#data, path, value)
			: { ...this.#data, [path]: value }
	}

	/** The value a path held in the snapshot. */
	initial(path) {
		return getPath(this.#initial, path)
	}

	get isDirty() {
		return !deepEqual(this.#data, this.#initial)
	}

	/** Top-level keys whose value differs from the snapshot. */
	get dirtyFields() {
		const current = this.#data ?? {}
		const keys = new SvelteSet([...Object.keys(current), ...Object.keys(this.#initial ?? {})])
		return new SvelteSet([...keys].filter((k) => !deepEqual(current[k], this.#initial?.[k])))
	}

	/** @param {string} path */
	isFieldDirty(path) {
		return !deepEqual(this.get(path), this.initial(path))
	}

	/** Make the current data the new baseline — after a successful save. */
	snapshot() {
		this.#initial = deepClone(this.#data)
	}

	/** Restore the baseline. */
	reset() {
		this.#data = deepClone(this.#initial)
	}
}
